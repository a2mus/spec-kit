"""
Alert Manager for BeagleBone
============================
Monitors activity patterns and triggers LOCAL alerts for anomalies.
Works independently of backend - immediate local notification.
"""

from enum import Enum
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from local_database import LocalDatabase


class AlertType(Enum):
    """Types of alerts that can be triggered locally."""
    EXTENDED_LYING = "extended_lying"          # Lying > 4 hours
    EXTENDED_RESTING = "extended_resting"      # Resting > 6 hours  
    SUDDEN_INACTIVITY = "sudden_inactivity"    # Active → inactive suddenly
    HIGH_AGITATION = "high_agitation"          # MOV > 200 sustained
    POSSIBLE_DISTRESS = "possible_distress"    # Combination of indicators
    LOW_BATTERY = "low_battery"                # Battery below threshold


class AlertSeverity(Enum):
    """Alert severity levels."""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class Alert:
    """Represents an alert to be triggered."""
    collar_id: int
    alert_type: AlertType
    severity: AlertSeverity
    message: str
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
    
    def to_dict(self) -> dict:
        return {
            'collar_id': self.collar_id,
            'alert_type': self.alert_type.value,
            'severity': self.severity.value,
            'message': self.message,
            'timestamp': self.timestamp.isoformat()
        }


class AlertManager:
    """
    Monitors activity patterns and triggers local alerts.
    
    Alert Thresholds (configurable):
    - Extended lying: > 4 hours continuous
    - Extended resting: > 6 hours continuous
    - High agitation: MOV > 200 for > 5 minutes
    """
    
    # Default thresholds (in seconds unless noted)
    DEFAULT_THRESHOLDS = {
        'extended_lying_sec': 4 * 60 * 60,      # 4 hours
        'extended_resting_sec': 6 * 60 * 60,    # 6 hours
        'high_agitation_mov': 200,               # MOV threshold
        'high_agitation_duration_sec': 5 * 60,   # 5 minutes
        'low_battery_voltage': 3.3,              # Volts
        'sudden_inactivity_drop': 150,           # MOV drop threshold
    }
    
    def __init__(self, db: Optional['LocalDatabase'] = None,
                 thresholds: Optional[Dict] = None):
        self.db = db
        self.thresholds = self.DEFAULT_THRESHOLDS.copy()
        if thresholds:
            self.thresholds.update(thresholds)
        
        # Track state per collar for pattern detection
        self.collar_states: Dict[int, Dict] = {}
    
    def _get_collar_state(self, collar_id: int) -> Dict:
        """Get or create state tracker for a collar."""
        if collar_id not in self.collar_states:
            self.collar_states[collar_id] = {
                'last_activity': None,
                'activity_start': None,
                'high_mov_start': None,
                'last_mov': 0,
                'alerts_triggered': set(),  # Prevent duplicate alerts
            }
        return self.collar_states[collar_id]
    
    def check_activity(self, collar_id: int, activity_type: str, 
                       mov: float, timestamp: Optional[datetime] = None) -> List[Alert]:
        """
        Check for alert conditions based on current activity.
        
        Args:
            collar_id: Collar identifier
            activity_type: Current classified activity ('lying', 'resting', etc.)
            mov: Current movement intensity (0-255)
            timestamp: Optional timestamp (defaults to now)
            
        Returns:
            List of triggered alerts
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        state = self._get_collar_state(collar_id)
        alerts = []
        
        # Track activity duration
        if state['last_activity'] != activity_type:
            state['last_activity'] = activity_type
            state['activity_start'] = timestamp
            state['alerts_triggered'].clear()  # Reset alerts for new activity
        
        # Check extended lying
        if activity_type == 'lying' and state['activity_start']:
            duration = (timestamp - state['activity_start']).total_seconds()
            if duration > self.thresholds['extended_lying_sec']:
                alert_key = f"extended_lying_{int(duration // 3600)}h"
                if alert_key not in state['alerts_triggered']:
                    state['alerts_triggered'].add(alert_key)
                    hours = duration / 3600
                    alerts.append(Alert(
                        collar_id=collar_id,
                        alert_type=AlertType.EXTENDED_LYING,
                        severity=AlertSeverity.WARNING if hours < 6 else AlertSeverity.CRITICAL,
                        message=f"Cattle has been lying for {hours:.1f} hours"
                    ))
        
        # Check extended resting
        if activity_type == 'resting' and state['activity_start']:
            duration = (timestamp - state['activity_start']).total_seconds()
            if duration > self.thresholds['extended_resting_sec']:
                alert_key = f"extended_resting_{int(duration // 3600)}h"
                if alert_key not in state['alerts_triggered']:
                    state['alerts_triggered'].add(alert_key)
                    hours = duration / 3600
                    alerts.append(Alert(
                        collar_id=collar_id,
                        alert_type=AlertType.EXTENDED_RESTING,
                        severity=AlertSeverity.WARNING if hours < 8 else AlertSeverity.CRITICAL,
                        message=f"Cattle has been inactive for {hours:.1f} hours"
                    ))
        
        # Check high agitation
        if mov > self.thresholds['high_agitation_mov']:
            if state['high_mov_start'] is None:
                state['high_mov_start'] = timestamp
            else:
                agitation_duration = (timestamp - state['high_mov_start']).total_seconds()
                if agitation_duration > self.thresholds['high_agitation_duration_sec']:
                    if 'high_agitation' not in state['alerts_triggered']:
                        state['alerts_triggered'].add('high_agitation')
                        alerts.append(Alert(
                            collar_id=collar_id,
                            alert_type=AlertType.HIGH_AGITATION,
                            severity=AlertSeverity.CRITICAL,
                            message=f"High agitation detected for {agitation_duration/60:.1f} minutes (MOV={mov:.0f})"
                        ))
        else:
            state['high_mov_start'] = None
        
        # Check sudden inactivity (rapid MOV drop)
        if state['last_mov'] - mov > self.thresholds['sudden_inactivity_drop']:
            if 'sudden_inactivity' not in state['alerts_triggered']:
                state['alerts_triggered'].add('sudden_inactivity')
                alerts.append(Alert(
                    collar_id=collar_id,
                    alert_type=AlertType.SUDDEN_INACTIVITY,
                    severity=AlertSeverity.WARNING,
                    message=f"Sudden drop in activity: {state['last_mov']:.0f} → {mov:.0f}"
                ))
        
        state['last_mov'] = mov
        
        # Store alerts in database if available
        if self.db and alerts:
            for alert in alerts:
                self.db.store_alert(
                    collar_id=alert.collar_id,
                    alert_type=alert.alert_type.value,
                    message=alert.message,
                    severity=alert.severity.value
                )
        
        return alerts
    
    def check_battery(self, collar_id: int, voltage: float) -> Optional[Alert]:
        """Check for low battery alert."""
        if voltage < self.thresholds['low_battery_voltage']:
            state = self._get_collar_state(collar_id)
            if 'low_battery' not in state['alerts_triggered']:
                state['alerts_triggered'].add('low_battery')
                alert = Alert(
                    collar_id=collar_id,
                    alert_type=AlertType.LOW_BATTERY,
                    severity=AlertSeverity.WARNING,
                    message=f"Low battery: {voltage:.2f}V"
                )
                if self.db:
                    self.db.store_alert(
                        collar_id=collar_id,
                        alert_type=alert.alert_type.value,
                        message=alert.message,
                        severity=alert.severity.value
                    )
                return alert
        return None
    
    def trigger_alert(self, alert: Alert) -> None:
        """
        Trigger an alert - log and activate local notification.
        
        In production, this would:
        - Activate buzzer/LED on BeagleBone
        - Log to local display
        - Queue for SMS/push notification when connected
        """
        severity_emoji = {
            AlertSeverity.INFO: "ℹ️",
            AlertSeverity.WARNING: "⚠️",
            AlertSeverity.CRITICAL: "🚨"
        }
        
        emoji = severity_emoji.get(alert.severity, "❓")
        print(f"\n{emoji} LOCAL ALERT [{alert.severity.value.upper()}]")
        print(f"   Collar: {alert.collar_id}")
        print(f"   Type: {alert.alert_type.value}")
        print(f"   Message: {alert.message}")
        print(f"   Time: {alert.timestamp.strftime('%H:%M:%S')}")
        
        # TODO: In production, add GPIO control for buzzer/LED
        # self._activate_buzzer(alert.severity)
        # self._set_led_color(alert.severity)
    
    def reset_collar(self, collar_id: int) -> None:
        """Reset state tracking for a collar."""
        if collar_id in self.collar_states:
            del self.collar_states[collar_id]
    
    def get_active_alerts_summary(self) -> Dict:
        """Get summary of currently tracked alert states."""
        summary = {
            'collars_with_extended_activity': [],
            'collars_with_agitation': [],
        }
        
        now = datetime.now()
        for collar_id, state in self.collar_states.items():
            if state['activity_start']:
                duration = (now - state['activity_start']).total_seconds()
                if state['last_activity'] in ['lying', 'resting'] and duration > 3600:
                    summary['collars_with_extended_activity'].append({
                        'collar_id': collar_id,
                        'activity': state['last_activity'],
                        'duration_hours': duration / 3600
                    })
            
            if state['high_mov_start']:
                summary['collars_with_agitation'].append(collar_id)
        
        return summary

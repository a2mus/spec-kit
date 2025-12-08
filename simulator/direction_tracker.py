"""
Direction Tracker for Virtual Fencing
=======================================
Tracks cattle movement direction relative to fence boundaries.
Determines if cattle is moving toward (exiting) or away from (entering) the fence.
Enables return path suppression for humane alert management.
"""

import math
from collections import deque
from datetime import datetime
from typing import Optional, Tuple, List, Dict
from dataclasses import dataclass


@dataclass
class PositionSample:
    """A single position sample with timestamp and distance to fence."""
    timestamp: datetime
    latitude: float
    longitude: float
    distance_to_fence: float


class DirectionTracker:
    """
    Tracks movement direction relative to fence boundaries.
    
    Uses a sliding window of recent positions to calculate:
    - Movement direction (toward/away from fence)
    - Velocity (speed and heading)
    - Whether cattle is returning to safe zone
    """
    
    DIRECTION_ENTERING = 'entering'    # Moving toward safe zone (away from fence)
    DIRECTION_EXITING = 'exiting'      # Moving toward fence (dangerous)
    DIRECTION_STATIONARY = 'stationary'
    DIRECTION_PARALLEL = 'parallel'    # Moving along fence edge
    
    # Thresholds
    MIN_MOVEMENT_METERS = 1.0          # Minimum movement to detect direction
    VELOCITY_THRESHOLD = 0.1           # m/s - below this is stationary
    PARALLEL_ANGLE_THRESHOLD = 15      # degrees - angle to fence normal
    WINDOW_SIZE = 5                    # Number of samples to keep
    
    def __init__(self, collar_id: int, window_size: int = 5):
        self.collar_id = collar_id
        self.window_size = window_size
        self.position_history: deque = deque(maxlen=window_size)
        
        # State tracking
        self.current_direction = self.DIRECTION_STATIONARY
        self.is_returning = False
        self.last_alert_zone = 'safe'  # Track which zone triggered last alert
        self.alert_armed = True        # Whether alerts are armed
        
        # Escalation tracking
        self.escalation_start_time: Optional[datetime] = None
        self.current_escalation_stage = 0  # 0 = none, 1 = warning_1, 2 = warning_2, 3 = breach
        
    def add_position(self, lat: float, lon: float, distance_to_fence: float, 
                     timestamp: Optional[datetime] = None) -> None:
        """Add a new position sample to the history."""
        if timestamp is None:
            timestamp = datetime.now()
            
        sample = PositionSample(
            timestamp=timestamp,
            latitude=lat,
            longitude=lon,
            distance_to_fence=distance_to_fence
        )
        self.position_history.append(sample)
        
    def get_direction(self) -> str:
        """
        Calculate movement direction relative to fence.
        
        Returns:
            Direction string: 'entering', 'exiting', 'stationary', 'parallel'
        """
        if len(self.position_history) < 2:
            return self.DIRECTION_STATIONARY
        
        # Get oldest and newest samples
        oldest = self.position_history[0]
        newest = self.position_history[-1]
        
        # Calculate distance change (positive = moving away from fence = entering)
        distance_change = newest.distance_to_fence - oldest.distance_to_fence
        
        # Calculate actual movement distance
        movement_distance = self._haversine(
            oldest.latitude, oldest.longitude,
            newest.latitude, newest.longitude
        )
        
        # Check if stationary
        if movement_distance < self.MIN_MOVEMENT_METERS:
            self.current_direction = self.DIRECTION_STATIONARY
            return self.current_direction
        
        # Calculate elapsed time
        time_diff = (newest.timestamp - oldest.timestamp).total_seconds()
        if time_diff <= 0:
            return self.DIRECTION_STATIONARY
        
        # Calculate velocity
        velocity = movement_distance / time_diff
        
        if velocity < self.VELOCITY_THRESHOLD:
            self.current_direction = self.DIRECTION_STATIONARY
            return self.current_direction
        
        # Determine direction based on distance change
        # If distance_change > 0, cattle is moving AWAY from fence (toward safe)
        # If distance_change < 0, cattle is moving TOWARD fence (exiting)
        if abs(distance_change) < 0.5:  # Less than 0.5m change - likely parallel
            self.current_direction = self.DIRECTION_PARALLEL
        elif distance_change > 0:
            self.current_direction = self.DIRECTION_ENTERING
            self.is_returning = True
        else:
            self.current_direction = self.DIRECTION_EXITING
            self.is_returning = False
            
        return self.current_direction
    
    def check_returning(self) -> bool:
        """
        Check if cattle is returning toward safe zone.
        
        Returns:
            True if cattle is moving back toward safe zone (increasing distance from fence)
        """
        if len(self.position_history) < 2:
            return False
        
        # Check trend over last few samples
        if len(self.position_history) >= 3:
            distances = [p.distance_to_fence for p in list(self.position_history)[-3:]]
            # Cattle is returning if distance is consistently increasing
            increasing = all(distances[i] < distances[i+1] for i in range(len(distances)-1))
            if increasing:
                self.is_returning = True
                return True
        
        return self.is_returning
    
    def get_velocity_vector(self) -> Tuple[float, float, float]:
        """
        Calculate velocity vector for display.
        
        Returns:
            Tuple of (speed_mps, heading_degrees, distance_change_per_sec)
        """
        if len(self.position_history) < 2:
            return (0.0, 0.0, 0.0)
        
        oldest = self.position_history[0]
        newest = self.position_history[-1]
        
        time_diff = (newest.timestamp - oldest.timestamp).total_seconds()
        if time_diff <= 0:
            return (0.0, 0.0, 0.0)
        
        # Calculate movement
        movement_distance = self._haversine(
            oldest.latitude, oldest.longitude,
            newest.latitude, newest.longitude
        )
        speed = movement_distance / time_diff
        
        # Calculate heading
        heading = self._calculate_heading(
            oldest.latitude, oldest.longitude,
            newest.latitude, newest.longitude
        )
        
        # Calculate distance change rate
        distance_change = newest.distance_to_fence - oldest.distance_to_fence
        distance_rate = distance_change / time_diff
        
        return (speed, heading, distance_rate)
    
    def should_suppress_alert(self, current_zone: str) -> bool:
        """
        Determine if alerts should be suppressed (return path encouragement).
        
        Alerts are suppressed when:
        - Cattle is moving back toward safe zone (is_returning = True)
        - Cattle is in a less critical zone than before
        
        Args:
            current_zone: Current alert zone ('safe', 'warning_1', 'warning_2', 'breach')
            
        Returns:
            True if alerts should be suppressed
        """
        zone_severity = {'safe': 0, 'warning_1': 1, 'warning_2': 2, 'breach': 3}
        
        # If returning and moving to less severe zone, suppress
        if self.is_returning:
            current_severity = zone_severity.get(current_zone, 0)
            last_severity = zone_severity.get(self.last_alert_zone, 0)
            
            if current_severity < last_severity:
                return True
        
        return False
    
    def reset_for_safe_zone(self) -> None:
        """Reset state when cattle returns to safe zone."""
        self.is_returning = False
        self.last_alert_zone = 'safe'
        self.alert_armed = True
        self.escalation_start_time = None
        self.current_escalation_stage = 0
        
    def update_alert_zone(self, zone: str) -> None:
        """Update the last alert zone (for return suppression logic)."""
        zone_severity = {'safe': 0, 'warning_1': 1, 'warning_2': 2, 'breach': 3}
        
        # Only update if more severe (escalating)
        if zone_severity.get(zone, 0) > zone_severity.get(self.last_alert_zone, 0):
            self.last_alert_zone = zone
            
    def start_escalation(self, stage: int) -> None:
        """Start escalation timer for a given stage."""
        if self.escalation_start_time is None:
            self.escalation_start_time = datetime.now()
        self.current_escalation_stage = stage
        
    def can_escalate(self, min_delay_seconds: float = 5.0) -> bool:
        """Check if enough time has passed for escalation."""
        if self.escalation_start_time is None:
            return True
        
        elapsed = (datetime.now() - self.escalation_start_time).total_seconds()
        return elapsed >= min_delay_seconds
    
    def get_position_history(self) -> List[Dict]:
        """Get position history as list of dicts for syncing."""
        return [
            {
                'timestamp': p.timestamp.isoformat(),
                'latitude': p.latitude,
                'longitude': p.longitude,
                'distance_to_fence': p.distance_to_fence
            }
            for p in self.position_history
        ]
    
    @staticmethod
    def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate great-circle distance between two points in meters."""
        R = 6371000  # Earth's radius in meters
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    @staticmethod
    def _calculate_heading(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate heading from point 1 to point 2 in degrees."""
        delta_lon = math.radians(lon2 - lon1)
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        
        x = math.sin(delta_lon) * math.cos(lat2_rad)
        y = math.cos(lat1_rad) * math.sin(lat2_rad) - \
            math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(delta_lon)
        
        heading = math.atan2(x, y)
        heading = math.degrees(heading)
        heading = (heading + 360) % 360
        
        return heading

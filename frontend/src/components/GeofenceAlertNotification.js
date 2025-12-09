import React, { useState, useEffect, useCallback } from 'react';

/**
 * GeofenceAlertNotification Component
 * 
 * Displays toast notifications when collar alert states change.
 * Auto-dismisses after 5 seconds unless manually closed.
 */
function GeofenceAlertNotification({ collars, previousCollarsRef }) {
    const [alerts, setAlerts] = useState([]);

    const getAlertInfo = (alertState, direction, actionTaken) => {
        // Direction-aware text for approaching boundary scenarios
        const getApproachText = () => {
            if (direction === 'exiting') return 'Cattle approaching boundary';
            if (direction === 'entering') return 'Cattle moving to safe zone';
            if (direction === 'stationary') return 'Cattle stationary near boundary';
            return '';
        };

        // Check for outside fence detection (special case)
        if (actionTaken === 'notification_farmer') {
            return {
                icon: '🚨',
                title: 'CATTLE OUTSIDE FENCE',
                message: 'Cattle detected outside fence boundary but entering - farmer notified silently.',
                severity: 'outside'
            };
        }

        const info = {
            'warning_1': {
                icon: '🔊',
                title: direction === 'exiting' ? 'Approaching Boundary' : 'Near Boundary',
                message: `${getApproachText()} - entered warning zone (10-15m from edge).`,
                severity: 'warning'
            },
            'warning_2': {
                icon: '🔊🔊',
                title: direction === 'exiting' ? 'Close to Boundary' : 'Near Boundary',
                message: `${getApproachText()} - very close to fence boundary (5-10m).`,
                severity: 'warning'
            },
            'breach': {
                icon: '⚡',
                title: 'BOUNDARY BREACH',
                message: actionTaken === 'shock_disabled'
                    ? 'Cattle breached boundary - SHOCK DISABLED (stress detected)'
                    : 'Electric shock signal activated - cattle has breached the fence!',
                severity: 'critical'
            }
        };
        return info[alertState] || null;
    };

    // Check for alert state changes
    useEffect(() => {
        if (!previousCollarsRef.current) {
            previousCollarsRef.current = collars;
            return;
        }

        const newAlerts = [];

        collars.forEach(collar => {
            const prevCollar = previousCollarsRef.current.find(
                c => c.collar_id === collar.collar_id
            );

            // Check if alert state changed OR if outside fence detected (notification_farmer)
            const stateChanged = prevCollar && collar.alert_state !== prevCollar.alert_state;
            const outsideDetected = collar.alert_action_taken === 'notification_farmer' &&
                (!prevCollar || prevCollar.alert_action_taken !== 'notification_farmer');

            if (stateChanged || outsideDetected) {
                // Case 1: Outside fence detected (cattle entering from outside)
                if (outsideDetected) {
                    const alertInfo = getAlertInfo(collar.alert_state, collar.direction, collar.alert_action_taken);
                    if (alertInfo) {
                        newAlerts.push({
                            id: `${collar.collar_id}-${Date.now()}-outside`,
                            collar_id: collar.collar_id,
                            cattle_name: collar.cattle_name,
                            alert_state: 'outside',
                            ...alertInfo,
                            timestamp: new Date()
                        });
                    }
                }
                // Case 2: Returned to safe zone (Previous was not safe, current IS safe)
                else if (collar.alert_state === 'safe' && prevCollar.alert_state !== 'safe') {
                    newAlerts.push({
                        id: `${collar.collar_id}-${Date.now()}-safe`,
                        collar_id: collar.collar_id,
                        cattle_name: collar.cattle_name,
                        alert_state: 'safe',
                        icon: '✅',
                        title: 'Returned to Safe Zone',
                        message: 'Cattle has returned to the safe zone.',
                        severity: 'success',
                        timestamp: new Date()
                    });
                }
                // Case 3: Entered an alert state (Current is NOT safe)
                else if (collar.alert_state !== 'safe') {
                    const alertInfo = getAlertInfo(collar.alert_state, collar.direction, collar.alert_action_taken);
                    if (alertInfo) {
                        newAlerts.push({
                            id: `${collar.collar_id}-${Date.now()}`,
                            collar_id: collar.collar_id,
                            cattle_name: collar.cattle_name,
                            alert_state: collar.alert_state,
                            ...alertInfo,
                            timestamp: new Date()
                        });
                    }
                }
            }
        });

        if (newAlerts.length > 0) {
            setAlerts(prev => [...newAlerts, ...prev].slice(0, 5)); // Keep max 5 alerts
        }

        previousCollarsRef.current = collars;
    }, [collars, previousCollarsRef]);

    // Auto-dismiss alerts after 5 seconds
    useEffect(() => {
        if (alerts.length === 0) return;

        const timer = setTimeout(() => {
            setAlerts(prev => prev.slice(0, -1));
        }, 5000);

        return () => clearTimeout(timer);
    }, [alerts]);

    const dismissAlert = useCallback((alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }, []);

    if (alerts.length === 0) return null;

    return (
        <div className="geofence-alert-toast">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`geofence-alert-item ${alert.severity}`}
                >
                    <div className="geofence-alert-icon">{alert.icon}</div>
                    <div className="geofence-alert-content">
                        <div className="geofence-alert-title">
                            {alert.title} - Collar #{alert.collar_id}
                            {alert.cattle_name && ` (${alert.cattle_name})`}
                        </div>
                        <div className="geofence-alert-message">
                            {alert.message}
                        </div>
                    </div>
                    <button
                        className="geofence-alert-close"
                        onClick={() => dismissAlert(alert.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}

export default GeofenceAlertNotification;

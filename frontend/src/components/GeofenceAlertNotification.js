import React, { useState, useEffect, useCallback } from 'react';

/**
 * GeofenceAlertNotification Component
 * 
 * Displays toast notifications when collar alert states change.
 * Auto-dismisses after 5 seconds unless manually closed.
 */
function GeofenceAlertNotification({ collars, previousCollarsRef }) {
    const [alerts, setAlerts] = useState([]);

    const getAlertInfo = (alertState) => {
        const info = {
            'warning_1': {
                icon: '🔊',
                title: 'Approaching Boundary',
                message: 'Collar has entered the warning zone (10-15m from fence)',
                severity: 'warning'
            },
            'warning_2': {
                icon: '🔊🔊',
                title: 'Near Boundary',
                message: 'Collar is very close to fence boundary (5-10m)',
                severity: 'warning'
            },
            'breach': {
                icon: '⚡',
                title: 'BOUNDARY BREACH',
                message: 'Electric shock signal activated - collar has breached the fence',
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

            // Check if alert state changed and is now in an alert state
            if (prevCollar &&
                collar.alert_state !== prevCollar.alert_state &&
                collar.alert_state !== 'safe') {

                const alertInfo = getAlertInfo(collar.alert_state);
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
                    className={`geofence-alert-item ${alert.alert_state}`}
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

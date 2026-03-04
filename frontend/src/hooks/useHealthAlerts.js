import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * useHealthAlerts Hook
 * 
 * Polls the backend for health-related anomalies and manages 
 * shown vs dismissed alerts.
 */
const API_URL = 'http://localhost:3001';

export const useHealthAlerts = (intervalMs = 30000) => {
    const [healthAlerts, setHealthAlerts] = useState([]);
    const [summary, setSummary] = useState({ warning: 0, critical: 0, total: 0 });
    const dismissedAlertIds = useRef(new Set());

    const fetchAlerts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/activity/alerts?lookback_hours=24`);
            const allAlerts = response.data.alerts || [];

            // Filter out dismissed alerts
            const activeAlerts = allAlerts.filter(alert => {
                const alertId = `${alert.collar_id}-${alert.alert_type}-${alert.detected_at}`;
                return !dismissedAlertIds.current.has(alertId);
            });

            setHealthAlerts(activeAlerts);
            setSummary({
                warning: response.data.summary?.by_severity?.warning || 0,
                critical: response.data.summary?.by_severity?.critical || 0,
                total: allAlerts.length
            });
        } catch (error) {
            console.error('Error fetching health alerts:', error);
        }
    };

    const dismissAlert = (alert) => {
        const alertId = `${alert.collar_id}-${alert.alert_type}-${alert.detected_at}`;
        dismissedAlertIds.current.add(alertId);
        setHealthAlerts(prev => prev.filter(a => {
            const id = `${a.collar_id}-${a.alert_type}-${a.detected_at}`;
            return id !== alertId;
        }));
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, intervalMs);
        return () => clearInterval(interval);
    }, [intervalMs]);

    return { healthAlerts, summary, dismissAlert, refresh: fetchAlerts };
};

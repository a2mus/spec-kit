import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Heart,
    Thermometer,
    Battery,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Droplets
} from 'lucide-react';
import './HealthMonitor.css';

const API_URL = 'http://localhost:3001';

// Health thresholds
const THRESHOLDS = {
    body_temp: { min: 37.5, max: 39.5, unit: '°C' },
    heart_rate: { min: 48, max: 84, unit: 'BPM' },
    spo2: { min: 95, max: 100, unit: '%' },
    battery_voltage: { min: 3.5, max: 4.2, unit: 'V' }
};

// Get collar status based on all vitals
const getCollarStatus = (collar) => {
    // Check for critical conditions
    if (collar.body_temp > 40 || collar.body_temp < 37) return 'alert';
    if (collar.battery_voltage < 3.0) return 'alert';
    if (collar.heart_rate && (collar.heart_rate > 100 || collar.heart_rate < 40)) return 'alert';
    if (collar.spo2 && collar.spo2 < 90) return 'alert';

    // Check for warning conditions
    if (collar.body_temp > 39.5 || collar.body_temp < 37.5) return 'warning';
    if (collar.battery_voltage < 3.3) return 'warning';
    if (collar.heart_rate && (collar.heart_rate > 84 || collar.heart_rate < 48)) return 'warning';
    if (collar.spo2 && collar.spo2 < 95) return 'warning';

    return 'healthy';
};

// Get issue description
const getIssues = (collar) => {
    const issues = [];
    if (collar.body_temp > 40) issues.push('High temperature');
    else if (collar.body_temp < 37) issues.push('Low temperature');
    else if (collar.body_temp > 39.5) issues.push('Elevated temperature');

    if (collar.battery_voltage < 3.0) issues.push('Critical battery');
    else if (collar.battery_voltage < 3.3) issues.push('Low battery');

    if (collar.heart_rate) {
        if (collar.heart_rate > 100) issues.push('Tachycardia');
        else if (collar.heart_rate < 40) issues.push('Bradycardia');
        else if (collar.heart_rate > 84 || collar.heart_rate < 48) issues.push('Irregular heart rate');
    }

    if (collar.spo2) {
        if (collar.spo2 < 90) issues.push('Critical SpO2');
        else if (collar.spo2 < 95) issues.push('Low SpO2');
    }

    return issues;
};

function HealthMonitor() {
    const [collars, setCollars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/collars/latest`);
                setCollars(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Calculate stats
    const healthyCount = collars.filter(c => getCollarStatus(c) === 'healthy').length;
    const warningCount = collars.filter(c => getCollarStatus(c) === 'warning').length;
    const alertCount = collars.filter(c => getCollarStatus(c) === 'alert').length;
    const healthPercentage = collars.length > 0
        ? Math.round((healthyCount / collars.length) * 100)
        : 0;

    // Get alerts
    const alerts = collars
        .filter(c => getCollarStatus(c) !== 'healthy')
        .map(c => ({
            ...c,
            status: getCollarStatus(c),
            issues: getIssues(c)
        }))
        .sort((a, b) => (a.status === 'alert' ? -1 : 1));

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="health-monitor">
            {/* Summary Cards */}
            <div className="grid grid-cols-4">
                <div className="stat-card teal">
                    <div className="stat-card-icon">
                        <Heart size={24} />
                    </div>
                    <div className="stat-card-value">{healthPercentage}%</div>
                    <div className="stat-card-label">Overall Herd Health</div>
                    <div className="stat-card-trend">{healthyCount} cattle healthy</div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-card-value">{healthyCount}</div>
                    <div className="stat-card-label">Healthy</div>
                    <div className="stat-card-trend">No issues detected</div>
                </div>

                <div className="stat-card amber">
                    <div className="stat-card-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-card-value">{warningCount}</div>
                    <div className="stat-card-label">Under Observation</div>
                    <div className="stat-card-trend">Requires monitoring</div>
                </div>

                <div className="stat-card red">
                    <div className="stat-card-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-card-value">{alertCount}</div>
                    <div className="stat-card-label">Critical Alerts</div>
                    <div className="stat-card-trend">Immediate attention needed</div>
                </div>
            </div>

            {/* Alert Priorities Table */}
            {alerts.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Alert Priorities</h3>
                        <span className="badge badge-alert">{alerts.length} active</span>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Priority</th>
                                    <th>Collar ID</th>
                                    <th>Cattle</th>
                                    <th>Issues</th>
                                    <th>Vitals</th>
                                    <th>Last Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alerts.map(alert => (
                                    <tr key={alert.collar_id}>
                                        <td>
                                            <span className={`badge badge-${alert.status === 'alert' ? 'alert' : 'warning'}`}>
                                                {alert.status === 'alert' ? 'High' : 'Medium'}
                                            </span>
                                        </td>
                                        <td><strong>#{alert.collar_id}</strong></td>
                                        <td>{alert.cattle_name || '-'}</td>
                                        <td>
                                            {alert.issues.map((issue, i) => (
                                                <span key={i} className="issue-tag">{issue}</span>
                                            ))}
                                        </td>
                                        <td className="vitals-cell">
                                            <span title="Body Temp">🌡️ {alert.body_temp}°C</span>
                                            {alert.heart_rate && <span title="Heart Rate">❤️ {alert.heart_rate}</span>}
                                            {alert.spo2 && <span title="SpO2">💧 {alert.spo2}%</span>}
                                        </td>
                                        <td>
                                            <span className="flex items-center gap-sm">
                                                <Clock size={14} />
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vitals Grid */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Real-time Vitals Monitor</h3>
                    <div className="flex items-center gap-sm text-secondary">
                        <Clock size={14} />
                        Updates every 5 seconds
                    </div>
                </div>
                <div className="vitals-grid">
                    {collars.map(collar => {
                        const status = getCollarStatus(collar);
                        return (
                            <div
                                key={collar.collar_id}
                                className={`vital-card status-${status}`}
                            >
                                <div className="vital-header">
                                    <div className="vital-id">
                                        {collar.cattle_name || `Collar #${collar.collar_id}`}
                                    </div>
                                    <div className={`status-indicator ${status}`}></div>
                                </div>

                                <div className="vital-metrics-grid">
                                    {/* Body Temperature */}
                                    <div className="metric-item">
                                        <div className="metric-icon"><Thermometer size={16} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.body_temp || '--'}°C</div>
                                            <div className="metric-label">Body Temp</div>
                                        </div>
                                    </div>

                                    {/* Heart Rate */}
                                    <div className="metric-item">
                                        <div className="metric-icon"><Heart size={16} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.heart_rate || '--'}</div>
                                            <div className="metric-label">Heart Rate (BPM)</div>
                                        </div>
                                    </div>

                                    {/* SpO2 */}
                                    <div className="metric-item">
                                        <div className="metric-icon"><Droplets size={16} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.spo2 || '--'}%</div>
                                            <div className="metric-label">Blood O₂ (SpO2)</div>
                                        </div>
                                    </div>

                                    {/* Battery */}
                                    <div className="metric-item">
                                        <div className="metric-icon"><Battery size={16} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.battery_voltage || '--'}V</div>
                                            <div className="metric-label">Battery</div>
                                        </div>
                                    </div>
                                </div>

                                {collar.tag_number && (
                                    <div className="vital-footer">
                                        Tag: {collar.tag_number}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default HealthMonitor;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Heart,
    Thermometer,
    Battery,
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    Droplets,
    MapPin,
    Filter,
    Search,
    ChevronRight,
    Zap
} from 'lucide-react';
import './HealthMonitor.css';

const API_URL = 'http://localhost:3001';

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
    if (collar.body_temp > 40) issues.push('Hyperthermia');
    else if (collar.body_temp < 37) issues.push('Hypothermia');
    else if (collar.body_temp > 39.5) issues.push('Elevated Temp');

    if (collar.battery_voltage < 3.0) issues.push('Critical Battery');
    else if (collar.battery_voltage < 3.3) issues.push('Low Battery');

    if (collar.heart_rate) {
        if (collar.heart_rate > 100) issues.push('Tachycardia');
        else if (collar.heart_rate < 40) issues.push('Bradycardia');
        else if (collar.heart_rate > 84 || collar.heart_rate < 48) issues.push('Irregular Pulse');
    }

    if (collar.spo2) {
        if (collar.spo2 < 90) issues.push('Hypoxia');
        else if (collar.spo2 < 95) issues.push('Low SpO2');
    }

    return issues;
};

function HealthMonitor() {
    const navigate = useNavigate();
    const [collars, setCollars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Navigate to LiveMap with collar highlighted
    const handleLocate = (collarId) => {
        navigate(`/live-map?collar=${collarId}`);
    };

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

    // Filter collars
    const filteredCollars = collars.filter(collar => {
        const status = getCollarStatus(collar);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        const matchesSearch = searchTerm === '' ||
            collar.collar_id.toString().includes(searchTerm) ||
            (collar.cattle_name && collar.cattle_name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const activeAlerts = collars
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Health Analytics</h1>
                    <p className="text-secondary">Comprehensive physiological monitoring and anomaly detection.</p>
                </div>
                <div className="flex gap-md">
                    <button className="btn btn-secondary">Export Data</button>
                    <button className="btn btn-primary">Bulk Report</button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4">
                <div className="stat-card blue">
                    <div className="stat-card-icon">
                        <Heart size={24} />
                    </div>
                    <div className="stat-card-value">{healthPercentage}%</div>
                    <div className="stat-card-label">Herd Integrity</div>
                    <div className="stat-card-trend">{healthyCount} units within normal range</div>
                </div>

                <div className="stat-card green">
                    <div className="stat-card-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-card-value">{healthyCount}</div>
                    <div className="stat-card-label">Healthy Units</div>
                    <div className="stat-card-trend">Optimal physiological state</div>
                </div>

                <div className="stat-card amber">
                    <div className="stat-card-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-card-value">{warningCount}</div>
                    <div className="stat-card-label">Observation Required</div>
                    <div className="stat-card-trend">Minor vital fluctuations</div>
                </div>

                <div className="stat-card red">
                    <div className="stat-card-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-card-value">{alertCount}</div>
                    <div className="stat-card-label">Critical Vitals</div>
                    <div className="stat-card-trend">Severe physiological anomalies</div>
                </div>
            </div>

            {/* Active Alerts Section */}
            {activeAlerts.length > 0 && (
                <div className="card bg-glass border-alert animate-glow-red">
                    <div className="card-header border-b border-light pb-md mb-md">
                        <div className="flex items-center gap-md">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="card-title">Priority Health Alerts</h3>
                        </div>
                        <span className="badge badge-alert">{activeAlerts.length} Active</span>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Severity</th>
                                    <th>Subject</th>
                                    <th>Issues Detected</th>
                                    <th>Vital Parameters</th>
                                    <th>Timestamp</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeAlerts.map(alert => (
                                    <tr key={alert.collar_id} className="hover:bg-red-500/5">
                                        <td>
                                            <span className={`badge badge-${alert.status === 'alert' ? 'alert' : 'warning'}`}>
                                                {alert.status === 'alert' ? 'Critical' : 'Warning'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-bold">Collar #{alert.collar_id}</span>
                                                <span className="text-xs text-light font-medium">{alert.cattle_name || 'Unnamed Subject'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-xs">
                                                {alert.issues.map((issue, i) => (
                                                    <span key={i} className="issue-tag">{issue}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="vitals-cell">
                                            <span title="Temperature">🌡️ {alert.body_temp?.toFixed(1) || '--'}°C</span>
                                            {alert.heart_rate && <span title="Pulse">❤️ {alert.heart_rate}</span>}
                                            {alert.spo2 && <span title="Oxygenation">💧 {alert.spo2}%</span>}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-xs text-xs">
                                                <Clock size={12} className="text-secondary" />
                                                {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleLocate(alert.collar_id)}
                                            >
                                                <MapPin size={14} /> Locate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vitals Feed Grid */}
            <div className="card bg-glass">
                <div className="card-header border-b border-light pb-md mb-lg">
                    <h3 className="card-title">Fleet Telemetry Feed</h3>
                    <div className="flex items-center gap-md">
                        <div className="flex items-center gap-sm bg-sidebar p-1 rounded-md border border-light">
                            <Filter size={14} className="ml-2 text-secondary" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select border-none bg-transparent"
                            >
                                <option value="all">Total ({collars.length})</option>
                                <option value="healthy">Healthy ({healthyCount})</option>
                                <option value="warning">Warning ({warningCount})</option>
                                <option value="alert">Critical ({alertCount})</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                            <input
                                type="text"
                                placeholder="Search ID/Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input-sm pl-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="vitals-grid">
                    {filteredCollars.map(collar => {
                        const status = getCollarStatus(collar);
                        return (
                            <div
                                key={collar.collar_id}
                                className={`vital-card status-${status}`}
                            >
                                <div className="vital-header">
                                    <div className="flex flex-col">
                                        <span className="vital-id">{collar.cattle_name || `Collar #${collar.collar_id}`}</span>
                                        <span className="text-xs text-light mt-1 font-medium">Tag: {collar.tag_number || 'N/A'}</span>
                                    </div>
                                    <div className={`status-indicator ${status}`}></div>
                                </div>

                                <div className="vital-metrics-grid">
                                    <div className="metric-item">
                                        <div className="metric-icon"><Thermometer size={18} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.body_temp?.toFixed(1) || '--'}°C</div>
                                            <div className="metric-label">Temp</div>
                                        </div>
                                    </div>

                                    <div className="metric-item">
                                        <div className="metric-icon"><Heart size={18} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.heart_rate || '--'}</div>
                                            <div className="metric-label">Pulse</div>
                                        </div>
                                    </div>

                                    <div className="metric-item">
                                        <div className="metric-icon"><Droplets size={18} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.spo2 || '--'}%</div>
                                            <div className="metric-label">SpO2</div>
                                        </div>
                                    </div>

                                    <div className="metric-item">
                                        <div className="metric-icon"><Zap size={18} /></div>
                                        <div className="metric-data">
                                            <div className="metric-value">{collar.battery_voltage?.toFixed(1) || '--'}V</div>
                                            <div className="metric-label">Power</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="vital-footer">
                                    <div className="flex items-center gap-xs">
                                        <Clock size={12} />
                                        {new Date(collar.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <button
                                        className="btn btn-secondary btn-sm flex items-center gap-xs"
                                        onClick={() => handleLocate(collar.collar_id)}
                                    >
                                        Track <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default HealthMonitor;

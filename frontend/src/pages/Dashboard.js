import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
    Beef,
    AlertTriangle,
    Shield,
    Heart,
    MapPin,
    Activity,
    Thermometer,
    Battery,
    Fence,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';
import { ScaleControl } from '../components/MapControls';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = 'http://localhost:3001';

const cowIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/officel/40/000000/cow.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

// Component to fit map bounds to fences and cattle on first load
function FitBounds({ fences, collars, hasInitialFit }) {
    const map = useMap();

    useEffect(() => {
        if (hasInitialFit.current) return;
        if (fences.length === 0 && collars.length === 0) return;

        const bounds = L.latLngBounds([]);

        fences.forEach(fence => {
            fence.positions.forEach(pos => bounds.extend(pos));
        });

        collars.forEach(collar => {
            if (collar.latitude && collar.longitude) {
                bounds.extend([collar.latitude, collar.longitude]);
            }
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
            hasInitialFit.current = true;
        }
    }, [map, fences, collars, hasInitialFit]);

    return null;
}

function Dashboard() {
    const [collars, setCollars] = useState([]);
    const [fences, setFences] = useState([]);
    const [activitySummary, setActivitySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const hasInitialFit = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collarsRes, fencesRes, activityRes] = await Promise.all([
                    axios.get(`${API_URL}/api/collars/latest`),
                    axios.get(`${API_URL}/api/fences`),
                    axios.get(`${API_URL}/api/dashboard/activity-summary`)
                ]);
                setCollars(collarsRes.data);
                setFences(fencesRes.data.map(f => ({
                    id: f.id,
                    positions: f.geo_json.coordinates[0].map(coord => [coord[1], coord[0]])
                })));
                setActivitySummary(activityRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Calculate stats
    const totalCattle = collars.length;
    const healthyCount = collars.filter(c => c.body_temp >= 37 && c.body_temp <= 39.5 && (!c.alert_state || c.alert_state === 'safe')).length;
    const warningCount = collars.filter(c => c.body_temp > 39.5 && c.body_temp <= 40).length;
    const alertCount = collars.filter(c => c.body_temp > 40 || c.body_temp < 37).length;
    const lowBatteryCount = collars.filter(c => c.battery_voltage < 3.3).length;
    const avgHealth = totalCattle > 0 ? ((healthyCount / totalCattle) * 10).toFixed(1) : 0;

    // Chart data colors from design system
    const colorSuccess = '#059669';
    const colorWarning = '#D97706';
    const colorAlert = '#DC2626';
    const colorPrimary = '#3B82F6';
    const colorPurple = '#8B5CF6';
    const colorOrange = '#F97316';

    const healthChartData = {
        labels: ['Healthy', 'Monitoring', 'Alert'],
        datasets: [{
            data: [healthyCount, warningCount, alertCount],
            backgroundColor: [colorSuccess, colorWarning, colorAlert],
            hoverBackgroundColor: [colorSuccess, colorWarning, colorAlert],
            borderWidth: 0,
            spacing: 5,
            borderRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: '#94A3B8',
                    font: {
                        family: 'Inter',
                        size: 11,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: '#1E293B',
                titleColor: '#F8FAFC',
                bodyColor: '#94A3B8',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true
            }
        },
        cutout: '75%'
    };

    const activityChartData = {
        labels: ['Grazing', 'Resting', 'Moving', 'Standing', 'Lying'],
        datasets: [{
            data: [
                activitySummary?.GRAZING?.percentage || 0,
                activitySummary?.RESTING?.percentage || 0,
                (activitySummary?.MOVING?.percentage || 0),
                activitySummary?.STANDING?.percentage || 0,
                activitySummary?.LYING?.percentage || 0
            ],
            backgroundColor: [colorSuccess, colorPrimary, colorPurple, colorWarning, colorOrange],
            hoverBackgroundColor: [colorSuccess, colorPrimary, colorPurple, colorWarning, colorOrange],
            borderWidth: 0,
            spacing: 5,
            borderRadius: 4
        }]
    };

    // Recent activity refactored for premium look
    const recentActivity = collars
        .sort((a, b) => {
            const alertPriority = { 'breach': 3, 'warning_2': 2, 'warning_1': 1, 'safe': 0 };
            const aPriority = alertPriority[a.alert_state] || 0;
            const bPriority = alertPriority[b.alert_state] || 0;
            return bPriority - aPriority;
        })
        .slice(0, 10) // Show more in the feed
        .map((collar, index) => {
            let type = 'location';
            let title = 'Location Update';
            let value = null;
            let statusClass = 'info';

            const directionIcons = {
                'exiting': '↗️',
                'entering': '↙️',
                'parallel': '↔️',
                'stationary': '⏸️'
            };
            const dirIcon = directionIcons[collar.direction] || '';

            if (collar.alert_state === 'breach') {
                type = 'geofence';
                title = `Fence Breach Detected`;
                value = 'CRITICAL';
                statusClass = 'critical';
            } else if (collar.alert_state === 'warning_2') {
                type = 'geofence';
                title = `Boundary Warning (Level 2)`;
                value = 'ALERT';
                statusClass = 'critical';
            } else if (collar.alert_state === 'warning_1') {
                type = 'geofence';
                title = `Approaching Boundary`;
                value = 'CAUTION';
                statusClass = 'warning';
            } else if (collar.body_temp > 39.5) {
                type = 'health';
                title = 'Elevated Temperature';
                value = `${collar.body_temp}°C`;
                statusClass = 'warning';
            } else if (collar.battery_voltage < 3.3) {
                type = 'battery';
                title = 'Low Battery Level';
                value = `${collar.battery_voltage}V`;
                statusClass = 'warning';
            } else if (collar.direction && collar.direction !== 'stationary') {
                type = 'location';
                title = `Moving ${collar.direction}`;
            }

            return {
                id: index,
                type,
                title,
                collarId: collar.collar_id,
                time: new Date(collar.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value,
                statusClass
            };
        });

    const mapCenter = collars.length > 0
        ? [collars[0].latitude, collars[0].longitude]
        : [36.7359, 3.34018];

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Estate Overview</h1>
                    <p className="text-secondary">Real-time status of your livestock and virtual boundaries.</p>
                </div>
                <div className="flex gap-md">
                    <button className="btn btn-secondary">
                        <TrendingUp size={18} /> Reports
                    </button>
                    <button className="btn btn-primary">
                        <ArrowUpRight size={18} /> Live Map
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-4">
                <div className="stat-card green animate-pulse-subtle">
                    <div className="stat-card-icon">
                        <Beef size={24} />
                    </div>
                    <div className="stat-card-value">{totalCattle}</div>
                    <div className="stat-card-label">Total Cattle</div>
                    <div className="stat-card-trend">{healthyCount} Healthy • {totalCattle - healthyCount} Active</div>
                </div>

                <div className="stat-card red">
                    <div className="stat-card-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-card-value">{alertCount + warningCount}</div>
                    <div className="stat-card-label">Active Alerts</div>
                    <div className="stat-card-trend">{alertCount} critical, {warningCount} monitoring</div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-card-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-card-value">{activitySummary?.MOVING?.count || 0}</div>
                    <div className="stat-card-label">Moving/Grazing</div>
                    <div className="stat-card-trend">Current herd activity</div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-card-icon">
                        <Heart size={24} />
                    </div>
                    <div className="stat-card-value">{avgHealth}/10</div>
                    <div className="stat-card-label">Health Score</div>
                    <div className="stat-card-trend">Across entire herd</div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="dashboard-row">
                {/* Map Preview */}
                <div className="card dashboard-map-card bg-glass">
                    <div className="card-header">
                        <h3 className="card-title">Live Preview</h3>
                        <div className="flex gap-sm">
                            <span className="badge badge-success">Online</span>
                            <span className="badge badge-info">{collars.length} Units</span>
                        </div>
                    </div>
                    <div className="dashboard-map">
                        <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <FitBounds fences={fences} collars={collars} hasInitialFit={hasInitialFit} />
                            <ScaleControl position="bottomleft" />
                            {fences.map(fence => (
                                <Polygon
                                    key={fence.id}
                                    positions={fence.positions}
                                    pathOptions={{ color: '#3B82F6', fillOpacity: 0.1, weight: 2 }}
                                />
                            ))}
                            {collars.map(collar => (
                                <Marker
                                    key={collar.collar_id}
                                    position={[collar.latitude, collar.longitude]}
                                    icon={cowIcon}
                                />
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="card dashboard-activity-card bg-glass">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                    </div>
                    <div className="activity-feed">
                        {recentActivity.length === 0 ? (
                            <div className="empty-state">
                                <Activity size={60} />
                                <p>No activity recorded yet.</p>
                            </div>
                        ) : (
                            recentActivity.map(item => (
                                <div key={item.id} className="activity-item">
                                    <div className={`activity-icon ${item.type}`}>
                                        {item.type === 'health' && <Thermometer size={20} />}
                                        {item.type === 'battery' && <Battery size={20} />}
                                        {item.type === 'location' && <MapPin size={20} />}
                                        {item.type === 'geofence' && <Shield size={20} />}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">
                                            {item.title}
                                            {item.value && <span className={`activity-value ${item.statusClass}`}>{item.value}</span>}
                                        </div>
                                        <div className="activity-meta">
                                            Collar #{item.collarId} • {item.time}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-3">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Health Status</h3>
                    </div>
                    <div className="chart-container" style={{ height: '240px' }}>
                        <Doughnut data={healthChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Herd Activity</h3>
                    </div>
                    <div className="chart-container" style={{ height: '240px' }}>
                        <Doughnut data={activityChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Operational Status</h3>
                    </div>
                    <div className="quick-stats">
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon green">
                                <Shield size={24} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{fences.length}</div>
                                <div className="quick-stat-label">Active Zones</div>
                            </div>
                        </div>
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon blue">
                                <Battery size={24} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{totalCattle - lowBatteryCount}</div>
                                <div className="quick-stat-label">Units Powered</div>
                            </div>
                        </div>
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon amber">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{lowBatteryCount}</div>
                                <div className="quick-stat-label">Needs Maintenance</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet';
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
    Battery
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = 'http://localhost:3001';

const cowIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/officel/40/000000/cow.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});

function Dashboard() {
    const [collars, setCollars] = useState([]);
    const [fences, setFences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collarsRes, fencesRes] = await Promise.all([
                    axios.get(`${API_URL}/api/collars/latest`),
                    axios.get(`${API_URL}/api/fences`)
                ]);
                setCollars(collarsRes.data);
                setFences(fencesRes.data.map(f => ({
                    id: f.id,
                    positions: f.geo_json.coordinates[0].map(coord => [coord[1], coord[0]])
                })));
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
    const healthyCount = collars.filter(c => c.body_temp >= 37 && c.body_temp <= 39.5).length;
    const warningCount = collars.filter(c => c.body_temp > 39.5 && c.body_temp <= 40).length;
    const alertCount = collars.filter(c => c.body_temp > 40 || c.body_temp < 37).length;
    const lowBatteryCount = collars.filter(c => c.battery_voltage < 3.3).length;
    const avgHealth = totalCattle > 0 ? ((healthyCount / totalCattle) * 10).toFixed(1) : 0;

    // Chart data
    const healthChartData = {
        labels: ['Healthy', 'Monitoring', 'Alert'],
        datasets: [{
            data: [healthyCount, warningCount, alertCount],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            borderWidth: 0,
            spacing: 2
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
                    padding: 20
                }
            }
        },
        cutout: '70%'
    };

    // Recent activity (simulated based on collar data)
    const recentActivity = collars.slice(0, 5).map((collar, index) => ({
        id: index,
        type: collar.body_temp > 39.5 ? 'health' : collar.battery_voltage < 3.3 ? 'battery' : 'location',
        title: collar.body_temp > 39.5
            ? `High temperature detected`
            : collar.battery_voltage < 3.3
                ? 'Low battery warning'
                : 'Location update',
        collarId: collar.collar_id,
        time: new Date(collar.timestamp).toLocaleTimeString(),
        value: collar.body_temp > 39.5 ? `${collar.body_temp}°C` : collar.battery_voltage < 3.3 ? `${collar.battery_voltage}V` : null
    }));

    const mapCenter = collars.length > 0
        ? [collars[0].latitude, collars[0].longitude]
        : [36.7359, 3.34018];

    return (
        <div className="dashboard">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-4">
                <div className="stat-card green">
                    <div className="stat-card-icon">
                        <Beef size={24} />
                    </div>
                    <div className="stat-card-value">{totalCattle}</div>
                    <div className="stat-card-label">Total Cattle</div>
                    <div className="stat-card-trend">Active tracking collars</div>
                </div>

                <div className="stat-card amber">
                    <div className="stat-card-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-card-value">{alertCount + warningCount}</div>
                    <div className="stat-card-label">Requires Attention</div>
                    <div className="stat-card-trend">{alertCount} critical, {warningCount} monitoring</div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-card-icon">
                        <Shield size={24} />
                    </div>
                    <div className="stat-card-value">{fences.length}</div>
                    <div className="stat-card-label">Active Fences</div>
                    <div className="stat-card-trend">Virtual boundaries</div>
                </div>

                <div className="stat-card teal">
                    <div className="stat-card-icon">
                        <Heart size={24} />
                    </div>
                    <div className="stat-card-value">{avgHealth}/10</div>
                    <div className="stat-card-label">Herd Health Index</div>
                    <div className="stat-card-trend">{healthyCount} cattle healthy</div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="dashboard-row">
                {/* Map Preview */}
                <div className="card dashboard-map-card">
                    <div className="card-header">
                        <h3 className="card-title">Live Map Preview</h3>
                        <a href="/live-map" className="btn btn-secondary">View Full Map</a>
                    </div>
                    <div className="dashboard-map">
                        {!loading && (
                            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false}>
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {fences.map(fence => (
                                    <Polygon
                                        key={fence.id}
                                        positions={fence.positions}
                                        pathOptions={{ color: '#3B82F6', fillOpacity: 0.2 }}
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
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="card dashboard-activity-card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                    </div>
                    <div className="activity-feed">
                        {recentActivity.length === 0 ? (
                            <div className="empty-state">
                                <Activity size={48} />
                                <p>No recent activity</p>
                            </div>
                        ) : (
                            recentActivity.map(item => (
                                <div key={item.id} className="activity-item">
                                    <div className={`activity-icon ${item.type}`}>
                                        {item.type === 'health' && <Thermometer size={18} />}
                                        {item.type === 'battery' && <Battery size={18} />}
                                        {item.type === 'location' && <MapPin size={18} />}
                                    </div>
                                    <div className="activity-content">
                                        <div className="activity-title">
                                            {item.title}
                                            {item.value && <span className="activity-value"> - {item.value}</span>}
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

            {/* Bottom Section */}
            <div className="dashboard-row">
                {/* Health Chart */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Health Status Distribution</h3>
                    </div>
                    <div className="chart-container" style={{ height: '250px' }}>
                        <Doughnut data={healthChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Statistics</h3>
                    </div>
                    <div className="quick-stats">
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon green">
                                <Activity size={20} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{healthyCount}</div>
                                <div className="quick-stat-label">Healthy Cattle</div>
                            </div>
                        </div>
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon amber">
                                <Thermometer size={20} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{warningCount}</div>
                                <div className="quick-stat-label">Under Observation</div>
                            </div>
                        </div>
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon red">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{alertCount}</div>
                                <div className="quick-stat-label">Critical Alerts</div>
                            </div>
                        </div>
                        <div className="quick-stat-item">
                            <div className="quick-stat-icon blue">
                                <Battery size={20} />
                            </div>
                            <div className="quick-stat-info">
                                <div className="quick-stat-value">{lowBatteryCount}</div>
                                <div className="quick-stat-label">Low Battery</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

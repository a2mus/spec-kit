import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import {
    Search,
    Filter,
    Layers,
    Maximize2,
    RefreshCw,
    Thermometer,
    Battery,
    Activity,
    MapPin
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './LiveMap.css';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_URL = 'http://localhost:3001';

// Create custom cow icons for different statuses
const createCowIcon = (status) => {
    const colors = {
        healthy: '#10B981',
        warning: '#F59E0B',
        alert: '#EF4444'
    };

    return new L.DivIcon({
        className: 'custom-cattle-marker',
        html: `
      <div class="cattle-marker ${status}">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="${colors[status]}">
          <circle cx="12" cy="12" r="10" fill="${colors[status]}" opacity="0.2"/>
          <circle cx="12" cy="12" r="6" fill="${colors[status]}"/>
        </svg>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
};

// Get collar status based on health metrics
const getCollarStatus = (collar) => {
    if (collar.body_temp > 40 || collar.body_temp < 37 || collar.battery_voltage < 3.0) {
        return 'alert';
    }
    if (collar.body_temp > 39.5 || collar.battery_voltage < 3.3) {
        return 'warning';
    }
    return 'healthy';
};

// Draw Control Component
function DrawControlNative({ onCreated }) {
    const map = useMap();
    const drawnItemsRef = useRef(null);
    const drawControlRef = useRef(null);
    const onCreatedRef = useRef(onCreated);

    // Keep the callback ref updated
    useEffect(() => {
        onCreatedRef.current = onCreated;
    }, [onCreated]);

    useEffect(() => {
        if (!drawnItemsRef.current) {
            drawnItemsRef.current = new L.FeatureGroup();
            map.addLayer(drawnItemsRef.current);
        }

        if (!drawControlRef.current) {
            drawControlRef.current = new L.Control.Draw({
                position: 'topright',
                draw: {
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false,
                    polygon: {
                        allowIntersection: false,
                        showArea: true,
                    },
                },
                edit: {
                    featureGroup: drawnItemsRef.current,
                },
            });
            map.addControl(drawControlRef.current);
        }

        const onCreatedHandler = (e) => {
            drawnItemsRef.current.addLayer(e.layer);
            if (onCreatedRef.current) {
                onCreatedRef.current(e);
            }
        };

        map.on(L.Draw.Event.CREATED, onCreatedHandler);

        return () => {
            map.off(L.Draw.Event.CREATED, onCreatedHandler);
            if (drawControlRef.current) {
                map.removeControl(drawControlRef.current);
                drawControlRef.current = null;
            }
            if (drawnItemsRef.current) {
                map.removeLayer(drawnItemsRef.current);
                drawnItemsRef.current = null;
            }
        };
    }, [map]); // Remove onCreated from dependency array

    return null;
}

function LiveMap() {
    const [fences, setFences] = useState([]);
    const [collars, setCollars] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCollar, setSelectedCollar] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const fetchFences = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/fences`);
            const formattedFences = response.data.map(f => ({
                id: f.id,
                name: f.name,
                positions: f.geo_json.coordinates[0].map(coord => [coord[1], coord[0]])
            }));
            setFences(formattedFences);
        } catch (error) {
            console.error("Error fetching fences", error);
        }
    };

    const fetchCollars = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/collars/latest`);
            setCollars(response.data);
        } catch (error) {
            console.error("Error fetching latest collar data", error);
        }
    };

    useEffect(() => {
        fetchFences();
        fetchCollars();

        const interval = setInterval(fetchCollars, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreate = async (e) => {
        const { layer } = e;
        const geojson = layer.toGeoJSON();

        try {
            await axios.post(`${API_URL}/api/fences`, {
                name: `Fence ${new Date().getTime()}`,
                geo_json: geojson.geometry
            });
            fetchFences();
        } catch (error) {
            console.error("Error saving fence", error);
            alert('Failed to save fence. Please try again.');
        }
    };

    const handleDeleteFence = async (id) => {
        if (!window.confirm(`Delete this fence? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/api/fences/${id}`);
            fetchFences();
        } catch (error) {
            console.error(`Error deleting fence ${id}`, error);
            alert('Failed to delete fence. Please try again.');
        }
    };

    // Filter collars based on search and status
    const filteredCollars = collars.filter(collar => {
        const matchesSearch = collar.collar_id.toString().includes(searchTerm);
        const status = getCollarStatus(collar);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const mapCenter = collars.length > 0
        ? [collars[0].latitude, collars[0].longitude]
        : [36.7359, 3.34018];

    return (
        <div className={`live-map-container ${isFullscreen ? 'fullscreen' : ''}`}>
            {/* Sidebar */}
            <div className="map-sidebar">
                {/* Search & Filter */}
                <div className="card">
                    <div className="search-input">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by collar ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({collars.length})
                        </button>
                        <button
                            className={`filter-btn healthy ${statusFilter === 'healthy' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('healthy')}
                        >
                            Healthy
                        </button>
                        <button
                            className={`filter-btn warning ${statusFilter === 'warning' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('warning')}
                        >
                            Monitor
                        </button>
                        <button
                            className={`filter-btn alert ${statusFilter === 'alert' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('alert')}
                        >
                            Alert
                        </button>
                    </div>
                </div>

                {/* Cattle List */}
                <div className="card cattle-list-card">
                    <div className="card-header">
                        <h3 className="card-title">Tracked Cattle</h3>
                        <span className="badge badge-info">{filteredCollars.length}</span>
                    </div>
                    <div className="cattle-list">
                        {filteredCollars.map(collar => {
                            const status = getCollarStatus(collar);
                            return (
                                <div
                                    key={collar.collar_id}
                                    className={`cattle-list-item ${selectedCollar === collar.collar_id ? 'selected' : ''}`}
                                    onClick={() => setSelectedCollar(collar.collar_id)}
                                >
                                    <div className={`status-dot ${status}`}></div>
                                    <div className="cattle-info">
                                        <div className="cattle-id">Collar #{collar.collar_id}</div>
                                        <div className="cattle-meta">
                                            <span><Thermometer size={12} /> {collar.body_temp}°C</span>
                                            <span><Battery size={12} /> {collar.battery_voltage}V</span>
                                        </div>
                                    </div>
                                    <div className={`badge badge-${status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'alert'}`}>
                                        {status}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Fences List */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Virtual Fences</h3>
                        <span className="badge badge-info">{fences.length}</span>
                    </div>
                    <div className="fence-list">
                        {fences.map(fence => (
                            <div key={fence.id} className="fence-list-item">
                                <div className="fence-color" style={{ background: '#3B82F6' }}></div>
                                <div className="fence-info">
                                    <div className="fence-name">{fence.name || `Fence #${fence.id}`}</div>
                                </div>
                                <button
                                    className="btn btn-icon btn-danger"
                                    onClick={() => handleDeleteFence(fence.id)}
                                    title="Delete fence"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {fences.length === 0 && (
                            <div className="empty-state" style={{ padding: '20px' }}>
                                <p className="text-secondary">No fences yet. Draw on the map to create one.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="map-main">
                <div className="map-controls">
                    <button
                        className="map-control-btn"
                        onClick={fetchCollars}
                        title="Refresh data"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        className="map-control-btn"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        title="Toggle fullscreen"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>

                <MapContainer
                    center={mapCenter}
                    zoom={14}
                    doubleClickZoom={false}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <DrawControlNative onCreated={handleCreate} />

                    {/* Fences */}
                    {fences.map(fence => (
                        <Polygon
                            key={fence.id}
                            positions={fence.positions}
                            pathOptions={{
                                color: '#3B82F6',
                                fillColor: '#3B82F6',
                                fillOpacity: 0.15,
                                weight: 2
                            }}
                            eventHandlers={{
                                click: () => handleDeleteFence(fence.id)
                            }}
                        />
                    ))}

                    {/* Cattle Markers */}
                    {filteredCollars.map(collar => {
                        const status = getCollarStatus(collar);
                        return (
                            <Marker
                                key={collar.collar_id}
                                position={[collar.latitude, collar.longitude]}
                                icon={createCowIcon(status)}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <h4>Collar #{collar.collar_id}</h4>
                                        <div className="popup-row">
                                            <span className="popup-label">Status</span>
                                            <span className={`badge badge-${status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'alert'}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Body Temp</span>
                                            <span className="popup-value">{collar.body_temp}°C</span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Battery</span>
                                            <span className="popup-value">{collar.battery_voltage}V</span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Activity</span>
                                            <span className="popup-value">{collar.activity}</span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Location</span>
                                            <span className="popup-value">
                                                {collar.latitude.toFixed(5)}, {collar.longitude.toFixed(5)}
                                            </span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Last Update</span>
                                            <span className="popup-value">
                                                {new Date(collar.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}

export default LiveMap;

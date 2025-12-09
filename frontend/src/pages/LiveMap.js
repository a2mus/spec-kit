import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
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
    MapPin,
    Crosshair,
    Trash2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './LiveMap.css';
import GeofenceAlertNotification from '../components/GeofenceAlertNotification';

// Component to fit map bounds to fences and cattle
function FitBounds({ fences, collars, hasInitialFit }) {
    const map = useMap();

    useEffect(() => {
        // Only fit bounds on first load with data
        if (hasInitialFit.current) return;
        if (fences.length === 0 && collars.length === 0) return;

        const bounds = L.latLngBounds([]);

        // Add fence positions to bounds
        fences.forEach(fence => {
            fence.positions.forEach(pos => {
                bounds.extend(pos);
            });
        });

        // Add collar positions to bounds
        collars.forEach(collar => {
            if (collar.latitude && collar.longitude) {
                bounds.extend([collar.latitude, collar.longitude]);
            }
        });

        // Fit map to bounds with padding
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            hasInitialFit.current = true;
        }
    }, [map, fences, collars, hasInitialFit]);

    return null;
}

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_URL = 'http://localhost:3001';

// Create custom cow icons for different statuses (health + geofence alerts + direction)
const createCowIcon = (status, alertState = 'safe', direction = 'stationary') => {
    const colors = {
        healthy: '#10B981',
        warning: '#F59E0B',
        alert: '#EF4444'
    };

    // Determine if we should show geofence alert overlay
    const isAlerting = alertState && alertState !== 'safe';
    const blinkClass = isAlerting ? 'blink-alert' : '';

    // Get alert icon based on state
    let alertIcon = '';
    if (alertState === 'warning_1') {
        // Stage 1: Single speaker icon
        alertIcon = `<div class="alert-overlay speaker">🔊</div>`;
    } else if (alertState === 'warning_2') {
        // Stage 2: Double speaker icon (intensified)
        alertIcon = `<div class="alert-overlay speaker-intense">🔊🔊</div>`;
    } else if (alertState === 'breach') {
        // Stage 3: Lightning bolt (shock)
        alertIcon = `<div class="alert-overlay shock">⚡</div>`;
    }

    // Get direction arrow based on movement direction
    let directionArrow = '';
    if (direction === 'exiting') {
        // Moving toward fence (dangerous) - red arrow pointing outward
        directionArrow = `<div class="direction-arrow exiting">↗️</div>`;
    } else if (direction === 'entering') {
        // Moving toward safe zone - green arrow pointing inward
        directionArrow = `<div class="direction-arrow entering">↙️</div>`;
    } else if (direction === 'parallel') {
        // Moving along fence - yellow arrow
        directionArrow = `<div class="direction-arrow parallel">↔️</div>`;
    }

    return new L.DivIcon({
        className: 'custom-cattle-marker',
        html: `
      <div class="cattle-marker ${status} ${blinkClass}">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="${colors[status]}">
          <circle cx="12" cy="12" r="10" fill="${colors[status]}" opacity="0.2"/>
          <circle cx="12" cy="12" r="6" fill="${colors[status]}"/>
        </svg>
        ${alertIcon}
        ${directionArrow}
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
};

// Get collar status based on health metrics
const getCollarStatus = (collar) => {
    // Geofence breach takes priority
    if (collar.alert_state === 'breach') {
        return 'alert';
    }
    // Health-based status
    if (collar.body_temp > 40 || collar.body_temp < 37 || collar.battery_voltage < 3.0) {
        return 'alert';
    }
    // Geofence warning
    if (collar.alert_state === 'warning_1' || collar.alert_state === 'warning_2') {
        return 'warning';
    }
    if (collar.body_temp > 39.5 || collar.battery_voltage < 3.3) {
        return 'warning';
    }
    return 'healthy';
};

// Get alert state display text
const getAlertStateDisplay = (alertState) => {
    const states = {
        'safe': { text: 'Safe', color: '#10B981' },
        'warning_1': { text: '⚠️ Approaching Boundary', color: '#F59E0B' },
        'warning_2': { text: '⚠️ Near Boundary', color: '#F97316' },
        'breach': { text: '🚨 BOUNDARY BREACH', color: '#EF4444' }
    };
    return states[alertState] || states['safe'];
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
    const [searchParams] = useSearchParams();
    const [fences, setFences] = useState([]);
    const [collars, setCollars] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCollar, setSelectedCollar] = useState(null);
    const [highlightedCollar, setHighlightedCollar] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const hasInitialFit = useRef(false);
    const hasZoomedToCollar = useRef(false);
    const mapRef = useRef(null);
    const previousCollarsRef = useRef(null);

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

    // Handle zoom-to-collar from URL parameter
    useEffect(() => {
        const collarId = searchParams.get('collar');
        if (collarId && collars.length > 0 && mapRef.current && !hasZoomedToCollar.current) {
            const targetCollar = collars.find(c => c.collar_id === parseInt(collarId));
            if (targetCollar && targetCollar.latitude && targetCollar.longitude) {
                // Zoom to collar position
                mapRef.current.setView([targetCollar.latitude, targetCollar.longitude], 17);
                // Highlight and select the collar
                setSelectedCollar(targetCollar.collar_id);
                setHighlightedCollar(targetCollar.collar_id);
                hasZoomedToCollar.current = true;
                // Clear highlight after 5 seconds
                setTimeout(() => setHighlightedCollar(null), 5000);
            }
        }
    }, [searchParams, collars]);

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

    const handleDeleteCollar = async (collar) => {
        if (!window.confirm(`Delete collar #${collar.collar_id}? This action cannot be undone.`)) return;
        try {
            // Need to get the database id from the collar_id
            const collarsRes = await axios.get(`${API_URL}/api/collars`);
            const collarRecord = collarsRes.data.find(c => c.collar_id === collar.collar_id);
            if (!collarRecord) {
                alert('Collar not found in database.');
                return;
            }
            await axios.delete(`${API_URL}/api/collars/${collarRecord.id}`);
            fetchCollars();
        } catch (error) {
            console.error('Error deleting collar:', error);
            alert('Failed to delete collar. Please try again.');
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
            {/* Geofence Alert Notifications */}
            <GeofenceAlertNotification
                collars={collars}
                previousCollarsRef={previousCollarsRef}
            />

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
                                            <span><Thermometer size={12} /> {collar.body_temp?.toFixed(2)}°C</span>
                                            <span><Battery size={12} /> {collar.battery_voltage?.toFixed(2)}V</span>
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
                        onClick={() => {
                            if (mapRef.current) {
                                const bounds = L.latLngBounds([]);
                                fences.forEach(f => f.positions.forEach(p => bounds.extend(p)));
                                collars.forEach(c => c.latitude && bounds.extend([c.latitude, c.longitude]));
                                if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                            }
                        }}
                        title="Fit to all data"
                    >
                        <Crosshair size={18} />
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
                    ref={mapRef}
                >
                    {/* Layer Control for switching between Street and Satellite views */}
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Street Map">
                            <TileLayer
                                attribution='&copy; OpenStreetMap contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite">
                            <TileLayer
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <FitBounds fences={fences} collars={collars} hasInitialFit={hasInitialFit} />
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
                        const alertDisplay = getAlertStateDisplay(collar.alert_state);
                        const direction = collar.direction || 'stationary';
                        const directionDisplay = {
                            'exiting': { icon: '↗️', text: 'Exiting', color: '#EF4444' },
                            'entering': { icon: '↙️', text: 'Entering', color: '#10B981' },
                            'parallel': { icon: '↔️', text: 'Parallel', color: '#F59E0B' },
                            'stationary': { icon: '⏸️', text: 'Stationary', color: '#6B7280' }
                        }[direction] || { icon: '❓', text: 'Unknown', color: '#6B7280' };
                        return (
                            <Marker
                                key={collar.collar_id}
                                position={[collar.latitude, collar.longitude]}
                                icon={createCowIcon(status, collar.alert_state, direction)}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <h4>Collar #{collar.collar_id}</h4>
                                        <div className="popup-row">
                                            <span className="popup-label">Health Status</span>
                                            <span className={`badge badge-${status === 'healthy' ? 'success' : status === 'warning' ? 'warning' : 'alert'}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Geofence</span>
                                            <span className="popup-value" style={{ color: alertDisplay.color, fontWeight: collar.alert_state !== 'safe' ? 'bold' : 'normal' }}>
                                                {alertDisplay.text}
                                            </span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Direction</span>
                                            <span className="popup-value" style={{ color: directionDisplay.color }}>
                                                {directionDisplay.icon} {directionDisplay.text}
                                            </span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Body Temp</span>
                                            <span className="popup-value">{collar.body_temp?.toFixed(2)}°C</span>
                                        </div>
                                        <div className="popup-row">
                                            <span className="popup-label">Battery</span>
                                            <span className="popup-value">{collar.battery_voltage?.toFixed(2)}V</span>
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
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDeleteCollar(collar)}
                                            style={{ marginTop: '12px', width: '100%' }}
                                        >
                                            <Trash2 size={14} /> Delete Collar
                                        </button>
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

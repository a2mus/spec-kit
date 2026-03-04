import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, LayersControl, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import * as turf from '@turf/turf';
import {
    Search,
    Filter,
    Maximize2,
    RefreshCw,
    Thermometer,
    Battery,
    Activity,
    MapPin,
    Crosshair,
    Trash2,
    Eye,
    EyeOff,
    Navigation,
    ChevronRight,
    Zap,
    Heart,
    Droplets
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './LiveMap.css';
import GeofenceAlertNotification from '../components/GeofenceAlertNotification';
import { MapScaleAndMeasure } from '../components/MapControls';

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

// Buffer zone configuration (in meters) - matches beaglebone_vm.py thresholds
const BUFFER_ZONES = [
    { name: 'warning_1', outerDistance: 10, innerDistance: 15, color: '#EAB308', label: 'Warning 1 (10-15m)' },
    { name: 'warning_2', outerDistance: 5, innerDistance: 10, color: '#F97316', label: 'Warning 2 (5-10m)' },
    { name: 'breach', outerDistance: 0, innerDistance: 5, color: '#EF4444', label: 'Breach (<5m)' }
];

/**
 * Create buffer zone ring polygons for a fence using Turf.js
 */
const createBufferZones = (positions) => {
    if (!positions || positions.length < 3) return [];

    try {
        const coordinates = positions.map(pos => [pos[1], pos[0]]);
        if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
            coordinates.push(coordinates[0]);
        }

        const fencePolygon = turf.polygon([coordinates]);
        const bufferZones = [];

        BUFFER_ZONES.forEach(zone => {
            try {
                let outerPoly;
                if (zone.outerDistance === 0) {
                    outerPoly = fencePolygon;
                } else {
                    outerPoly = turf.buffer(fencePolygon, -zone.outerDistance / 1000, { units: 'kilometers' });
                }

                const innerPoly = turf.buffer(fencePolygon, -zone.innerDistance / 1000, { units: 'kilometers' });

                if (!outerPoly || !outerPoly.geometry || !outerPoly.geometry.coordinates) return;

                const outerCoords = outerPoly.geometry.coordinates[0];
                const outerPositions = outerCoords.map(coord => [coord[1], coord[0]]);

                let innerPositions = null;
                if (innerPoly && innerPoly.geometry && innerPoly.geometry.coordinates && innerPoly.geometry.coordinates[0]) {
                    const innerCoords = innerPoly.geometry.coordinates[0];
                    innerPositions = innerCoords.map(coord => [coord[1], coord[0]]);
                }

                bufferZones.push({
                    name: zone.name,
                    outerPositions: outerPositions,
                    innerPositions: innerPositions,
                    color: zone.color,
                    label: zone.label
                });
            } catch (e) {
                console.debug(`Buffer zone ${zone.name} could not be created:`, e.message);
            }
        });

        return bufferZones;
    } catch (error) {
        console.error('Error creating buffer zones:', error);
        return [];
    }
};

// Create custom cattle markers
const createCowIcon = (status, alertState = 'safe', direction = 'stationary') => {
    const colors = {
        healthy: '#10B981',
        warning: '#F59E0B',
        alert: '#EF4444'
    };

    const isAlerting = alertState && alertState !== 'safe';
    const blinkClass = isAlerting ? 'blink-alert' : '';

    let alertIcon = '';
    if (alertState === 'warning_1') alertIcon = `<div class="alert-overlay speaker">🔊</div>`;
    else if (alertState === 'warning_2') alertIcon = `<div class="alert-overlay speaker-intense">🔊🔊</div>`;
    else if (alertState === 'breach') alertIcon = `<div class="alert-overlay shock">⚡</div>`;

    let directionArrow = '';
    if (direction === 'exiting') directionArrow = `<div class="direction-arrow exiting">↗️</div>`;
    else if (direction === 'entering') directionArrow = `<div class="direction-arrow entering">↙️</div>`;
    else if (direction === 'parallel') directionArrow = `<div class="direction-arrow parallel">↔️</div>`;

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

const getCollarStatus = (collar) => {
    if (collar.alert_state === 'breach' || collar.body_temp > 40 || collar.body_temp < 37 || collar.battery_voltage < 3.0) return 'alert';
    if (collar.alert_state === 'warning_1' || collar.alert_state === 'warning_2' || collar.body_temp > 39.5 || collar.battery_voltage < 3.3) return 'warning';
    return 'healthy';
};

const getAlertStateDisplay = (alertState) => {
    const states = {
        'safe': { text: 'Safe', color: '#10B981' },
        'warning_1': { text: '⚠️ Warning 1', color: '#F59E0B' },
        'warning_2': { text: '⚠️ Warning 2', color: '#F97316' },
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
                position: 'bottomright',
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
    }, [map]);

    return null;
}

function LiveMap() {
    const [searchParams] = useSearchParams();
    const [fences, setFences] = useState([]);
    const [collars, setCollars] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedCollar, setSelectedCollar] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showBufferZones, setShowBufferZones] = useState(true);
    const [positionHistory, setPositionHistory] = useState({});
    const [showTrails, setShowTrails] = useState(true);
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

    const fetchPositionHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/collars/position-history?limit=50`);
            setPositionHistory(response.data);
        } catch (error) {
            console.error("Error fetching position history", error);
        }
    };

    useEffect(() => {
        fetchFences();
        fetchCollars();
        fetchPositionHistory();

        const interval = setInterval(() => {
            fetchCollars();
            fetchPositionHistory();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const collarId = searchParams.get('collar');
        if (collarId && collars.length > 0 && mapRef.current && !hasZoomedToCollar.current) {
            const targetCollar = collars.find(c => c.collar_id === parseInt(collarId));
            if (targetCollar && targetCollar.latitude && targetCollar.longitude) {
                mapRef.current.setView([targetCollar.latitude, targetCollar.longitude], 18);
                setSelectedCollar(targetCollar.collar_id);
                hasZoomedToCollar.current = true;
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
        }
    };

    const handleDeleteFence = async (id) => {
        if (!window.confirm(`Delete this fence?`)) return;
        try {
            await axios.delete(`${API_URL}/api/fences/${id}`);
            fetchFences();
        } catch (error) {
            console.error(`Error deleting fence ${id}`, error);
        }
    };

    const handleDeleteCollar = async (collar) => {
        if (!window.confirm(`Delete collar #${collar.collar_id}?`)) return;
        try {
            const collarsRes = await axios.get(`${API_URL}/api/collars`);
            const collarRecord = collarsRes.data.find(c => c.id === collar.id);
            if (!collarRecord) return;
            await axios.delete(`${API_URL}/api/collars/${collarRecord.id}`);
            fetchCollars();
        } catch (error) {
            console.error('Error deleting collar:', error);
        }
    };

    const filteredCollars = collars.filter(collar => {
        const matchesSearch = collar.collar_id.toString().includes(searchTerm) ||
            (collar.cattle_name && collar.cattle_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const status = getCollarStatus(collar);
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const mapCenter = collars.length > 0
        ? [collars[0].latitude, collars[0].longitude]
        : [36.7359, 3.34018];

    return (
        <div className={`live-map-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <GeofenceAlertNotification
                collars={collars}
                previousCollarsRef={previousCollarsRef}
            />

            <div className="map-sidebar">
                <div className="card bg-glass">
                    <div className="search-input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search units..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-field"
                        />
                    </div>
                    <div className="filter-chips">
                        <button
                            className={`chip ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All ({collars.length})
                        </button>
                        <button
                            className={`chip healthy ${statusFilter === 'healthy' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('healthy')}
                        >
                            Healthy
                        </button>
                        <button
                            className={`chip warning ${statusFilter === 'warning' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('warning')}
                        >
                            Monitor
                        </button>
                        <button
                            className={`chip alert ${statusFilter === 'alert' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('alert')}
                        >
                            Alert
                        </button>
                    </div>
                </div>

                <div className="card bg-glass cattle-list-card">
                    <div className="card-header border-b border-light pb-sm mb-sm">
                        <h3 className="card-title text-sm uppercase tracking-wider opacity-70">Fleet Status</h3>
                        <span className="badge badge-info">{filteredCollars.length} Units</span>
                    </div>
                    <div className="cattle-list scrollbar-hidden">
                        {filteredCollars.map(collar => {
                            const status = getCollarStatus(collar);
                            const isSelected = selectedCollar === collar.collar_id;
                            return (
                                <div
                                    key={collar.collar_id}
                                    className={`cattle-list-item ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedCollar(collar.collar_id);
                                        if (mapRef.current) {
                                            mapRef.current.setView([collar.latitude, collar.longitude], 18);
                                        }
                                    }}
                                >
                                    <div className={`status-indicator-dot ${status}`}></div>
                                    <div className="cattle-list-info">
                                        <div className="cattle-list-id">
                                            {collar.cattle_name || `Collar #${collar.collar_id}`}
                                        </div>
                                        <div className="cattle-list-metrics">
                                            <span><Thermometer size={10} /> {collar.body_temp?.toFixed(1)}°</span>
                                            <span><Zap size={10} /> {collar.battery_voltage?.toFixed(1)}V</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-secondary opacity-50" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card bg-glass">
                    <div className="card-header border-b border-light pb-sm mb-sm">
                        <h3 className="card-title text-sm uppercase tracking-wider opacity-70">Active Perimeters</h3>
                        <span className="badge badge-primary">{fences.length}</span>
                    </div>
                    <div className="fence-list scrollbar-hidden">
                        {fences.map(fence => (
                            <div key={fence.id} className="fence-list-item">
                                <div className="fence-marker-cyan"></div>
                                <div className="fence-list-name">{fence.name}</div>
                                <button
                                    className="btn-delete-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFence(fence.id);
                                    }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="map-main">
                <div className="map-overlay-controls">
                    <div className="overlay-group">
                        <button className="map-btn" onClick={fetchCollars} title="Refresh Fleet Data"><RefreshCw size={18} /></button>
                        <button className="map-btn" onClick={() => {
                            if (mapRef.current) {
                                const bounds = L.latLngBounds([]);
                                fences.forEach(f => f.positions.forEach(p => bounds.extend(p)));
                                collars.forEach(c => bounds.extend([c.latitude, c.longitude]));
                                if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                            }
                        }} title="Focus All Units"><Crosshair size={18} /></button>
                    </div>
                    <div className="overlay-group">
                        <button className={`map-btn ${showBufferZones ? 'active' : ''}`} onClick={() => setShowBufferZones(!showBufferZones)} title="Toggle Zones">
                            {showBufferZones ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button className={`map-btn ${showTrails ? 'active' : ''}`} onClick={() => setShowTrails(!showTrails)} title="Toggle Trails"><Navigation size={18} /></button>
                    </div>
                    <button className="map-btn" onClick={() => setIsFullscreen(!isFullscreen)} title="Fullscreen mode"><Maximize2 size={18} /></button>
                </div>

                {showBufferZones && (
                    <div className="map-legend-premium">
                        <div className="legend-header">Zone Integrity</div>
                        <div className="legend-items">
                            <div className="legend-row"><span className="dot green"></span> Safe Area</div>
                            <div className="legend-row"><span className="dot yellow"></span> Outer Buffer</div>
                            <div className="legend-row"><span className="dot orange"></span> Critical Buffer</div>
                            <div className="legend-row"><span className="dot red"></span> Breach Zone</div>
                        </div>
                    </div>
                )}

                <MapContainer center={mapCenter} zoom={15} scrollWheelZoom={true} ref={mapRef} className="map-engine" zoomControl={false}>
                    <ZoomControl position="topright" />
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="Cartographic">
                            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite View">
                            <TileLayer attribution='&copy; Esri' url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <FitBounds fences={fences} collars={collars} hasInitialFit={hasInitialFit} />
                    <DrawControlNative onCreated={handleCreate} />
                    <MapScaleAndMeasure scalePosition="bottomright" measurePosition="bottomright" />

                    {fences.map(fence => (
                        <Polygon key={fence.id} positions={fence.positions} pathOptions={{ color: '#00F2FF', fillColor: '#00F2FF', fillOpacity: 0.05, weight: 2 }} />
                    ))}

                    {showBufferZones && fences.map(fence => {
                        const bufferZones = createBufferZones(fence.positions);
                        return bufferZones.map((zone) => (
                            <Polygon
                                key={`${fence.id}-buffer-${zone.name}`}
                                positions={zone.innerPositions ? [zone.outerPositions, zone.innerPositions] : zone.outerPositions}
                                pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.25, weight: 1, dashArray: '5, 10' }}
                            />
                        ));
                    })}

                    {showTrails && filteredCollars.map(collar => {
                        const history = positionHistory[collar.collar_id];
                        if (!history || history.length < 2) return null;
                        const status = getCollarStatus(collar);
                        const trailColor = status === 'healthy' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444';
                        const positions = history.map(h => [h.latitude, h.longitude]);
                        return (
                            <React.Fragment key={`trail-${collar.collar_id}`}>
                                <Polyline positions={positions} pathOptions={{ color: trailColor, weight: 2, opacity: 0.3, dashArray: '4, 8' }} />
                                {history.slice(1, 10).map((pos, i) => (
                                    <CircleMarker key={i} center={[pos.latitude, pos.longitude]} radius={3} pathOptions={{ color: trailColor, fillColor: trailColor, fillOpacity: 0.4 - (i * 0.04) }} />
                                ))}
                            </React.Fragment>
                        );
                    })}

                    {filteredCollars.map(collar => {
                        const status = getCollarStatus(collar);
                        const alertDisplay = getAlertStateDisplay(collar.alert_state);
                        return (
                            <Marker key={collar.collar_id} position={[collar.latitude, collar.longitude]} icon={createCowIcon(status, collar.alert_state, collar.direction)}>
                                <Popup className="premium-popup">
                                    <div className="popup-container">
                                        <div className="popup-header">
                                            <span className="popup-id">{collar.cattle_name || `Collar #${collar.collar_id}`}</span>
                                            <span className={`status-pill ${status}`}>{status}</span>
                                        </div>
                                        <div className="popup-grid">
                                            <div className="popup-metric">
                                                <div className="metric-label">Zone Status</div>
                                                <div className="metric-value font-bold" style={{ color: alertDisplay.color }}>{alertDisplay.text}</div>
                                            </div>
                                            <div className="popup-metric">
                                                <div className="metric-label">Movement</div>
                                                <div className="metric-value capitalize">{collar.direction || 'Stationary'}</div>
                                            </div>
                                            <div className="popup-metric">
                                                <div className="metric-label">Temperature</div>
                                                <div className="metric-value">{collar.body_temp?.toFixed(1)}°C</div>
                                            </div>
                                            <div className="popup-metric">
                                                <div className="metric-label">Battery</div>
                                                <div className="metric-value">{collar.battery_voltage?.toFixed(1)}V</div>
                                            </div>
                                        </div>
                                        <div className="popup-footer">
                                            <span className="text-xs opacity-50">Last Update: {new Date(collar.timestamp).toLocaleTimeString()}</span>
                                            <button className="btn-popup-action" onClick={() => handleDeleteCollar(collar)}>
                                                <Trash2 size={12} /> Remove
                                            </button>
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

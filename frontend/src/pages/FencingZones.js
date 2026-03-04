import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import {
    Fence,
    Plus,
    Trash2,
    Edit,
    MapPin,
    Clock,
    AlertTriangle,
    Power,
    Layers,
    Navigation,
    Shield,
    Activity,
    Maximize2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './FencingZones.css';
import { MapScaleAndMeasure } from '../components/MapControls';

const API_URL = 'http://localhost:3001';

// Component to fit map bounds to fences on first load
function FitBounds({ fences, hasInitialFit }) {
    const map = useMap();

    useEffect(() => {
        if (hasInitialFit.current) return;
        if (fences.length === 0) return;

        const bounds = L.latLngBounds([]);
        fences.forEach(fence => {
            fence.positions.forEach(pos => bounds.extend(pos));
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
            hasInitialFit.current = true;
        }
    }, [map, fences, hasInitialFit]);

    return null;
}

// Draw Control Component
function DrawControlNative({ onCreated }) {
    const map = useMap();

    useEffect(() => {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
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
                    shapeOptions: {
                        color: '#00F2FF',
                        fillColor: '#00F2FF',
                        fillOpacity: 0.2,
                        weight: 2
                    }
                },
            },
            edit: {
                featureGroup: drawnItems,
            },
        });
        map.addControl(drawControl);

        const onCreatedHandler = (e) => {
            drawnItems.addLayer(e.layer);
            onCreated(e);
        };

        map.on(L.Draw.Event.CREATED, onCreatedHandler);

        return () => {
            map.off(L.Draw.Event.CREATED, onCreatedHandler);
            map.removeControl(drawControl);
            map.removeLayer(drawnItems);
        };
    }, [map, onCreated]);

    return null;
}

function FencingZones() {
    const [fences, setFences] = useState([]);
    const [collars, setCollars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newFenceName, setNewFenceName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [pendingFence, setPendingFence] = useState(null);
    const hasInitialFit = useRef(false);

    const fetchData = async () => {
        try {
            const [fencesRes, collarsRes] = await Promise.all([
                axios.get(`${API_URL}/api/fences`),
                axios.get(`${API_URL}/api/collars/latest`)
            ]);

            const formattedFences = fencesRes.data.map(f => ({
                id: f.id,
                name: f.name || `Zone ${f.id}`,
                positions: f.geo_json.coordinates[0].map(coord => [coord[1], coord[0]]),
                createdAt: f.created_at,
                isActive: f.is_active
            }));

            setFences(formattedFences);
            setCollars(collarsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleFence = async (id, name, currentStatus) => {
        const action = currentStatus ? 'disable' : 'enable';
        if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} fence "${name}"?`)) return;

        try {
            await axios.patch(`${API_URL}/api/fences/${id}/toggle`);
            fetchData();
        } catch (error) {
            console.error(`Error toggling fence ${id}:`, error);
        }
    };

    const handleCreate = async (e) => {
        const { layer } = e;
        const geojson = layer.toGeoJSON();
        setPendingFence(geojson.geometry);
        setShowCreateForm(true);
    };

    const saveFence = async () => {
        if (!pendingFence) return;

        try {
            await axios.post(`${API_URL}/api/fences`, {
                name: newFenceName || `Zone ${Date.now()}`,
                geo_json: pendingFence
            });
            setShowCreateForm(false);
            setNewFenceName('');
            setPendingFence(null);
            fetchData();
        } catch (error) {
            console.error("Error saving fence", error);
        }
    };

    const handleDeleteFence = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/api/fences/${id}`);
            fetchData();
        } catch (error) {
            console.error(`Error deleting fence ${id}`, error);
        }
    };

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
        <div className="fencing-zones-container">
            <header className="page-header-premium">
                <div className="header-content">
                    <h2 className="title-gradient">Virtual Boundaries</h2>
                    <p className="subtitle">High-precision geofencing and perimeter management</p>
                </div>
                <div className="header-actions">
                    <button className="btn-premium" onClick={() => setShowCreateForm(true)}>
                        <Plus size={18} /> New Zone
                    </button>
                </div>
            </header>

            <div className="zones-grid">
                {fences.map(fence => (
                    <div key={fence.id} className={`zone-premium-card ${!fence.isActive ? 'inactive' : ''}`}>
                        <div className="zone-card-top">
                            <div className="zone-icon-wrapper">
                                <Shield size={20} className={fence.isActive ? 'text-cyan' : 'text-muted'} />
                            </div>
                            <div className="zone-title-group">
                                <h3 className="zone-name">{fence.name}</h3>
                                <span className={`status-pill ${fence.isActive ? 'active' : 'idle'}`}>
                                    {fence.isActive ? 'Shield Active' : 'Shield Inactive'}
                                </span>
                            </div>
                        </div>

                        <div className="zone-card-stats">
                            <div className="stat-item">
                                <MapPin size={14} className="opacity-50" />
                                <span>{fence.positions.length} Vertices</span>
                            </div>
                            <div className="stat-item">
                                <Clock size={14} className="opacity-50" />
                                <span>{new Date(fence.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="zone-card-actions">
                            <button
                                className={`btn-action ${fence.isActive ? 'deactivate' : 'activate'}`}
                                onClick={() => handleToggleFence(fence.id, fence.name, fence.isActive)}
                            >
                                <Power size={14} /> {fence.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                                className="btn-action delete"
                                onClick={() => handleDeleteFence(fence.id, fence.name)}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="zone-premium-card add-card" onClick={() => setShowCreateForm(true)}>
                    <div className="add-content">
                        <div className="plus-icon"><Plus size={32} /></div>
                        <p>Create Virtual Fence</p>
                    </div>
                </div>
            </div>

            <div className="card-premium map-editor-card">
                <div className="card-header-premium">
                    <div className="header-icon-group">
                        <Navigation size={18} className="text-cyan" />
                        <h3 className="card-title">Spatial Perimeter Editor</h3>
                    </div>
                    <div className="header-badges">
                        <span className="badge-cyan">RTK-GNSS Enabled</span>
                    </div>
                </div>
                <div className="zone-map-wrapper">
                    <MapContainer center={mapCenter} zoom={15} scrollWheelZoom={true} className="map-engine">
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Vector Map">
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Terrain View">
                                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                            </LayersControl.BaseLayer>
                        </LayersControl>

                        <DrawControlNative onCreated={handleCreate} />
                        <FitBounds fences={fences} hasInitialFit={hasInitialFit} />
                        <MapScaleAndMeasure />

                        {fences.map(fence => (
                            <Polygon
                                key={fence.id}
                                positions={fence.positions}
                                pathOptions={{
                                    color: fence.isActive ? '#00F2FF' : '#4a5568',
                                    fillColor: fence.isActive ? '#00F2FF' : '#4a5568',
                                    fillOpacity: fence.isActive ? 0.15 : 0.05,
                                    weight: 2,
                                    dashArray: fence.isActive ? null : '8, 8'
                                }}
                            />
                        ))}
                    </MapContainer>
                </div>
            </div>

            {showCreateForm && (
                <div className="modal-overlay-premium">
                    <div className="modal-premium">
                        <div className="modal-header">
                            <Shield size={24} className="text-cyan" />
                            <h3>Define New Perimeter</h3>
                        </div>
                        <div className="modal-body">
                            <div className="input-group-premium">
                                <label>Perimeter Identifier</label>
                                <input
                                    type="text"
                                    value={newFenceName}
                                    onChange={(e) => setNewFenceName(e.target.value)}
                                    placeholder="e.g. North Pasture Alpha"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-ghost" onClick={() => setShowCreateForm(false)}>
                                Abort
                            </button>
                            <button className="btn-premium" onClick={saveFence}>
                                Commit Boundary
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FencingZones;

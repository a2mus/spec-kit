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
    Power
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
                        color: '#10B981',
                        fillOpacity: 0.3
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
            alert(`Failed to ${action} fence. Please try again.`);
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
            alert('Failed to save fence. Please try again.');
        }
    };

    const handleDeleteFence = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/api/fences/${id}`);
            fetchData();
        } catch (error) {
            console.error(`Error deleting fence ${id}`, error);
            alert('Failed to delete fence. Please try again.');
        }
    };

    // Calculate cattle count per zone (simplified - just count all for now)
    const getCattleInZone = (fence) => {
        // In a real implementation, you'd use point-in-polygon algorithm
        return Math.floor(Math.random() * collars.length);
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
        <div className="fencing-zones">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2>Virtual Fencing Zones</h2>
                    <p className="text-secondary">Manage and monitor your virtual boundaries</p>
                </div>
            </div>

            {/* Zone Cards Grid */}
            <div className="grid grid-cols-3">
                {fences.map(fence => (
                    <div key={fence.id} className={`zone-card ${!fence.isActive ? 'zone-card-inactive' : ''}`}>
                        <div className="zone-header">
                            <div className="zone-title">
                                <div className="zone-color" style={{ background: fence.isActive ? '#3B82F6' : '#6B7280' }}></div>
                                {fence.name}
                            </div>
                            <div className="zone-actions">
                                <button
                                    className={`btn btn-icon ${fence.isActive ? 'btn-warning' : 'btn-success'}`}
                                    onClick={() => handleToggleFence(fence.id, fence.name, fence.isActive)}
                                    title={fence.isActive ? 'Disable fence' : 'Enable fence'}
                                >
                                    <Power size={16} />
                                </button>
                                <button
                                    className="btn btn-icon btn-secondary"
                                    onClick={() => handleDeleteFence(fence.id, fence.name)}
                                    title="Delete zone"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="zone-stats">
                            <div className="zone-stat">
                                <MapPin size={14} />
                                <span className="zone-stat-value">{fence.positions.length}</span> vertices
                            </div>
                            <div className="zone-stat">
                                <Clock size={14} />
                                {fence.createdAt ? new Date(fence.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                        <div className="zone-status">
                            <span className={`badge ${fence.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                {fence.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Add New Zone Card */}
                <div className="zone-card zone-card-add">
                    <div className="add-zone-content">
                        <Fence size={32} />
                        <p>Draw on the map below to create a new zone</p>
                    </div>
                </div>
            </div>

            {/* Map for Zone Creation */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Zone Editor</h3>
                    <p className="text-secondary text-sm">Use the polygon tool to draw new boundaries. Click existing zones on map to delete.</p>
                </div>
                <div className="zone-map">
                    <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={true}>
                        {/* Layer Control for switching between Street and Satellite views */}
                        <LayersControl position="topright">
                            <LayersControl.BaseLayer checked name="Street Map">
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    maxZoom={19}
                                />
                            </LayersControl.BaseLayer>
                            <LayersControl.BaseLayer name="Satellite">
                                <TileLayer
                                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                    maxZoom={19}
                                />
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
                                    color: fence.isActive ? '#3B82F6' : '#6B7280',
                                    fillColor: fence.isActive ? '#3B82F6' : '#6B7280',
                                    fillOpacity: fence.isActive ? 0.2 : 0.1,
                                    weight: fence.isActive ? 2 : 1,
                                    dashArray: fence.isActive ? null : '5, 5'
                                }}
                                eventHandlers={{
                                    click: () => handleDeleteFence(fence.id, fence.name)
                                }}
                            />
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Create Zone Modal */}
            {showCreateForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create New Zone</h3>
                        <div className="form-group">
                            <label>Zone Name</label>
                            <input
                                type="text"
                                value={newFenceName}
                                onChange={(e) => setNewFenceName(e.target.value)}
                                placeholder="Enter zone name..."
                                autoFocus
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setPendingFence(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={saveFence}>
                                Create Zone
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FencingZones;

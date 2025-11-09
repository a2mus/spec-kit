import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import './App.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const cowIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/officel/40/000000/cow.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});


const API_URL = 'http://localhost:3001';

function App() {
    const [fences, setFences] = useState([]);
    const [collars, setCollars] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const DrawControlNative = ({ onCreated }) => {
        const map = useMap();
        const drawnItemsRef = useRef(null);
        const drawControlRef = useRef(null);

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
                console.log('[Draw] created at', new Date().toISOString());
                setIsDrawing(false);
                drawnItemsRef.current.addLayer(e.layer);
                onCreated(e);
            };
            const onDrawStartHandler = () => {
                console.log('[Draw] start at', new Date().toISOString());
                setIsDrawing(true);
            };
            const onDrawStopHandler = () => {
                console.log('[Draw] stop at', new Date().toISOString());
                setIsDrawing(false);
            };

            map.on(L.Draw.Event.CREATED, onCreatedHandler);
            map.on('draw:start', onDrawStartHandler);
            map.on('draw:stop', onDrawStopHandler);

            return () => {
                map.off(L.Draw.Event.CREATED, onCreatedHandler);
                map.off('draw:start', onDrawStartHandler);
                map.off('draw:stop', onDrawStopHandler);
                if (drawControlRef.current) {
                    map.removeControl(drawControlRef.current);
                    drawControlRef.current = null;
                }
                if (drawnItemsRef.current) {
                    map.removeLayer(drawnItemsRef.current);
                    drawnItemsRef.current = null;
                }
            };
        }, []);

        return null;
    };

    const fetchFences = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/fences`);
            const formattedFences = response.data.map(f => ({
                id: f.id,
                positions: f.geo_json.coordinates[0].map(coord => [coord[1], coord[0]]) // GeoJSON is [lon, lat]
            }));
            setFences(formattedFences);
        } catch (error) {
            console.error("Error fetching fences", error);
        }
    };
    
    // Fetch fences on mount only to avoid interrupting draw interactions
    useEffect(() => {
        fetchFences();
    }, []);

    // Poll collars, but pause during drawing to reduce re-renders
    useEffect(() => {
        if (isDrawing) return;

        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/api/collars/latest`);
                setCollars(response.data);
            } catch (error) {
                console.error("Error fetching latest collar data", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [isDrawing]);

    const handleCreate = async (e) => {
        const { layer } = e;
        const geojson = layer.toGeoJSON();
        console.log("Fence created:", geojson);

        try {
            await axios.post(`${API_URL}/api/fences`, {
                name: `Fence ${new Date().getTime()}`,
                geo_json: geojson.geometry
            });
            // Refetch fences to display the new one
            fetchFences();
        } catch (error) {
            console.error("Error saving fence", error);
        }
    };

    const handleDeleteFence = async (id) => {
        const ok = window.confirm(`Delete fence ${id}? This cannot be undone.`);
        if (!ok) return;
        try {
            await axios.delete(`${API_URL}/api/fences/${id}`);
            // Refetch fences to reflect deletion
            fetchFences();
        } catch (error) {
            console.error(`Error deleting fence ${id}`, error);
            alert('Failed to delete fence. Please try again.');
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                Virtual Fencing System Dashboard
            </header>
            <MapContainer center={[36.7359, 3.34018]} zoom={14} doubleClickZoom={false} scrollWheelZoom={true} style={{ height: 'calc(100vh - 56px)', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DrawControlNative onCreated={handleCreate} />
                
                {fences.map(fence => (
                    <Polygon
                        key={fence.id}
                        positions={fence.positions}
                        pathOptions={{ color: 'blue', className: 'fence-polygon' }}
                        eventHandlers={{
                            click: () => handleDeleteFence(fence.id)
                        }}
                    />
                ))}

                {!isDrawing && collars.map(collar => (
                    <Marker key={collar.collar_id} position={[collar.latitude, collar.longitude]} icon={cowIcon}>
                        <Popup>
                           <div className="popup-content">
                                <strong>Collar ID:</strong> {collar.collar_id}<br/>
                                <strong>Timestamp:</strong> {new Date(collar.timestamp).toLocaleString()}<br/>
                                <strong>Battery:</strong> {collar.battery_voltage}V<br/>
                                <strong>Body Temp:</strong> {collar.body_temp}°C<br/>
                                <strong>Activity:</strong> {collar.activity}<br/>
                                <strong>Lat:</strong> {collar.latitude.toFixed(6)}<br/>
                                <strong>Lon:</strong> {collar.longitude.toFixed(6)}
                           </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default App;

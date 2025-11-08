import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
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
    
    useEffect(() => {
        fetchFences();
        
        const interval = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/api/collars/latest`);
                setCollars(response.data);
            } catch (error) {
                console.error("Error fetching latest collar data", error);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

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

    return (
        <div className="app-container">
            <header className="header">
                Virtual Fencing System Dashboard
            </header>
            <MapContainer center={[54.07, -1.99]} zoom={14} scrollWheelZoom={true}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FeatureGroup>
                    <EditControl
                        position="topleft"
                        onCreated={handleCreate}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                        }}
                    />
                </FeatureGroup>
                
                {fences.map(fence => (
                    <Polygon key={fence.id} positions={fence.positions} color="blue" />
                ))}

                {collars.map(collar => (
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

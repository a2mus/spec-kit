import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, LayersControl, Polyline, CircleMarker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import * as turf from '@turf/turf';
import {
    Maximize2,
    RefreshCw,
    Crosshair,
    Eye,
    EyeOff,
    Navigation
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './LiveMap.css';
import GeofenceAlertNotification from '../components/GeofenceAlertNotification';
import { MapScaleAndMeasure } from '../components/MapControls';
import { useLanguageDirection } from '../hooks/useLanguageDirection';
import KPIHud from '../components/layout/KPIHud';
import CowContextCard from '../components/map/CowContextCard';
import { useHealthAlerts } from '../hooks/useHealthAlerts';
import AlertHistorySidebar from '../components/layout/AlertHistorySidebar';

// Component to fit map bounds to fences and cattle
function FitBounds({ fences, collars, hasInitialFit }) {
    const map = useMap();

    useEffect(() => {
        if (hasInitialFit.current) return;
        if (fences.length === 0 && collars.length === 0) return;

        const bounds = L.latLngBounds([]);
        fences.forEach(fence => {
            fence.positions.forEach(pos => {
                bounds.extend(pos);
            });
        });
        collars.forEach(collar => {
            if (collar.latitude && collar.longitude) {
                bounds.extend([collar.latitude, collar.longitude]);
            }
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 16 });
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

const BUFFER_ZONES = [
    { name: 'warning_1', outerDistance: 10, innerDistance: 15, color: '#EAB308', label: 'Warning 1 (10-15m)' },
    { name: 'warning_2', outerDistance: 5, innerDistance: 10, color: '#F97316', label: 'Warning 2 (5-10m)' },
    { name: 'breach', outerDistance: 0, innerDistance: 5, color: '#EF4444', label: 'Breach (<5m)' }
];

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
                let outerPoly = zone.outerDistance === 0 ? fencePolygon : turf.buffer(fencePolygon, -zone.outerDistance / 1000, { units: 'kilometers' });
                const innerPoly = turf.buffer(fencePolygon, -zone.innerDistance / 1000, { units: 'kilometers' });
                if (!outerPoly || !outerPoly.geometry) return;
                const outerPositions = outerPoly.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                let innerPositions = null;
                if (innerPoly && innerPoly.geometry && innerPoly.geometry.coordinates[0]) {
                    innerPositions = innerPoly.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
                }
                bufferZones.push({ name: zone.name, outerPositions, innerPositions, color: zone.color, label: zone.label });
            } catch (e) { }
        });
        return bufferZones;
    } catch (error) {
        return [];
    }
};

const createCowIcon = (status, alertState = 'safe', direction = 'stationary') => {
    const colors = { healthy: '#10B981', warning: '#F59E0B', alert: '#EF4444' };
    const isAlerting = alertState && alertState !== 'safe';
    const blinkClass = isAlerting ? 'blink-alert' : '';
    let alertIcon = '';
    if (alertState === 'warning_1') alertIcon = `<div class="alert-overlay speaker">🔊</div>`;
    else if (alertState === 'warning_2') alertIcon = `<div class="alert-overlay speaker-intense">🔊🔊</div>`;
    else if (alertState === 'breach') alertIcon = `<div class="alert-overlay shock">⚡</div>`;

    return new L.DivIcon({
        className: 'custom-cattle-marker',
        html: `<div class="cattle-marker ${status} ${blinkClass}"><svg width="32" height="32" viewBox="0 0 24 24" fill="${colors[status]}"><circle cx="12" cy="12" r="10" fill="${colors[status]}" opacity="0.2"/><circle cx="12" cy="12" r="6" fill="${colors[status]}"/></svg>${alertIcon}</div>`,
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

function DrawControlNative({ onCreated }) {
    const map = useMap();
    const drawnItemsRef = useRef(null);
    const drawControlRef = useRef(null);
    const onCreatedRef = useRef(onCreated);

    useEffect(() => { onCreatedRef.current = onCreated; }, [onCreated]);
    useEffect(() => {
        if (!drawnItemsRef.current) {
            drawnItemsRef.current = new L.FeatureGroup();
            map.addLayer(drawnItemsRef.current);
        }
        if (!drawControlRef.current) {
            drawControlRef.current = new L.Control.Draw({
                position: 'bottomright',
                draw: { rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false, polygon: { allowIntersection: false, showArea: true } },
                edit: { featureGroup: drawnItemsRef.current }
            });
            map.addControl(drawControlRef.current);
        }
        const onCreatedHandler = (e) => {
            drawnItemsRef.current.addLayer(e.layer);
            if (onCreatedRef.current) onCreatedRef.current(e);
        }
        map.on(L.Draw.Event.CREATED, onCreatedHandler);
        return () => {
            map.off(L.Draw.Event.CREATED, onCreatedHandler);
            if (drawControlRef.current) { map.removeControl(drawControlRef.current); drawControlRef.current = null; }
            if (drawnItemsRef.current) { map.removeLayer(drawnItemsRef.current); drawnItemsRef.current = null; }
        };
    }, [map]);
    return null;
}

function LiveMap() {
    const { t, isRTL } = useLanguageDirection();
    const [searchParams] = useSearchParams();
    const [fences, setFences] = useState([]);
    const [collars, setCollars] = useState([]);
    const [selectedCollarId, setSelectedCollarId] = useState(null);
    const [isHealthSidebarOpen, setIsHealthSidebarOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showBufferZones, setShowBufferZones] = useState(true);
    const [positionHistory, setPositionHistory] = useState({});
    const [showTrails, setShowTrails] = useState(true);
    const hasInitialFit = useRef(false);
    const hasZoomedToCollar = useRef(false);
    const mapRef = useRef(null);
    const previousCollarsRef = useRef(null);
    const { healthAlerts, summary: healthSummary, dismissAlert: dismissHealthAlert } = useHealthAlerts();

    const totalCattle = collars.length;
    const activeAlerts = collars.filter(c => c.alert_state && c.alert_state !== 'safe').length;
    const healthScore = totalCattle > 0
        ? Math.round((collars.filter(c => getCollarStatus(c) === 'healthy').length / totalCattle) * 100)
        : 100;

    const selectedCollarData = collars.find(c => c.collar_id === selectedCollarId);

    const fetchFences = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/fences`);
            const formattedFences = response.data.map(f => ({
                id: f.id,
                name: f.name,
                positions: f.geo_json.coordinates[0].map(coord => [coord[1], coord[0]])
            }));
            setFences(formattedFences);
        } catch (error) { }
    };

    const fetchCollars = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/collars/latest`);
            setCollars(response.data);
        } catch (error) { }
    };

    const fetchPositionHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/collars/position-history?limit=50`);
            setPositionHistory(response.data);
        } catch (error) { }
    };

    useEffect(() => {
        fetchFences(); fetchCollars(); fetchPositionHistory();
        const interval = setInterval(() => { fetchCollars(); fetchPositionHistory(); }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const collarId = searchParams.get('collar');
        if (collarId && collars.length > 0 && mapRef.current && !hasZoomedToCollar.current) {
            const targetCollar = collars.find(c => c.collar_id === parseInt(collarId));
            if (targetCollar && targetCollar.latitude && targetCollar.longitude) {
                mapRef.current.setView([targetCollar.latitude, targetCollar.longitude], 18);
                setSelectedCollarId(targetCollar.collar_id);
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
        } catch (error) { }
    };

    const mapCenter = [36.7359, 3.34018];

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900">
            <GeofenceAlertNotification
                collars={collars}
                previousCollarsRef={previousCollarsRef}
                healthAlerts={healthAlerts}
                onDismissHealth={dismissHealthAlert}
            />

            <KPIHud
                totalCattle={totalCattle}
                activeAlerts={activeAlerts}
                healthScore={healthScore}
                healthAlertsCount={healthSummary.total}
                onHealthAlertClick={() => setIsHealthSidebarOpen(true)}
            />

            <AlertHistorySidebar
                alerts={healthAlerts}
                isOpen={isHealthSidebarOpen}
                onClose={() => setIsHealthSidebarOpen(false)}
                onDismiss={dismissHealthAlert}
            />

            {selectedCollarData && (
                <CowContextCard collar={selectedCollarData} onClose={() => setSelectedCollarId(null)} />
            )}

            <div className="absolute inset-0 z-0">
                <MapContainer center={mapCenter} zoom={15} scrollWheelZoom={true} ref={mapRef} className="w-full h-full" zoomControl={false}>
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

                    {showTrails && collars.map(collar => {
                        const history = positionHistory[collar.collar_id];
                        if (!history || history.length < 2) return null;
                        const status = getCollarStatus(collar);
                        const trailColor = status === 'healthy' ? '#10B981' : status === 'warning' ? '#F59E0B' : '#EF4444';
                        const positions = history.map(h => [h.latitude, h.longitude]);
                        return (
                            <Polyline key={`trail-${collar.collar_id}`} positions={positions} pathOptions={{ color: trailColor, weight: 2, opacity: 0.3, dashArray: '4, 8' }} />
                        );
                    })}

                    {collars.map(collar => {
                        const status = getCollarStatus(collar);
                        return (
                            <Marker
                                key={collar.id}
                                position={[collar.latitude, collar.longitude]}
                                icon={createCowIcon(status, collar.alert_state)}
                                eventHandlers={{ click: () => setSelectedCollarId(collar.collar_id) }}
                            />
                        );
                    })}
                </MapContainer>
            </div>

            <div className={`absolute top-24 z-10 flex flex-col gap-2 ${isRTL ? 'right-6' : 'left-6'}`}>
                <div className="flex flex-col bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-1">
                    <button className="p-3 text-white/60 hover:text-white transition-colors" onClick={fetchCollars} title="Refresh Fleet Data"><RefreshCw size={20} /></button>
                    <button className="p-3 text-white/60 hover:text-white transition-colors" onClick={() => {
                        if (mapRef.current) {
                            const bounds = L.latLngBounds([]);
                            fences.forEach(f => f.positions.forEach(p => bounds.extend(p)));
                            collars.forEach(c => bounds.extend([c.latitude, c.longitude]));
                            if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [100, 100] });
                        }
                    }} title="Focus All Units"><Crosshair size={20} /></button>
                    <button className={`p-3 transition-colors ${showBufferZones ? 'text-emerald-400' : 'text-white/60 hover:text-white'}`} onClick={() => setShowBufferZones(!showBufferZones)} title="Toggle Zones">{showBufferZones ? <Eye size={20} /> : <EyeOff size={20} />}</button>
                    <button className={`p-3 transition-colors ${showTrails ? 'text-emerald-400' : 'text-white/60 hover:text-white'}`} onClick={() => setShowTrails(!showTrails)} title="Toggle Trails"><Navigation size={20} /></button>
                </div>
            </div>

            {showBufferZones && (
                <div className={`absolute bottom-32 z-10 p-4 backdrop-blur-md bg-black/30 border border-white/10 rounded-2xl ${isRTL ? 'left-6' : 'right-6'}`}>
                    <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 pb-2 border-b border-white/5">{t('herd_efficiency')}</div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-white/70"><div className="w-3 h-2 rounded-full bg-emerald-500"></div> Safe Area</div>
                        <div className="flex items-center gap-3 text-xs text-white/70"><div className="w-3 h-2 rounded-full bg-amber-500"></div> Outer Buffer</div>
                        <div className="flex items-center gap-3 text-xs text-white/70"><div className="w-3 h-2 rounded-full bg-orange-500"></div> Critical Buffer</div>
                        <div className="flex items-center gap-3 text-xs text-white/70"><div className="w-3 h-2 rounded-full bg-rose-500"></div> Breach Zone</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiveMap;

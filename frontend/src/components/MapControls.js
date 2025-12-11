import { useEffect, useState, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Adds a scale control to the map
 * Shows metric (meters/km) scale bar
 */
export function ScaleControl({ position = 'bottomleft' }) {
    const map = useMap();

    useEffect(() => {
        const scaleControl = L.control.scale({
            position: position,
            metric: true,
            imperial: false,
            maxWidth: 150
        });

        scaleControl.addTo(map);

        return () => {
            map.removeControl(scaleControl);
        };
    }, [map, position]);

    return null;
}

/**
 * Adds an interactive measure tool to the map
 * Click to start measuring, click points to add to path, double-click to finish
 */
export function MeasureControl({ position = 'topleft' }) {
    const map = useMap();
    const [measuring, setMeasuring] = useState(false);
    const measurePointsRef = useRef([]);
    const measureLayerRef = useRef(null);
    const measureControlRef = useRef(null);

    useEffect(() => {
        // Create layer group for measure markers and lines
        measureLayerRef.current = L.layerGroup().addTo(map);

        // Create custom control
        const MeasureControlClass = L.Control.extend({
            onAdd: function () {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-measure');

                const button = L.DomUtil.create('a', 'measure-button', container);
                button.href = '#';
                button.title = 'Measure distance';
                button.innerHTML = '📏';
                button.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    font-size: 16px;
                    text-decoration: none;
                    background: white;
                    cursor: pointer;
                `;

                L.DomEvent.on(button, 'click', function (e) {
                    L.DomEvent.stopPropagation(e);
                    L.DomEvent.preventDefault(e);
                    toggleMeasure();
                });

                return container;
            }
        });

        const toggleMeasure = () => {
            setMeasuring(prev => !prev);
        };

        measureControlRef.current = new MeasureControlClass({ position: position });
        measureControlRef.current.addTo(map);

        return () => {
            if (measureControlRef.current) {
                map.removeControl(measureControlRef.current);
            }
            if (measureLayerRef.current) {
                map.removeLayer(measureLayerRef.current);
            }
        };
    }, [map, position]);

    // Handle measuring mode
    useEffect(() => {
        if (!map) return;

        const measureLayer = measureLayerRef.current;

        const formatDistance = (meters) => {
            if (meters >= 1000) {
                return (meters / 1000).toFixed(2) + ' km';
            }
            return Math.round(meters) + ' m';
        };

        const calculateTotalDistance = (points) => {
            let total = 0;
            for (let i = 1; i < points.length; i++) {
                total += points[i - 1].distanceTo(points[i]);
            }
            return total;
        };

        const updateMeasureLine = () => {
            measureLayer.clearLayers();
            const points = measurePointsRef.current;

            if (points.length === 0) return;

            // Draw polyline
            if (points.length > 1) {
                const line = L.polyline(points, {
                    color: '#3B82F6',
                    weight: 3,
                    dashArray: '10, 5'
                });
                measureLayer.addLayer(line);
            }

            // Draw markers with distance labels
            points.forEach((point, index) => {
                const marker = L.circleMarker(point, {
                    radius: 6,
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 1
                });

                if (index > 0) {
                    const segmentDist = points[index - 1].distanceTo(point);
                    const totalDist = calculateTotalDistance(points.slice(0, index + 1));

                    // Add distance label
                    const label = L.tooltip({
                        permanent: true,
                        direction: 'top',
                        className: 'measure-tooltip',
                        offset: [0, -10]
                    }).setContent(`
                        <div style="text-align: center; font-size: 12px;">
                            <div><strong>${formatDistance(totalDist)}</strong></div>
                            <div style="font-size: 10px; color: #666;">(+${formatDistance(segmentDist)})</div>
                        </div>
                    `);

                    marker.bindTooltip(label);
                } else {
                    marker.bindTooltip('Start', { permanent: true, direction: 'top', offset: [0, -10] });
                }

                measureLayer.addLayer(marker);
            });
        };

        const onMapClick = (e) => {
            measurePointsRef.current.push(e.latlng);
            updateMeasureLine();
        };

        const onMapDblClick = (e) => {
            L.DomEvent.stopPropagation(e);
            // Finish measuring
            setMeasuring(false);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setMeasuring(false);
            }
        };

        if (measuring) {
            // Clear previous measurements
            measurePointsRef.current = [];
            measureLayer.clearLayers();

            // Change cursor
            map.getContainer().style.cursor = 'crosshair';

            // Add event listeners
            map.on('click', onMapClick);
            map.on('dblclick', onMapDblClick);
            document.addEventListener('keydown', onKeyDown);

            // Update button style to show active state
            const button = map.getContainer().querySelector('.measure-button');
            if (button) {
                button.style.background = '#3B82F6';
                button.style.color = 'white';
            }
        } else {
            // Reset cursor
            map.getContainer().style.cursor = '';

            // Remove event listeners
            map.off('click', onMapClick);
            map.off('dblclick', onMapDblClick);
            document.removeEventListener('keydown', onKeyDown);

            // Update button style
            const button = map.getContainer().querySelector('.measure-button');
            if (button) {
                button.style.background = 'white';
                button.style.color = 'black';
            }
        }

        return () => {
            map.off('click', onMapClick);
            map.off('dblclick', onMapDblClick);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [measuring, map]);

    return null;
}

/**
 * Combined component that adds both scale and measure controls
 */
export function MapScaleAndMeasure({ scalePosition = 'bottomleft', measurePosition = 'topleft' }) {
    return (
        <>
            <ScaleControl position={scalePosition} />
            <MeasureControl position={measurePosition} />
        </>
    );
}

export default MapScaleAndMeasure;

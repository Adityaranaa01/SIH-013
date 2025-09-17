// src/components/UserLocationMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker images for Vite/TS projects
// If your build complains about these imports, add src/global.d.ts with "declare module '*.png';"
// import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
// import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
// L.Icon.Default.mergeOptions({
//     iconUrl: markerIconUrl as string,
//     shadowUrl: markerShadowUrl as string,
// });

type LatLng = { lat: number; lng: number; ts?: number };

function CenterOnPosition({ position }: { position: LatLng | null }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            // keep a modest zoom (13) but don't zoom out if user already zoomed in
            map.setView([position.lat, position.lng], Math.max(map.getZoom(), 13), { animate: true });
        }
    }, [position, map]);
    return null;
}

export default function UserLocationMap() {
    const [userPos, setUserPos] = useState<LatLng | null>(null);
    const watchIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            console.warn('Geolocation not supported by browser.');
            return;
        }

        // start watching position
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude, ts: pos.timestamp });
            },
            (err) => {
                console.error('Geolocation error:', err);
                // You can show a friendly UI message here if you want.
            },
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );

        watchIdRef.current = id;

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, []);

    const fallbackCenter: LatLng = { lat: 12.9716, lng: 77.5946 }; // Bangalore fallback — change if you want

    return (
        <div style={{ height: '70vh', width: '100%' }}>
            <MapContainer
                center={[userPos?.lat ?? fallbackCenter.lat, userPos?.lng ?? fallbackCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {userPos && (
                    <>
                        {/* Marker drawn above circle via zIndexOffset */}
                        <Marker
                            position={[userPos.lat, userPos.lng]}
                            // bring marker visually above overlay layers
                            zIndexOffset={1000}
                        >
                            <Popup>Your current location</Popup>
                        </Marker>

                        {/* clamp accuracy so the circle is not massive when accuracy is poor */}
                        <Circle
                            center={[userPos.lat, userPos.lng]}
                            // clamp accuracy between 8m and 100m (change max to 30 for smaller circle)
                            radius={15}
                            pathOptions={{
                                color: "#1976d2",       // subtle outline color
                                fillColor: "#1976d2",   // subtle fill
                                fillOpacity: 0.08,      // make it faint
                                weight: 1,
                            }}
                        />
                    </>
                )}

                <CenterOnPosition position={userPos} />

            </MapContainer>
        </div>
    );
}


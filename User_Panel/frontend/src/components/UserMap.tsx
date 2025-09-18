import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number; ts?: number };

function CenterOnPosition({ position }: { position: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], Math.max(map.getZoom(), 13), {
        animate: true,
      });
    }
  }, [position, map]);
  return null;
}

export default function UserLocationMap() {
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported by browser.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: pos.timestamp,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
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
    <div style={{ height: "70vh", width: "100%" }}>
      <MapContainer
        center={[
          userPos?.lat ?? fallbackCenter.lat,
          userPos?.lng ?? fallbackCenter.lng,
        ]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {userPos && (
          <>
            <Marker position={[userPos.lat, userPos.lng]} zIndexOffset={1000}>
              <Popup>Your current location</Popup>
            </Marker>

            <Circle
              center={[userPos.lat, userPos.lng]}
              radius={15}
              pathOptions={{
                color: "#1976d2", // subtle outline color
                fillColor: "#1976d2", // subtle fill
                fillOpacity: 0.08, // make it faint
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

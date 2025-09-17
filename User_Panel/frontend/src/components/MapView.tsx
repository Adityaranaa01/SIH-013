// src/components/MapView.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";
import { Crosshair } from "lucide-react";
import cityConfig from "../config/cityConfig";

// Fix for default markers (uses public/marker-icon.png and public/marker-shadow.png)
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface BusData {
  id: string;
  route: string;
  currentLocation: { lat: number; lng: number };
  eta: string;
  timeToDestination: string;
  nextStop: string;
}

interface MapViewProps {
  bus: BusData;
  onBack: () => void;
  allBuses: BusData[];
}

type LatLngWithAccuracy = {
  lat: number;
  lng: number;
  ts?: number;
  accuracy?: number;
};

// Calculate distance between two points in meters using the Haversine formula
function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export function MapView({ bus, onBack, allBuses }: MapViewProps) {
  const [selectedBus, setSelectedBus] = useState<BusData>(bus);
  const [map, setMap] = useState<L.Map | null>(null);
  const [legendOpen, setLegendOpen] = useState<boolean>(true);
  const [userPos, setUserPos] = useState<LatLngWithAccuracy | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>(
    "Getting location..."
  );
  const watchIdRef = useRef<number | null>(null);

  // Update selectedBus when real-time data changes for the same bus
  useEffect(() => {
    const updatedBus = allBuses.find(b => b.id === selectedBus.id);
    if (updatedBus) {
      setSelectedBus(updatedBus);
    }
  }, [allBuses, selectedBus.id]);

  useEffect(() => {
    const interval = setInterval(() => {}, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation is not supported by your browser");
      setLocationStatus("Geolocation not supported by your browser");
      return;
    }

    console.log("Starting geolocation tracking...");
    setLocationStatus("Requesting location permission...");

    // Check if we already have permission
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          console.log("Geolocation permission status:", result.state);
          if (result.state === "denied") {
            setLocationStatus(
              "Location permission denied. Please enable location access in your browser settings."
            );
          } else if (result.state === "prompt") {
            setLocationStatus("Please allow location access when prompted...");
          }
        })
        .catch((err) => {
          console.log("Permission query failed:", err);
        });
    }

    let positionUpdateCount = 0;
    let bestAccuracy = Infinity;
    let fallbackPosition: LatLngWithAccuracy | null = null;
    let geolocationTimeout: number | null = null;

    // Set a timeout to handle cases where geolocation takes too long
    geolocationTimeout = setTimeout(() => {
      if (!userPos) {
        console.log(
          "Geolocation timeout - no position received, trying fallback"
        );
        setLocationStatus("Trying fallback location method...");

        // Try with less strict options as fallback
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log(
              "Fallback position accuracy:",
              pos.coords.accuracy,
              "m"
            );
            setUserPos({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              ts: pos.timestamp,
              accuracy: pos.coords.accuracy,
            });
            setLocationStatus(
              `Location found! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
            );
          },
          (error) => {
            console.warn("Fallback position also failed:", error);
            setLocationStatus(
              "Unable to get location. Please check your browser settings and try again."
            );
          },
          {
            enableHighAccuracy: false, // Less strict
            maximumAge: 60000, // Allow cached position up to 1 minute
            timeout: 15000, // Shorter timeout
          }
        );
      }
    }, 15000); // 15 second timeout

    // First get a quick initial position with high accuracy
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Initial position accuracy:", pos.coords.accuracy, "m");
        if (geolocationTimeout) {
          clearTimeout(geolocationTimeout);
          geolocationTimeout = null;
        }

        // Accept any initial position to get something on the map
        console.log("=== GPS DIAGNOSTICS ===");
        console.log("Position accuracy:", pos.coords.accuracy, "m");
        console.log(
          "Position coordinates:",
          pos.coords.latitude,
          pos.coords.longitude
        );
        console.log("Timestamp:", new Date(pos.timestamp).toLocaleString());
        console.log("Altitude:", pos.coords.altitude);
        console.log("Altitude accuracy:", pos.coords.altitudeAccuracy);
        console.log("Heading:", pos.coords.heading);
        console.log("Speed:", pos.coords.speed);

        // Detect WiFi positioning (very poor accuracy, no altitude/speed/heading)
        const isWifiPositioning =
          pos.coords.accuracy > 10000 &&
          pos.coords.altitude === null &&
          pos.coords.speed === null &&
          pos.coords.heading === null;

        if (isWifiPositioning) {
          console.log("⚠️  DETECTED: WiFi positioning (very inaccurate)");
          console.log("💡 SOLUTION: Switch to mobile data for GPS accuracy");
        } else if (pos.coords.accuracy > 1000) {
          console.log("⚠️  DETECTED: Poor GPS signal");
        } else {
          console.log("✅ DETECTED: Good GPS signal");
        }
        console.log("=========================");

        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          ts: pos.timestamp,
          accuracy: pos.coords.accuracy,
        });
        bestAccuracy = pos.coords.accuracy;

        if (isWifiPositioning) {
          setLocationStatus(
            `WiFi positioning detected! Accuracy: ±${Math.round(
              pos.coords.accuracy / 1000
            )}km. Switch to mobile data for GPS accuracy.`
          );
        } else if (pos.coords.accuracy <= 50) {
          setLocationStatus(
            `Location found! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
          );
        } else {
          setLocationStatus(
            `Initial location found! Accuracy: ±${Math.round(
              pos.coords.accuracy
            )}m (improving...)`
          );
        }
      },
      (error) => {
        console.warn("Initial position failed:", error);
        console.warn("Error code:", error.code);
        console.warn("Error message:", error.message);

        if (geolocationTimeout) {
          clearTimeout(geolocationTimeout);
          geolocationTimeout = null;
        }

        let errorMessage = "Failed to get initial location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please check your device settings.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        setLocationStatus(errorMessage);
      },
      {
        enableHighAccuracy: true, // Use high accuracy from the start
        maximumAge: 0, // Never use cached positions
        timeout: 10000, // Reasonable timeout for initial position
      }
    );

    // Then start watching with high accuracy
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        positionUpdateCount++;
        console.log(`=== POSITION UPDATE #${positionUpdateCount} ===`);
        console.log("Accuracy:", pos.coords.accuracy, "m");
        console.log("Coordinates:", pos.coords.latitude, pos.coords.longitude);
        console.log("Altitude:", pos.coords.altitude);
        console.log("Speed:", pos.coords.speed);
        console.log("Heading:", pos.coords.heading);
        console.log("Best accuracy so far:", bestAccuracy, "m");

        // Detect WiFi positioning in updates too
        const isWifiPositioning =
          pos.coords.accuracy > 10000 &&
          pos.coords.altitude === null &&
          pos.coords.speed === null &&
          pos.coords.heading === null;

        if (isWifiPositioning) {
          console.log("⚠️  WiFi positioning detected in update");
        }
        console.log("=====================================");

        // More lenient accuracy filtering - accept positions with accuracy up to 100m initially
        const MAX_ACCEPTABLE_ACCURACY = 100; // meters - more lenient threshold for initial fix
        const IDEAL_ACCURACY = 10; // meters - ideal accuracy we want
        const POOR_ACCURACY_THRESHOLD = 1000; // meters - very poor accuracy, but still usable

        // Always store the best accuracy we've seen
        if (pos.coords.accuracy < bestAccuracy) {
          bestAccuracy = pos.coords.accuracy;
        }

        // If this is a very good position, always accept it
        if (pos.coords.accuracy <= IDEAL_ACCURACY) {
          console.log(
            "Accepting high accuracy position:",
            pos.coords.accuracy,
            "m"
          );
          setUserPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: pos.timestamp,
            accuracy: pos.coords.accuracy,
          });
          setLocationStatus(
            `High accuracy location! ±${Math.round(pos.coords.accuracy)}m`
          );
          return;
        }

        // For the first few updates, accept any position to get something on the map
        if (positionUpdateCount <= 3) {
          console.log(
            "Accepting initial position (update #" + positionUpdateCount + "):",
            pos.coords.accuracy,
            "m"
          );
          setUserPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: pos.timestamp,
            accuracy: pos.coords.accuracy,
          });
          setLocationStatus(
            `Initial location found! Accuracy: ±${Math.round(
              pos.coords.accuracy
            )}m (improving...)`
          );
          return;
        }

        // For positions with moderate accuracy, be more selective
        if (pos.coords.accuracy <= MAX_ACCEPTABLE_ACCURACY) {
          setUserPos((prevPos) => {
            // If we don't have a position yet, accept this one
            if (!prevPos) {
              console.log(
                "Setting initial position with accuracy:",
                pos.coords.accuracy,
                "m"
              );
              setLocationStatus(
                `Location found! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
              );
              return {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                ts: pos.timestamp,
                accuracy: pos.coords.accuracy,
              };
            }

            // If this position is significantly better, accept it
            if (prevPos.accuracy && pos.coords.accuracy < prevPos.accuracy * 0.7) {
              console.log(
                "Updating to better position. New accuracy:",
                pos.coords.accuracy,
                "m (was:",
                prevPos.accuracy,
                "m)"
              );
              setLocationStatus(
                `Location improved! Accuracy: ±${Math.round(
                  pos.coords.accuracy
                )}m`
              );
              return {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                ts: pos.timestamp,
                accuracy: pos.coords.accuracy,
              };
            }

            // If current position is very poor (>1000m) and new one is better, accept it
            if (
              prevPos.accuracy && prevPos.accuracy > POOR_ACCURACY_THRESHOLD &&
              pos.coords.accuracy < prevPos.accuracy
            ) {
              console.log(
                "Updating from very poor position. New accuracy:",
                pos.coords.accuracy,
                "m (was:",
                prevPos.accuracy,
                "m)"
              );
              setLocationStatus(
                `Location improving! Accuracy: ±${Math.round(
                  pos.coords.accuracy
                )}m`
              );
              return {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                ts: pos.timestamp,
                accuracy: pos.coords.accuracy,
              };
            }

            // If position has moved significantly (more than 10m), accept it
            const distance = getDistanceFromLatLonInMeters(
              prevPos.lat,
              prevPos.lng,
              pos.coords.latitude,
              pos.coords.longitude
            );

            if (distance > 10) {
              console.log(
                "Position moved significantly, updating. Distance:",
                distance,
                "m, accuracy:",
                pos.coords.accuracy,
                "m"
              );
              setLocationStatus(
                `Location updated! Accuracy: ±${Math.round(
                  pos.coords.accuracy
                )}m`
              );
              return {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                ts: pos.timestamp,
                accuracy: pos.coords.accuracy,
              };
            }

            return prevPos;
          });
        } else {
          console.log(
            "Rejecting low accuracy position:",
            pos.coords.accuracy,
            "m (threshold:",
            MAX_ACCEPTABLE_ACCURACY,
            "m)"
          );
          // If we have a position but it's very poor, show that we're still trying to improve
          if (userPos && userPos.accuracy && userPos.accuracy > POOR_ACCURACY_THRESHOLD) {
            setLocationStatus(
              `Location found but accuracy is poor (±${Math.round(
                userPos.accuracy
              )}m). Improving...`
            );
          }
        }

        // After 10 position updates, if accuracy is still very poor, try restarting with different settings
        if (positionUpdateCount >= 10 && userPos && userPos.accuracy && userPos.accuracy > 10000) {
          console.log(
            "Accuracy still very poor after 10 updates, trying GPS-only mode"
          );
          setLocationStatus("Trying GPS-only mode for better accuracy...");

          // Clear current watch and restart with GPS-only settings
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }

          // Restart with more aggressive GPS settings
          const newWatchId = navigator.geolocation.watchPosition(
            (pos) => {
              console.log(
                "GPS-only position update:",
                pos.coords.accuracy,
                "m"
              );
              if (userPos.accuracy && pos.coords.accuracy < userPos.accuracy) {
                setUserPos({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  ts: pos.timestamp,
                  accuracy: pos.coords.accuracy,
                });
                setLocationStatus(
                  `GPS mode! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
                );
              }
            },
            (error) => {
              console.warn("GPS-only mode failed:", error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 60000, // Longer timeout for GPS
            }
          );
          watchIdRef.current = newWatchId;
        }

        // After 10 position updates, if we still don't have a good position, use fallback
        if (positionUpdateCount >= 10 && !userPos && fallbackPosition) {
          console.log("Using fallback position after 10 updates");
          setUserPos(fallbackPosition);
          const accuracy = (fallbackPosition as LatLngWithAccuracy).accuracy || 0;
          setLocationStatus(
            `Using fallback location. Accuracy: ±${Math.round(accuracy)}m`
          );
        }
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        let errorMessage = "Location tracking error. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Please enable location access in your browser settings.";
            setLocationStatus(errorMessage);
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please check your device settings.";
            setLocationStatus(errorMessage);
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            setLocationStatus(errorMessage);
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
            setLocationStatus(errorMessage);
            break;
        }
      },
      {
        enableHighAccuracy: true, // Force GPS usage
        maximumAge: 0, // Never use cached positions
        timeout: 30000, // Longer timeout for better accuracy
      }
    );
    watchIdRef.current = id;
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (geolocationTimeout) {
        clearTimeout(geolocationTimeout);
        geolocationTimeout = null;
      }
    };
  }, []);

  // Default the legend to open on desktop and collapsed on small screens
  useEffect(() => {
    try {
      setLegendOpen(window.innerWidth > 420);
    } catch (e) {
      setLegendOpen(true);
    }
  }, []);

  const selectedBusPosition: [number, number] = [
    selectedBus.currentLocation.lat,
    selectedBus.currentLocation.lng,
  ];

  const formatLastUpdated = () => new Date().toLocaleTimeString();

  const centerMapOnUser = () => {
    console.log("Center button clicked");
    console.log("Map available:", !!map);
    console.log("User position available:", !!userPos);
    console.log("User position:", userPos);

    if (map && userPos) {
      console.log("Centering map on user position:", userPos.lat, userPos.lng);
      map.setView([userPos.lat, userPos.lng], 15, { animate: true });
    } else if (!userPos) {
      console.log("No user position available yet");
      setLocationStatus("No location available yet. Please wait...");

      // Try to get location again if it's not available
      if ("geolocation" in navigator) {
        console.log("Attempting to get location again...");
        setLocationStatus("Retrying location request...");
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log("Retry position accuracy:", pos.coords.accuracy, "m");
            setUserPos({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              ts: pos.timestamp,
              accuracy: pos.coords.accuracy,
            });
            setLocationStatus(
              `Location found! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
            );
            // Center the map after getting the position
            if (map) {
              map.setView([pos.coords.latitude, pos.coords.longitude], 15, {
                animate: true,
              });
            }
          },
          (error) => {
            console.warn("Retry position failed:", error.message);
            setLocationStatus(
              "Location request failed. Please check permissions."
            );
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          }
        );
      }
    } else if (!map) {
      console.log("Map not ready yet");
      setLocationStatus("Map not ready yet. Please wait...");
    }
  };

  // When the map container's size changes (responsive layout / window resize)
  // Leaflet sometimes needs an explicit invalidateSize() call so tiles render.
  useEffect(() => {
    if (!map) return;
    // Invalidate size once so Leaflet recalculates when the map mounts
    setTimeout(() => map.invalidateSize(), 0);
    const onResize = () => {
      // small timeout to let the layout settle
      setTimeout(() => map.invalidateSize(), 50);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [map]);

  // Helper to create an SVG pulsing icon as a data URL. Uses SMIL animations so it doesn't
  // depend on external CSS being applied to Leaflet's divIcon.
  const createPulsingSvgIcon = (color = "#1976d2") => {
    const size = 40;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>\n  <defs>\n    <radialGradient id='g' cx='50%' cy='50%' r='50%'>\n      <stop offset='0%' stop-color='${color}' stop-opacity='0.9'/>\n      <stop offset='100%' stop-color='${color}' stop-opacity='0.3'/>\n    </radialGradient>\n  </defs>\n  <g transform='translate(${
      size / 2
    }, ${
      size / 2
    })'>\n    <!-- animated ring -->\n    <circle r='6' fill='none' stroke='${color}' stroke-opacity='0.25' stroke-width='3'>\n      <animate attributeName='r' from='6' to='18' dur='1.6s' repeatCount='indefinite' />\n      <animate attributeName='opacity' from='0.9' to='0' dur='1.6s' repeatCount='indefinite' />\n    </circle>\n    <!-- solid dot -->\n    <circle r='6' fill='${color}' />\n  </g>\n</svg>`;

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Live Location</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[60vh] lg:h-[calc(100vh-120px)]">
        <div className="flex-1 lg:w-3/4 relative">
          <div className="p-4 h-full w-full">
            {/*
              Ensure the map container always has a non-zero explicit height on small screens.
              Tailwind percentage heights rely on parent having a defined height; set min-heights
              across breakpoints so the map is visible under 1024px.
            */}
            <div
              className="map-wrap relative z-0 rounded-md overflow-visible"
              style={{
                minHeight: "40vh",
                height: "auto",
                clipPath: "inset(0 round 0.5rem)",
              }}
            >
              {/* Using style height ensures Leaflet has a concrete pixel height to render into */}
              <MapContainer
                center={selectedBusPosition}
                zoom={13}
                scrollWheelZoom
                className="w-full rounded-md"
                style={{ height: "100%", zIndex: 0 }}
                ref={setMap}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController center={selectedBusPosition} />

                <Marker
                  key={`selected-bus-${selectedBus.id}-${selectedBus.currentLocation.lat}-${selectedBus.currentLocation.lng}`}
                  position={selectedBusPosition}
                  icon={L.divIcon({
                    className: "custom-marker-selected",
                    html: `<div class="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-200 shadow-lg"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{selectedBus.id}</p>
                      <p>{selectedBus.route}</p>
                      <p className="text-xs mt-1">
                        Next Stop: {selectedBus.nextStop}
                      </p>
                      <p className="text-xs">ETA: {selectedBus.eta}</p>
                    </div>
                  </Popup>
                </Marker>

                {allBuses
                  .filter((b) => b.id !== selectedBus.id)
                  .map((bus) => (
                    <Marker
                      key={`bus-${bus.id}-${bus.currentLocation.lat}-${bus.currentLocation.lng}`}
                      position={[
                        bus.currentLocation.lat,
                        bus.currentLocation.lng,
                      ]}
                      icon={L.divIcon({
                        className: "custom-marker-dimmed",
                        html: `<div class="w-3 h-3 rounded-full bg-gray-400 opacity-60"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6],
                      })}
                      eventHandlers={{ click: () => setSelectedBus(bus) }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{bus.id}</p>
                          <p>{bus.route}</p>
                          <p className="text-xs mt-1">
                            Next Stop: {bus.nextStop}
                          </p>
                          <p className="text-xs">ETA: {bus.eta}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                {userPos && (
                  <>
                    {/* Accuracy circle */}
                    <Circle
                      center={[userPos.lat, userPos.lng]}
                      radius={userPos.accuracy || 0}
                      pathOptions={{
                        color: "#1976d2",
                        fillColor: "#1976d2",
                        fillOpacity: 0.1,
                        weight: 1,
                      }}
                    />
                    {/* Pulsing user marker implemented as an SVG data-url icon (SMIL animation) */}
                    <Marker
                      position={[userPos.lat, userPos.lng]}
                      icon={L.icon({
                        iconUrl: createPulsingSvgIcon(),
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                        className: "leaflet-user-marker",
                      })}
                      zIndexOffset={100000}
                    >
                      <Popup>
                        <div>
                          <p className="font-semibold">Your Location</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Accuracy: ±{Math.round(userPos.accuracy || 0)}m
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}
              </MapContainer>

              {/* Floating overlays: legend, badges, center button */}
              {/* Collapsible legend: show a mini toggle when collapsed, the full card when open */}
              {/* mini toggle shown when closed */}
              {/* Mini-toggle always rendered so we can animate its vertical position when the legend opens */}
              <button
                aria-label={legendOpen ? "Close legend" : "Open legend"}
                onClick={() => setLegendOpen((s) => !s)}
                className={`absolute z-[9999] map-legend-mini p-2 rounded-full bg-card/90 border border-border/60 shadow-sm ${
                  legendOpen ? "map-legend-mini--moved" : ""
                }`}
                style={{
                  top: `var(${
                    legendOpen
                      ? "--map-legend-top-open"
                      : "--map-legend-top-closed"
                  })`,
                  left: "1rem",
                  opacity: legendOpen ? 0 : 1,
                }}
              >
                {/* small legend icon (three lines + dot) */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="5"
                    width="12"
                    height="2"
                    rx="1"
                    fill="currentColor"
                  />
                  <circle
                    cx="19"
                    cy="6"
                    r="2"
                    fill="currentColor"
                    opacity="0.8"
                  />
                  <rect
                    x="4"
                    y="11"
                    width="12"
                    height="2"
                    rx="1"
                    fill="currentColor"
                    opacity="0.9"
                  />
                  <rect
                    x="4"
                    y="17"
                    width="8"
                    height="2"
                    rx="1"
                    fill="currentColor"
                    opacity="0.9"
                  />
                </svg>
              </button>

              {/* Animated legend card: always present but toggles open/closed classes */}
              <Card
                className={`absolute bg-card/90 backdrop-blur-sm border-border/50 map-legend z-[9999] pointer-events-auto ${
                  legendOpen ? "map-legend-open" : "map-legend-closed"
                }`}
                style={{
                  left: "1rem",
                  top: `var(${
                    legendOpen
                      ? "--map-legend-top-open"
                      : "--map-legend-top-closed"
                  })`,
                }}
                aria-hidden={!legendOpen}
              >
                <button
                  aria-label="Close legend"
                  onClick={() => setLegendOpen(false)}
                  className="absolute top-2 right-2 map-legend-close p-1 rounded hover:bg-muted/10"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <CardHeader className="pb-2 map-legend-header">
                  <CardTitle className="text-sm map-legend-title">
                    Map Legend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 map-legend-content">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200 map-legend-icon"></div>
                    <span>Selected Bus (Active)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-gray-400 opacity-60 map-legend-icon"></div>
                    <span>Other Buses (Dimmed)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/50">
                    <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 map-legend-bar"></div>
                    <span>Active Route</span>
                  </div>
                </CardContent>
              </Card>

              <Badge
                variant="outline"
                className="absolute top-4 right-4 gap-1 animate-pulse bg-card/90 backdrop-blur-sm z-[9999] pointer-events-auto"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" /> Live
                Tracking
              </Badge>

              {/* Location Status Badge */}
              <Badge
                variant="outline"
                className="absolute top-16 right-4 bg-card/90 backdrop-blur-sm z-[9999] pointer-events-auto text-xs"
              >
                {locationStatus}
              </Badge>

              {/* Manual Location Request Button - only show if no location */}
              {!userPos && (
                <Badge
                  variant="outline"
                  className="absolute top-28 right-4 bg-card/90 backdrop-blur-sm z-[9999] pointer-events-auto"
                >
                  <button
                    onClick={() => {
                      console.log("Manual location request clicked");
                      setLocationStatus("Requesting location...");
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          console.log(
                            "Manual position accuracy:",
                            pos.coords.accuracy,
                            "m"
                          );
                          setUserPos({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            ts: pos.timestamp,
                            accuracy: pos.coords.accuracy,
                          });
                          setLocationStatus(
                            `Location found! Accuracy: ±${Math.round(
                              pos.coords.accuracy
                            )}m`
                          );
                        },
                        (error) => {
                          console.warn("Manual position failed:", error);
                          setLocationStatus(
                            "Location request failed. Please check permissions."
                          );
                        },
                        {
                          enableHighAccuracy: true,
                          maximumAge: 0,
                          timeout: 10000,
                        }
                      );
                    }}
                    className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  >
                    Request Location
                  </button>
                </Badge>
              )}

              {/* WiFi Positioning Warning - show if accuracy is very poor */}
              {userPos && userPos.accuracy && userPos.accuracy > 10000 && (
                <Badge
                  variant="outline"
                  className="absolute top-28 right-4 bg-card/90 backdrop-blur-sm z-[9999] pointer-events-auto max-w-xs"
                >
                  <div className="text-xs text-center p-2">
                    <div className="font-semibold text-orange-600 mb-1">
                      ⚠️ WiFi Positioning
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Switch to mobile data for accurate GPS location
                    </div>
                  </div>
                </Badge>
              )}

              {/* Force GPS Button - show if location exists but accuracy is poor */}
              {userPos &&
                userPos.accuracy &&
                userPos.accuracy > 1000 &&
                userPos.accuracy <= 10000 && (
                  <Badge
                    variant="outline"
                    className="absolute top-28 right-4 bg-card/90 backdrop-blur-sm z-[9999] pointer-events-auto"
                  >
                    <button
                      onClick={() => {
                        console.log("Force GPS clicked");
                        setLocationStatus("Forcing GPS mode...");

                        // Clear current watch
                        if (watchIdRef.current !== null) {
                          navigator.geolocation.clearWatch(watchIdRef.current);
                        }

                        // Force GPS with very aggressive settings
                        const newWatchId = navigator.geolocation.watchPosition(
                          (pos) => {
                            console.log(
                              "Force GPS position:",
                              pos.coords.accuracy,
                              "m"
                            );
                            setUserPos({
                              lat: pos.coords.latitude,
                              lng: pos.coords.longitude,
                              ts: pos.timestamp,
                              accuracy: pos.coords.accuracy,
                            });
                            setLocationStatus(
                              `GPS forced! Accuracy: ±${Math.round(
                                pos.coords.accuracy
                              )}m`
                            );
                          },
                          (error) => {
                            console.warn("Force GPS failed:", error);
                            setLocationStatus(
                              "GPS force failed. Try moving to an open area."
                            );
                          },
                          {
                            enableHighAccuracy: true,
                            maximumAge: 0,
                            timeout: 120000, // 2 minutes timeout
                          }
                        );
                        watchIdRef.current = newWatchId;
                      }}
                      className="px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                    >
                      Force GPS
                    </button>
                  </Badge>
                )}

              <Badge
                variant="outline"
                className="absolute bottom-0 right-4 bg-transparent border-none shadow-none z-[9999] pointer-events-auto rounded-full mx-2 mb-2 p-0"
              >
                <button
                  onClick={centerMapOnUser}
                  disabled={!map || !userPos}
                  className={`p-3 rounded-full shadow-md flex items-center justify-center py-3 transition-all duration-200 ${
                    map && userPos
                      ? "bg-white dark:bg-slate-800/90 hover:shadow-lg cursor-pointer"
                      : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  title={
                    map && userPos
                      ? "Center on your location"
                      : "Location not available yet"
                  }
                >
                  <Crosshair
                    className={`w-5 h-5 ${
                      map && userPos
                        ? "text-gray-700 dark:text-gray-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  />
                </button>
              </Badge>
            </div>
          </div>
        </div>

        <div className="lg:w-1/4 lg:min-w-80 bg-card/50 backdrop-blur-sm border-l border-border/50 p-4 space-y-4 overflow-y-auto">
          <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{selectedBus.id}</span>
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
                >
                  Active
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedBus.route}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      ETA at Next Stop
                    </p>
                    <p className="font-semibold">{selectedBus.eta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Time to Destination
                    </p>
                    <p className="font-semibold">
                      {selectedBus.timeToDestination}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Current Coordinates
                  </p>
                  <p className="font-mono text-xs bg-muted/50 p-1 rounded">
                    {selectedBus.currentLocation.lat.toFixed(4)},{" "}
                    {selectedBus.currentLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatLastUpdated()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Other Buses (
                {allBuses.length - 1})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allBuses
                  .filter((busItem) => busItem.id !== selectedBus.id)
                  .map((busItem) => (
                    <div
                      key={busItem.id}
                      className="flex items-center justify-between p-2 bg-muted/20 rounded cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedBus(busItem)}
                    >
                      <div>
                        <p className="font-medium text-sm">{busItem.id}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {busItem.route}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{busItem.eta}</p>
                        <p className="text-xs text-muted-foreground">ETA</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

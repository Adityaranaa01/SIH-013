// src/components/MapView.tsx
import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    const interval = setInterval(() => {}, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.warn("Geolocation is not supported by your browser");
      return;
    }

    let positionUpdateCount = 0;
    let bestAccuracy = Infinity;
    let fallbackPosition: LatLngWithAccuracy | null = null;

    // First get a quick initial position with high accuracy
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Initial position accuracy:", pos.coords.accuracy, "m");
        if (pos.coords.accuracy <= 50) {
          // Accept initial position if accuracy is reasonable
          setUserPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: pos.timestamp,
            accuracy: pos.coords.accuracy,
          });
          bestAccuracy = pos.coords.accuracy;
          setLocationStatus(
            `Location found! Accuracy: ±${Math.round(pos.coords.accuracy)}m`
          );
        } else {
          // Store as fallback if accuracy is poor
          fallbackPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ts: pos.timestamp,
            accuracy: pos.coords.accuracy,
          };
          setLocationStatus(
            `Initial location found but accuracy is poor (±${Math.round(
              pos.coords.accuracy
            )}m). Improving...`
          );
        }
      },
      (error) => {
        console.warn("Initial position failed:", error.message);
        setLocationStatus("Failed to get initial location. Trying again...");
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
        console.log(
          `Position update #${positionUpdateCount}, accuracy: ${pos.coords.accuracy}m`
        );

        // More lenient accuracy filtering - accept positions with accuracy up to 30m
        const MAX_ACCEPTABLE_ACCURACY = 30; // meters - more reasonable threshold
        const IDEAL_ACCURACY = 10; // meters - ideal accuracy we want

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
            if (pos.coords.accuracy < prevPos.accuracy * 0.7) {
              console.log(
                "Updating to better position. New accuracy:",
                pos.coords.accuracy,
                "m"
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
            "m"
          );
        }

        // After 10 position updates, if we still don't have a good position, use fallback
        if (positionUpdateCount >= 10 && !userPos && fallbackPosition) {
          console.log("Using fallback position after 10 updates");
          setUserPos(fallbackPosition);
          setLocationStatus(
            `Using fallback location. Accuracy: ±${Math.round(
              fallbackPosition.accuracy
            )}m`
          );
        }
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Please enable location services to see your position on the map."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert(
              "Location information is unavailable. Please check your device settings."
            );
            break;
          case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
          default:
            alert(
              "An unknown error occurred while trying to get your location."
            );
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
    if (map && userPos)
      map.setView([userPos.lat, userPos.lng], 15, { animate: true });
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
                      key={bus.id}
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

              <Badge
                variant="outline"
                className="absolute bottom-0 right-4 bg-transparent border-none shadow-none z-[9999] pointer-events-auto rounded-full mx-2 mb-2 p-0"
              >
                <button
                  onClick={centerMapOnUser}
                  className="bg-white dark:bg-slate-800/90 p-3 rounded-full 
              shadow-md hover:shadow-lg flex items-center justify-center py-3"
                >
                  <Crosshair className="w-5 h-5 text-gray-700 dark:text-gray-200" />
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

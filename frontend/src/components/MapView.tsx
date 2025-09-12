import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, MapPin, Clock, Navigation } from "lucide-react";

// Fix for default markers
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Add this component for auto-centering on selected bus
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

export function MapView({ bus, onBack, allBuses }: MapViewProps) {
  const [selectedBus, setSelectedBus] = useState<BusData>(bus);
  const [map, setMap] = useState<L.Map | null>(null);

  // Update bus locations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Here you would typically fetch new locations from your API
      // For now, we'll just use the existing data
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const selectedBusPosition: [number, number] = [
    selectedBus.currentLocation.lat,
    selectedBus.currentLocation.lng,
  ];

  // Add this before the return statement
  const formatLastUpdated = () => {
    return new Date().toLocaleTimeString();
  };

  // Replace the map placeholder with actual map
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Title and Back Button */}
      <header className="p-4 border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Live Location</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Map Container - 70-80% of space */}
        <div className="flex-1 lg:w-3/4 relative">
          <div
            className="absolute inset-0 m-4"
            style={{ height: "100%", width: "100%" }}
          >
            <MapContainer
              center={selectedBusPosition}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
              whenReady={(map) => setMap(map.target)}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={selectedBusPosition} />

              {/* Selected Bus Marker */}
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

              {/* Other Buses Markers */}
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
                    eventHandlers={{
                      click: () => setSelectedBus(bus),
                    }}
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
            </MapContainer>

            {/* Floating Legend */}
            <Card className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border-border/50 w-48">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
                  <span>Selected Bus (Active)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-gray-400 opacity-60"></div>
                  <span>Other Buses (Dimmed)</span>
                </div>
                <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/50">
                  <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                  <span>Active Route</span>
                </div>
              </CardContent>
            </Card>

            {/* Live Status Indicator */}
            <Badge
              variant="outline"
              className="absolute top-4 right-4 gap-1 animate-pulse bg-card/90 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Live Tracking
            </Badge>
          </div>
        </div>

        {/* Info Panel - 20-30% of space */}
        <div className="lg:w-1/4 lg:min-w-80 bg-card/50 backdrop-blur-sm border-l border-border/50 p-4 space-y-4 overflow-y-auto">
          {/* Selected Bus Details */}
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
              {/* ETA and Time to Destination */}
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

              {/* Current Location */}
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

              {/* Last Updated */}
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatLastUpdated()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Other Buses Quick List */}
          <Card className="bg-card/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Other Buses ({allBuses.length - 1})
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

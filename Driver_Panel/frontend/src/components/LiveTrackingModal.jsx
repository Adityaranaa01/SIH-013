import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { MapPin, X, Navigation, Clock, Wifi, WifiOff, ArrowLeft, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map controller component to handle map centering
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const LiveTrackingModal = ({ isOpen, onClose, trip }) => {
    const [busLocation, setBusLocation] = useState(null);
    const [locationHistory, setLocationHistory] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [map, setMap] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const socketRef = useRef(null);

    useEffect(() => {
        if (isOpen && trip) {
            connectToSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isOpen, trip]);

    // Fix map size when it mounts
    useEffect(() => {
        if (map) {
            setMapLoading(false);
            console.log('Map created:', map);
            setTimeout(() => {
                map.invalidateSize();
                console.log('Map size invalidated');
            }, 100);
        }
    }, [map]);

    const connectToSocket = () => {
        if (!trip) return;

        const socket = io('http://localhost:5000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to tracking server');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from tracking server');
        });

        socket.on('bus-location-update', (data) => {
            console.log('Received bus-location-update:', data);
            if (data.tripId === trip.trip_id) {
                updateBusLocation(data);
            }
        });

        // Listen for initial location response
        socket.on('location-update', (data) => {
            console.log('Received location-update:', data);
            if (data.tripId === trip.trip_id) {
                updateBusLocation(data);
            }
        });

        // Request initial location data
        socket.emit('request-location', { tripId: trip.trip_id });
    };

    const updateBusLocation = (locationData) => {
        const newLocation = {
            lat: locationData.latitude,
            lng: locationData.longitude,
            timestamp: locationData.timestamp,
            accuracy: locationData.accuracy
        };

        setBusLocation(newLocation);
        setLastUpdate(new Date(locationData.timestamp));
        setAccuracy(locationData.accuracy);

        // Add to location history
        setLocationHistory(prev => [...prev, newLocation]);
    };

    const getAccuracyStatus = (acc) => {
        if (acc < 10) return 'Excellent';
        if (acc < 50) return 'Good';
        if (acc < 100) return 'Fair';
        if (acc < 500) return 'Poor';
        return 'Very Poor';
    };

    const getAccuracyColor = (acc) => {
        if (acc < 10) return 'text-green-600';
        if (acc < 50) return 'text-blue-600';
        if (acc < 100) return 'text-yellow-600';
        if (acc < 500) return 'text-orange-600';
        return 'text-red-600';
    };

    const centerMapOnBus = () => {
        if (map && busLocation) {
            map.setView([busLocation.lat, busLocation.lng], 15, {
                animate: true,
            });
        }
    };

    const formatLastUpdated = () => {
        if (!lastUpdate) return 'Never';
        const now = new Date();
        const diff = Math.floor((now - lastUpdate) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return lastUpdate.toLocaleTimeString();
    };


    // Get bus position for map
    const busPosition = busLocation ? [busLocation.lat, busLocation.lng] : [12.9716, 77.5946];

    if (!isOpen || !trip) return null;

    console.log('Rendering LiveTrackingModal with trip:', trip);
    console.log('Bus position:', busPosition);
    console.log('Map state:', map);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-none w-screen h-screen p-0 m-0 rounded-none">
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    {/* Header */}
                    <header className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-gray-900/30 backdrop-blur-md">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold mb-2">Live Bus Tracking</h1>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </header>

                    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
                        {/* Map Section */}
                        <div className="flex-1 lg:w-4/5 relative">
                            <div className="p-2 h-full w-full">
                                <div
                                    className="map-wrap relative z-0 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800"
                                    style={{
                                        height: "100%",
                                        width: "100%",
                                    }}
                                >
                                    {mapLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Loading map...</p>
                                            </div>
                                        </div>
                                    )}
                                    <MapContainer
                                        center={busPosition}
                                        zoom={13}
                                        scrollWheelZoom
                                        className="w-full h-full rounded-md"
                                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                                        whenCreated={(mapInstance) => {
                                            console.log('MapContainer whenCreated called:', mapInstance);
                                            setMap(mapInstance);
                                        }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <MapController center={busPosition} />

                                        {/* Bus Location Marker */}
                                        {busLocation && (
                                            <>
                                                <Marker
                                                    position={[busLocation.lat, busLocation.lng]}
                                                    icon={L.divIcon({
                                                        className: "custom-marker-selected",
                                                        html: `<div class="w-4 h-4 rounded-full ring-4 ring-red-200 shadow-lg" style="background-color: #ef4444"></div>`,
                                                        iconSize: [16, 16],
                                                        iconAnchor: [8, 8],
                                                    })}
                                                >
                                                    <Popup>
                                                        <div className="text-sm">
                                                            <p className="font-bold">Bus {trip.bus_number}</p>
                                                            <p>{trip.drivers?.assigned_route || 'Unassigned'}</p>
                                                            <p className="text-xs mt-1">
                                                                Driver: {trip.drivers?.name || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs">Accuracy: ±{Math.round(busLocation.accuracy)}m</p>
                                                        </div>
                                                    </Popup>
                                                </Marker>

                                                {/* Accuracy Circle */}
                                                <Circle
                                                    center={[busLocation.lat, busLocation.lng]}
                                                    radius={Math.min(busLocation.accuracy || 50, 200)}
                                                    pathOptions={{
                                                        color: "#ef4444",
                                                        fillColor: "#ef4444",
                                                        fillOpacity: 0.1,
                                                        weight: 1,
                                                    }}
                                                />
                                            </>
                                        )}

                                        {/* Movement Path */}
                                        {locationHistory.length > 1 && (
                                            <Polyline
                                                positions={locationHistory.map(loc => [loc.lat, loc.lng])}
                                                pathOptions={{
                                                    color: '#ef4444',
                                                    weight: 4,
                                                    opacity: 0.8
                                                }}
                                            />
                                        )}
                                    </MapContainer>

                                    {!map && !mapLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                                            <div className="text-center">
                                                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Map failed to load</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Please refresh the page</p>
                                                {busLocation && (
                                                    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                                                        <p className="text-sm font-medium">Bus Location:</p>
                                                        <p className="text-xs font-mono">{busLocation.lat.toFixed(6)}, {busLocation.lng.toFixed(6)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Center on Bus Button */}
                                    <Badge
                                        variant="outline"
                                        className="absolute bottom-0 right-4 bg-transparent border-none shadow-none z-[9999] pointer-events-auto rounded-full mx-2 mb-2 p-0"
                                    >
                                        <button
                                            onClick={centerMapOnBus}
                                            disabled={!map || !busLocation}
                                            className={`p-3 rounded-full shadow-md flex items-center justify-center py-3 transition-all duration-200 ${map && busLocation
                                                ? "bg-white dark:bg-slate-800/90 hover:shadow-lg cursor-pointer"
                                                : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50"
                                                }`}
                                            title={
                                                map && busLocation
                                                    ? "Center on bus location"
                                                    : "Bus location not available yet"
                                            }
                                        >
                                            <Crosshair
                                                className={`w-5 h-5 ${map && busLocation
                                                    ? "text-gray-700 dark:text-gray-200"
                                                    : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                            />
                                        </button>
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:w-1/5 lg:min-w-72 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-l border-gray-200 dark:border-gray-700 p-3 space-y-4 overflow-y-auto">
                            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-blue-200 dark:border-blue-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="text-base">Bus {trip.bus_number}</span>
                                        <Badge
                                            variant="outline"
                                            className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs"
                                        >
                                            Active
                                        </Badge>
                                    </CardTitle>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {trip.drivers?.assigned_route || 'Unassigned Route'}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Last Update
                                                </p>
                                                <p className="text-sm font-semibold">{formatLastUpdated()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-3 h-3 text-blue-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    GPS Accuracy
                                                </p>
                                                <p className={`text-sm font-semibold ${getAccuracyColor(accuracy)}`}>
                                                    ±{Math.round(accuracy || 0)}m ({getAccuracyStatus(accuracy || 0)})
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {busLocation && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3 h-3 text-blue-600" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    Coordinates
                                                </p>
                                                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded break-all">
                                                    {busLocation.lat.toFixed(4)}, {busLocation.lng.toFixed(4)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isConnected ? (
                                                <Wifi className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <WifiOff className="w-3 h-3 text-red-500" />
                                            )}
                                            <p className="text-xs font-medium">
                                                {isConnected ? 'Live' : 'Offline'}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{locationHistory.length} updates</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LiveTrackingModal;
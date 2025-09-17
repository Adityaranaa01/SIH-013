import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { ArrowLeft, MapPin, Clock, Wifi, WifiOff, Bus, Activity } from "lucide-react";

interface DriverPageProps {
  onBack: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export function DriverPage({ onBack }: DriverPageProps) {
  const [driverId, setDriverId] = useState("");
  const [busId, setBusId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [error, setError] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleStartTracking = async () => {
    if (!driverId.trim() || !busId.trim()) {
      setError("Please enter both Driver ID and Bus ID");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    try {
      // Request location permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      setLocationData({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
        accuracy: position.coords.accuracy
      });

      // Start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setLocationData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error("Location error:", error);
          setError("Failed to get location updates");
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setWatchId(id);
      setIsTracking(true);
      setIsRegistered(true);
      setError("");
    } catch (err) {
      setError("Failed to access location. Please enable location permissions.");
    }
  };

  const handleStopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
    setLocationData(null);
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Driver Dashboard</h1>
              <p className="text-sm text-muted-foreground">GPS Location Tracking</p>
            </div>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {!isRegistered ? (
          /* Registration Form */
          <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Driver Registration
              </CardTitle>
              <CardDescription>
                Enter your details to start GPS tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver ID</Label>
                <Input
                  id="driverId"
                  placeholder="Enter your driver ID"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="busId">Bus ID</Label>
                <Input
                  id="busId"
                  placeholder="Enter bus/vehicle ID"
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                />
              </div>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button 
                onClick={handleStartTracking} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                size="lg"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Enable Location Tracking
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Tracking Dashboard */
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      Tracking Active
                    </CardTitle>
                    <CardDescription>Broadcasting location every 5 seconds</CardDescription>
                  </div>
                  <Badge variant={isTracking ? "default" : "secondary"} className="gap-1">
                    {isTracking ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {isTracking ? "Online" : "Offline"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Driver Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Driver Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver ID:</span>
                    <span className="font-mono font-medium">{driverId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bus ID:</span>
                    <span className="font-mono font-medium">{busId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={isTracking ? "default" : "secondary"}>
                      {isTracking ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Location Data */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Current Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {locationData ? (
                    <>
                      <div>
                        <span className="text-muted-foreground text-sm">Coordinates:</span>
                        <p className="font-mono text-sm bg-muted/50 p-2 rounded mt-1">
                          {formatCoordinates(locationData.latitude, locationData.longitude)}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span className="text-sm">{formatTime(locationData.timestamp)}</span>
                      </div>
                      {locationData.accuracy && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="text-sm">±{Math.round(locationData.accuracy)}m</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">No location data available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleStopTracking}
                variant="destructive"
                size="lg"
                disabled={!isTracking}
              >
                Stop Tracking
              </Button>
              <Button
                onClick={() => {
                  setIsRegistered(false);
                  handleStopTracking();
                  setDriverId("");
                  setBusId("");
                }}
                variant="outline"
                size="lg"
              >
                Change Details
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Clock, Bus, Users, Navigation, Star } from "lucide-react";

interface StopInfo {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  estimatedTime: string;
  amenities: string[];
}

interface RouteData {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  totalStops: number;
  activeBuses: number;
  avgTime: string;
  status: "active" | "inactive" | "maintenance";
  stops: StopInfo[];
}

// No fallback: routes are fetched from the admin API

export function RoutesTab() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Determine Admin API base URL with sensible fallbacks
  const adminApiBases = useMemo(() => {
    const fromEnv = (import.meta as any)?.env?.VITE_ADMIN_API_BASE_URL as string | undefined;
    // Try env first; otherwise try common dev ports used in this repo
    const candidates = [fromEnv, "http://localhost:3011", "http://localhost:3001"]
      .filter(Boolean) as string[];
    return Array.from(new Set(candidates));
  }, []);

  // Fetch routes list from admin API
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      let lastErr: any = null;
      for (const base of adminApiBases) {
        try {
          const res = await fetch(`${base}/routes`);
          if (!res.ok) throw new Error(await res.text());
          const data: Array<{
            routeId: string;
            start: string;
            end: string;
            name?: string | null;
            stopsCount?: number;
          }> = await res.json();

          const mapped: RouteData[] = data.map((r) => ({
            id: r.routeId,
            name: r.name || r.routeId,
            startPoint: r.start,
            endPoint: r.end,
            totalStops: r.stopsCount ?? 0,
            activeBuses: 0,
            avgTime: "-",
            status: "active",
            stops: [],
          }));

          if (!cancelled) {
            setRoutes(mapped);
            setError(null);
          }
          lastErr = null;
          break;
        } catch (e: any) {
          lastErr = e;
        }
      }
      if (!cancelled) {
        if (lastErr) setError("Failed to load routes from admin API.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adminApiBases]);

  // When user selects a route, fetch detailed stops from admin API if available
  const handleSelectRoute = async (route: RouteData) => {
    // If we already have stops (from prior fetch), just open
    if (route.stops && route.stops.length > 0) return setSelectedRoute(route);
    try {
      // Try all bases for details as well
      let detailRes: Response | null = null;
      let lastErr: any = null;
      for (const base of adminApiBases) {
        try {
          const res = await fetch(`${base}/routes/${encodeURIComponent(route.id)}`);
          if (!res.ok) throw new Error(await res.text());
          detailRes = res;
          lastErr = null;
          break;
        } catch (e: any) {
          lastErr = e;
        }
      }
      if (!detailRes) throw lastErr || new Error("Route detail not available");
      const detail: {
        routeId: string;
        start: string;
        end: string;
        name?: string | null;
        stops: Array<{ stopNumber: number; name: string; lat: number; long: number }>;
      } = await detailRes.json();

      const stops: StopInfo[] = detail.stops.map((s) => ({
        id: `ST-${detail.routeId}-${s.stopNumber}`,
        name: s.name,
        coordinates: { lat: s.lat, lng: s.long },
        estimatedTime: `${s.stopNumber * 5} min`,
        amenities: ["Bus Stop"],
      }));

      const enriched: RouteData = {
        id: detail.routeId,
        name: detail.name || route.name,
        startPoint: detail.start,
        endPoint: detail.end,
        totalStops: stops.length,
        activeBuses: 0,
        avgTime: "-",
        status: "active",
        stops,
      };
      setSelectedRoute(enriched);
    } catch {
      setError("Failed to load route details.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "inactive":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case "maintenance":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  if (selectedRoute) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedRoute(null)}
          >
            ← Back to Routes
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{selectedRoute.name}</h2>
            <p className="text-muted-foreground">
              {selectedRoute.startPoint} → {selectedRoute.endPoint}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="w-5 h-5" />
                Route Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Stops:</span>
                <span className="font-semibold">
                  {selectedRoute.totalStops}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Buses:</span>
                <span className="font-semibold">
                  {selectedRoute.activeBuses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Time:</span>
                <span className="font-semibold">{selectedRoute.avgTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(selectedRoute.status)}>
                  {getStatusIcon(selectedRoute.status)}
                  <span className="ml-1 capitalize">
                    {selectedRoute.status}
                  </span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {selectedRoute.avgTime}
                </div>
                <p className="text-sm text-muted-foreground">
                  Average journey time
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>First Bus:</span>
                  <span>5:30 AM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Bus:</span>
                  <span>11:30 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frequency:</span>
                  <span>Every 10-15 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Live Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedRoute.activeBuses}
                </div>
                <p className="text-sm text-muted-foreground">
                  Buses currently running
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>On Time:</span>
                  <span className="text-green-600">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delayed:</span>
                  <span className="text-yellow-600">12%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cancelled:</span>
                  <span className="text-red-600">3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Route Stops
            </CardTitle>
            <CardDescription>
              Complete list of stops along this route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedRoute.stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    {index < selectedRoute.stops.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{stop.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {stop.estimatedTime}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {stop.coordinates.lat.toFixed(4)},{" "}
                        {stop.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {stop.amenities.map((amenity, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">BMTC Bus Routes</h2>
        <p className="text-muted-foreground">
          Explore Bengaluru's public transportation network
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading routes…</div>
      ) : routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
          <Card
            key={route.id}
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handleSelectRoute(route)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{route.name}</CardTitle>
                <Badge className={getStatusColor(route.status)}>
                  {getStatusIcon(route.status)}
                  <span className="ml-1 capitalize">{route.status}</span>
                </Badge>
              </div>
              <CardDescription>
                {route.startPoint} → {route.endPoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{route.totalStops} stops</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bus className="w-4 h-4 text-muted-foreground" />
                  <span>{route.activeBuses} active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{route.avgTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>High demand</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.2</span>
                  <span className="text-xs text-muted-foreground">(128)</span>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">No routes found.</div>
      )}
      {error && (
        <div className="text-center text-sm text-muted-foreground">{error}</div>
      )}
    </div>
  );
}

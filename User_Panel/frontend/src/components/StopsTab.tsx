import React, { useMemo, useState, useEffect } from "react";
import { routeService, Route } from "../services/routeService";
import {
  busRouteMapping,
  searchBuses,
  getBusDetails,
} from "../config/busMapping";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  MapPin,
  Clock,
  Navigation as NavigationIcon,
  Bus,
  Flag,
  Search,
  Plus,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface StopData {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  routes: string[];
}

interface BusETA {
  busId: string;
  route: string;
  eta: string;
  timeToDestination: string;
  isClosest?: boolean;
}

type StopStatus = "On time" | "Delayed" | "Arrived" | "Departed" | "Skipped";

interface BusStopTimelineItem {
  index: number;
  name: string;
  eta: string; // e.g., "09:35 AM"
  departure?: string; // e.g., "09:38 AM"
  distanceFromSourceKm?: number;
  platform?: string;
  status: StopStatus;
  isCurrent?: boolean;
  isNext?: boolean;
}

interface BusTrackingDetails {
  busId: string;
  route: string;
  currentStopIndex: number;
  nextStopIndex: number;
  stops: BusStopTimelineItem[];
}

// Convert API routes to stops data
const convertRoutesToStops = (routes: Route[]): StopData[] => {
  const stopMap = new Map<string, StopData>();

  routes.forEach((route) => {
    if (route.route_stops) {
      route.route_stops.forEach((stop) => {
        const stopKey = stop.stop_name;
        if (!stopMap.has(stopKey)) {
          stopMap.set(stopKey, {
            id: `ST-${stop.stop_id}`,
            name: stop.stop_name,
            coordinates: { lat: stop.latitude, lng: stop.longitude },
            routes: [],
          });
        }
        const stopData = stopMap.get(stopKey)!;
        stopData.routes.push(route.description);
      });
    }
  });

  return Array.from(stopMap.values());
};

// Generate mock ETAs based on real stops data
const generateMockETAs = (stops: StopData[]): Record<string, BusETA[]> => {
  return stops.reduce((acc, stop) => {
    const etas: BusETA[] = [];

    // Generate ETAs for each route that passes through this stop
    stop.routes.forEach((routeDesc, index) => {
      if (routeDesc !== "General Stop") {
        etas.push({
          busId: `BUS-${String(index + 1).padStart(3, "0")}`,
          route: routeDesc,
          eta: `${Math.floor(Math.random() * 15) + 3} min`,
          timeToDestination: `${Math.floor(Math.random() * 30) + 15} min`,
        });
      }
    });

    acc[stop.id] = etas;
    return acc;
  }, {} as Record<string, BusETA[]>);
};

export function StopsTab() {
  const [pickupPoint, setPickupPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<BusETA[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [stops, setStops] = useState<StopData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load stops from API
  useEffect(() => {
    const loadStops = async () => {
      try {
        setIsLoading(true);
        const apiRoutes = await routeService.getRoutes();
        const stopsData = convertRoutesToStops(apiRoutes);
        setStops(stopsData);
      } catch (error) {
        console.error("Failed to load stops:", error);
        setStops([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStops();
  }, []);

  // Generate mock ETAs for current stops
  const mockETAs = useMemo(() => generateMockETAs(stops), [stops]);

  // Suggestion dropdown state
  const locations = useMemo(() => {
    const allStops = stops.map((s) => s.name);
    const allRoutes = Array.from(new Set(stops.flatMap((s) => s.routes)));
    const allBusIds = Object.keys(busRouteMapping);
    const allBusNumbers = Object.values(busRouteMapping).map(
      (bus) => bus.busNumber
    );
    const allDriverNames = Object.values(busRouteMapping).map(
      (bus) => bus.driverName
    );

    return [
      ...allStops,
      ...allRoutes,
      ...allBusIds,
      ...allBusNumbers,
      ...allDriverNames,
    ];
  }, [stops]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [pickupActiveIndex, setPickupActiveIndex] = useState(-1);
  const [destActiveIndex, setDestActiveIndex] = useState(-1);

  const rankAndFilter = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const suggestions: Array<{
      text: string;
      category: string;
      icon: string;
      score: number;
      idx: number;
    }> = [];

    // Safety check for stops
    if (!stops || stops.length === 0) {
      return [];
    }

    // Search stops
    stops.forEach((stop) => {
      if (stop && stop.name) {
        const name = stop.name.toLowerCase();
        if (name.includes(q)) {
          suggestions.push({
            text: stop.name,
            category: "Bus Stop",
            icon: "📍",
            score: name.startsWith(q) ? 3 : 2,
            idx: name.indexOf(q),
          });
        }
      }
    });

    // Search routes
    const allRoutes = Array.from(new Set(stops.flatMap((s) => s.routes || [])));
    allRoutes.forEach((routeDesc) => {
      if (routeDesc) {
        const name = routeDesc.toLowerCase();
        if (name.includes(q)) {
          suggestions.push({
            text: routeDesc,
            category: "Route",
            icon: "🚌",
            score: name.startsWith(q) ? 3 : 2,
            idx: name.indexOf(q),
          });
        }
      }
    });

    // Search buses
    Object.values(busRouteMapping).forEach((bus) => {
      const busId = bus.busId.toLowerCase();
      const busNumber = bus.busNumber.toLowerCase();
      const driverName = bus.driverName.toLowerCase();

      if (busId.includes(q)) {
        suggestions.push({
          text: `${bus.busId} - ${bus.routeName}`,
          category: "Bus",
          icon: "🚌",
          score: busId.startsWith(q) ? 3 : 2,
          idx: busId.indexOf(q),
        });
      } else if (busNumber.includes(q)) {
        suggestions.push({
          text: `${bus.busNumber} - ${bus.routeName}`,
          category: "Bus",
          icon: "🚌",
          score: busNumber.startsWith(q) ? 3 : 2,
          idx: busNumber.indexOf(q),
        });
      } else if (driverName.includes(q)) {
        suggestions.push({
          text: `${bus.driverName} - ${bus.routeName}`,
          category: "Driver",
          icon: "👨‍💼",
          score: driverName.startsWith(q) ? 3 : 2,
          idx: driverName.indexOf(q),
        });
      }
    });

    return suggestions
      .sort(
        (a, b) =>
          b.score - a.score || a.idx - b.idx || a.text.localeCompare(b.text)
      )
      .slice(0, 8); // Limit to 8 suggestions
  };

  const pickupSuggestions = useMemo(() => {
    if (isLoading) return [];
    return rankAndFilter(pickupPoint);
  }, [pickupPoint, locations, isLoading]);
  const destSuggestions = useMemo(() => {
    if (isLoading) return [];
    return rankAndFilter(destination);
  }, [destination, locations, isLoading]);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusETA | null>(null);

  // Generate dynamic tracking data based on selected bus
  const generateBusTrackingData = (
    busId: string
  ): BusTrackingDetails | null => {
    const busDetails = getBusDetails(busId);
    if (!busDetails) return null;

    // Find stops that belong to this bus's route
    const routeStops = stops.filter((stop) =>
      stop.routes.some((routeDesc) => {
        // Try multiple matching strategies
        const routeId = busDetails.routeId?.toLowerCase() || "";
        const routeName = busDetails.routeName?.toLowerCase() || "";
        const routeDescLower = routeDesc.toLowerCase();

        // Match by route ID (500A, 600B, 700A)
        if (routeDescLower.includes(routeId)) return true;

        // Match by route name
        if (routeDescLower.includes(routeName)) return true;

        // Specific route matching for our 3 routes
        if (
          routeId === "500a" &&
          routeDescLower.includes("majestic") &&
          routeDescLower.includes("electronic city")
        )
          return true;
        if (
          routeId === "600b" &&
          routeDescLower.includes("whitefield") &&
          routeDescLower.includes("majestic")
        )
          return true;
        if (
          routeId === "700a" &&
          routeDescLower.includes("majestic") &&
          routeDescLower.includes("kempegowda airport")
        )
          return true;

        // Match by route description parts
        const routeParts = routeDescLower.split(" → ");
        if (routeParts.length >= 2) {
          const startPoint = routeParts[0].trim();
          const endPoint = routeParts[1].trim();

          // Check if route ID matches any part of the description
          if (startPoint.includes(routeId) || endPoint.includes(routeId))
            return true;
        }

        return false;
      })
    );

    if (routeStops.length === 0) {
      // Fallback: show a message that no route data is available
      console.log(
        "No route stops found for bus:",
        busId,
        "Route ID:",
        busDetails.routeId
      );
      console.log(
        "Available stops:",
        stops.map((s) => ({ name: s.name, routes: s.routes }))
      );

      return {
        busId,
        route: busDetails.routeName || "Unknown Route",
        currentStopIndex: 0,
        nextStopIndex: 1,
        stops: [
          {
            index: 1,
            name: "No route data available",
            eta: "N/A",
            departure: undefined,
            distanceFromSourceKm: 0,
            platform: "N/A",
            status: "On time" as StopStatus,
            isCurrent: true,
            isNext: false,
          },
        ],
      };
    }

    // Generate stops based on the found route
    const sortedRouteStops = routeStops.sort((a, b) => {
      // Try to sort by route order if available
      const aRoute = a.routes.find((r) =>
        r.toLowerCase().includes(busDetails.routeId?.toLowerCase() || "")
      );
      const bRoute = b.routes.find((r) =>
        r.toLowerCase().includes(busDetails.routeId?.toLowerCase() || "")
      );
      return aRoute?.localeCompare(bRoute || "") || 0;
    });

    const trackingStops = sortedRouteStops.map((stop, index) => {
      const currentTime = new Date();
      const baseTime = new Date(currentTime.getTime() + index * 5 * 60000); // 5 minutes per stop

      // Randomly assign current stop (between 1 and 3 stops from start)
      const currentStopIndex = Math.floor(Math.random() * 3) + 1;
      const isCurrent = index === currentStopIndex;
      const isNext = index === currentStopIndex + 1;

      let status: StopStatus = "On time";
      if (index < currentStopIndex) status = "Departed";
      else if (isCurrent) status = "Arrived";
      else if (Math.random() < 0.1) status = "Delayed";

      return {
        index: index + 1,
        name: stop.name,
        eta: baseTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        departure:
          index < currentStopIndex
            ? baseTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : undefined,
        distanceFromSourceKm: index * 2.5 + Math.random() * 2, // Approximate distance
        platform: `${String.fromCharCode(65 + (index % 26))}${
          (index % 10) + 1
        }`, // A1, B2, etc.
        status,
        isCurrent,
        isNext,
      };
    });

    return {
      busId,
      route: busDetails.routeName,
      currentStopIndex: trackingStops.findIndex((s) => s.isCurrent) + 1,
      nextStopIndex: trackingStops.findIndex((s) => s.isNext) + 1,
      stops: trackingStops,
    };
  };

  const addIntermediateStop = () => {
    setIntermediateStops([...intermediateStops, ""]);
  };

  const removeIntermediateStop = (index: number) => {
    setIntermediateStops(intermediateStops.filter((_, i) => i !== index));
  };

  const updateIntermediateStop = (index: number, value: string) => {
    const updated = [...intermediateStops];
    updated[index] = value;
    setIntermediateStops(updated);
  };

  const handleSearch = () => {
    if (!pickupPoint.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API call
    setTimeout(() => {
      const matchingStop = stops.find((stop) =>
        stop.name.toLowerCase().includes(pickupPoint.toLowerCase())
      );

      if (matchingStop && mockETAs[matchingStop.id]) {
        setSearchResults(mockETAs[matchingStop.id]);
      } else {
        // Try to find buses that might be related to the search query
        const searchQuery = pickupPoint.toLowerCase();
        const relatedBuses = searchBuses(pickupPoint);

        if (relatedBuses.length > 0) {
          // Show related buses found
          const busResults = relatedBuses.map((bus, index) => ({
            busId: bus.busId,
            route: bus.routeName,
            eta: `${Math.floor(Math.random() * 15) + 3} min`,
            timeToDestination: `${Math.floor(Math.random() * 30) + 15} min`,
            isClosest: index === 0,
          }));
          setSearchResults(busResults);
        } else {
          // No buses found matching the search
          setSearchResults([]);
        }
      }
      setIsSearching(false);
    }, 1000);
  };

  const openTrackModal = (bus: BusETA) => {
    setSelectedBus(bus);
    setIsTrackModalOpen(true);
  };

  const statusColorClass = (status: StopStatus) => {
    switch (status) {
      case "On time":
        return "bg-green-500 border-green-500";
      case "Delayed":
        return "bg-yellow-500 border-yellow-500";
      case "Arrived":
        return "bg-blue-500 border-blue-500";
      case "Departed":
        return "bg-gray-400 border-gray-400";
      case "Skipped":
        return "bg-red-500 border-red-500";
      default:
        return "bg-gray-300 border-gray-300";
    }
  };

  const statusPillClasses = (status: StopStatus) => {
    switch (status) {
      case "Arrived":
        return "bg-green-500 text-white";
      case "Departed":
        return "bg-gray-500 text-white";
      case "On time":
        return "bg-blue-500 text-white";
      case "Delayed":
        return "bg-red-500 text-white";
      case "Skipped":
        return "bg-red-500 text-white";
      default:
        return "bg-muted text-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <NavigationIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Stops & ETA</h2>
          <p className="text-muted-foreground">
            Plan your journey and get accurate arrival times
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading stops...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <NavigationIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Stops & ETA</h2>
        <p className="text-muted-foreground">
          Plan your journey and get accurate arrival times
        </p>
      </div>

      {/* Journey Planner */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Plan Your Journey</CardTitle>
          <CardDescription>
            Enter your pickup and destination points to find buses with ETA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Point</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
                <Input
                  id="pickup"
                  placeholder="Enter pickup location"
                  value={pickupPoint}
                  onChange={(e) => {
                    setPickupPoint(e.target.value);
                    setShowPickupSuggestions(true);
                    setPickupActiveIndex(-1);
                    // Reset search state when user starts typing
                    if (hasSearched) {
                      setHasSearched(false);
                      setSearchResults([]);
                    }
                  }}
                  className="pl-10"
                  onFocus={() => setShowPickupSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowPickupSuggestions(false), 120)
                  }
                  onKeyDown={(e) => {
                    if (!showPickupSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setPickupActiveIndex((i) =>
                        Math.min(i + 1, pickupSuggestions.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setPickupActiveIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && pickupActiveIndex >= 0) {
                      e.preventDefault();
                      const choice = pickupSuggestions[pickupActiveIndex];
                      if (choice) {
                        setPickupPoint(choice);
                        setShowPickupSuggestions(false);
                      }
                    } else if (e.key === "Escape") {
                      setShowPickupSuggestions(false);
                    }
                  }}
                />
                {showPickupSuggestions && pickupSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      {pickupSuggestions.map((suggestion, idx) => (
                        <li
                          key={`${suggestion.text}-${idx}`}
                          className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                            idx === pickupActiveIndex
                              ? "bg-muted/60"
                              : "hover:bg-muted/40"
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setPickupPoint(suggestion.text);
                            setShowPickupSuggestions(false);
                          }}
                          onMouseEnter={() => setPickupActiveIndex(idx)}
                        >
                          <span className="text-lg">{suggestion.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{suggestion.text}</div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.category}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 w-4 h-4" />
                <Input
                  id="destination"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowDestSuggestions(true);
                    setDestActiveIndex(-1);
                  }}
                  className="pl-10"
                  onFocus={() => setShowDestSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowDestSuggestions(false), 120)
                  }
                  onKeyDown={(e) => {
                    if (!showDestSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setDestActiveIndex((i) =>
                        Math.min(i + 1, destSuggestions.length - 1)
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setDestActiveIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && destActiveIndex >= 0) {
                      e.preventDefault();
                      const choice = destSuggestions[destActiveIndex];
                      if (choice) {
                        setDestination(choice);
                        setShowDestSuggestions(false);
                      }
                    } else if (e.key === "Escape") {
                      setShowDestSuggestions(false);
                    }
                  }}
                />
                {showDestSuggestions && destSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border/50 bg-popover shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      {destSuggestions.map((suggestion, idx) => (
                        <li
                          key={`${suggestion.text}-${idx}`}
                          className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 ${
                            idx === destActiveIndex
                              ? "bg-muted/60"
                              : "hover:bg-muted/40"
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDestination(suggestion.text);
                            setShowDestSuggestions(false);
                          }}
                          onMouseEnter={() => setDestActiveIndex(idx)}
                        >
                          <span className="text-lg">{suggestion.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{suggestion.text}</div>
                            <div className="text-xs text-muted-foreground">
                              {suggestion.category}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Intermediate Stops */}
          {intermediateStops.length > 0 && (
            <div className="space-y-2">
              <Label>Intermediate Stops</Label>
              {intermediateStops.map((stop, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
                    <Input
                      placeholder={`Intermediate stop ${index + 1}`}
                      value={stop}
                      onChange={(e) =>
                        updateIntermediateStop(index, e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeIntermediateStop(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={addIntermediateStop}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Stop
            </Button>
            <Button
              onClick={handleSearch}
              disabled={!pickupPoint.trim() || isSearching}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              <Search className="w-4 h-4" />
              {isSearching ? "Searching..." : "Find Buses"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results as Bus Cards */}
      {searchResults.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Available Buses</CardTitle>
            <CardDescription>
              Buses serving your pickup point with estimated arrival times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <Card
                  key={result.busId}
                  className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card/30 backdrop-blur-sm border-border/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{result.busId}</CardTitle>
                      {result.isClosest && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400"
                        >
                          Closest Available
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {result.route}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">ETA</p>
                          <p className="font-semibold">{result.eta}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <NavigationIcon className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            To Destination
                          </p>
                          <p className="font-semibold">
                            {result.timeToDestination}
                          </p>
                        </div>
                      </div>
                    </div>

                    {result.isClosest && (
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/30 rounded text-sm text-yellow-700 dark:text-yellow-400">
                        No direct bus found. This is the nearest available
                        option.
                      </div>
                    )}

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:shadow-lg transition-all duration-300"
                      onClick={() => openTrackModal(result)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Track Bus
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {!isSearching &&
        hasSearched &&
        searchResults.length === 0 &&
        pickupPoint.trim() && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center">
                  <Bus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No buses found</h3>
                  <p className="text-muted-foreground">
                    No buses are available for "{pickupPoint}". Try searching
                    for a different location or check back later.
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Available routes: 500A, 600B, 700A</p>
                  <p>Try searching by route number, stop name, or bus ID</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Track Bus Modal */}
      <Dialog open={isTrackModalOpen} onOpenChange={setIsTrackModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              {selectedBus?.busId} - Live Tracking
            </DialogTitle>
            <DialogDescription>{selectedBus?.route}</DialogDescription>
          </DialogHeader>

          {selectedBus && (
            <div
              className="relative overflow-y-auto"
              style={{ height: "calc(85vh - 120px)" }}
            >
              {/* Minimal vertical timeline */}
              <div className="space-y-2 p-1">
                {generateBusTrackingData(selectedBus.busId)?.stops.map(
                  (s, index, arr) => (
                    <Card
                      key={s.index}
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  s.isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-primary/10 text-primary"
                                } flex items-center justify-center text-sm font-semibold`}
                              >
                                {s.isCurrent ? (
                                  <Bus className="w-4 h-4" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              {index < arr.length - 1 && (
                                <div className="w-0.5 h-8 bg-border mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[14px] truncate">
                                {s.name}
                              </h4>
                              <div className="mt-1 text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> ETA {s.eta}
                                </span>
                                {s.departure && <span>Dep {s.departure}</span>}
                                {typeof s.distanceFromSourceKm === "number" && (
                                  <span>
                                    {s.distanceFromSourceKm.toFixed(0)} km
                                  </span>
                                )}
                                {s.platform && <span>PF {s.platform}</span>}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusPillClasses(
                              s.status
                            )}`}
                          >
                            {s.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

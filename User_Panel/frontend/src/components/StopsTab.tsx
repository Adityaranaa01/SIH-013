import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MapPin, Clock, Navigation as NavigationIcon, Bus, Flag, Search, Plus, X } from "lucide-react";
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

const mockStops: StopData[] = [
  {
    id: "ST-001",
    name: "Connaught Place",
    coordinates: { lat: 28.6315, lng: 77.2167 },
    routes: ["CP → IGI Airport", "Delhi University → Select City Mall"],
  },
  {
    id: "ST-002",
    name: "Gurgaon Cyber City",
    coordinates: { lat: 28.5022, lng: 77.091 },
    routes: [
      "Delhi University → Select City Mall",
      "New Delhi Railway Station → Cyber City",
    ],
  },
  {
    id: "ST-003",
    name: "India Gate",
    coordinates: { lat: 28.6129, lng: 77.2295 },
    routes: ["AIIMS → India Gate"],
  },
  {
    id: "ST-004",
    name: "IGI Airport Terminal 3",
    coordinates: { lat: 28.5562, lng: 77.1 },
    routes: ["CP → IGI Airport"],
  },
  {
    id: "ST-005",
    name: "Select City Mall",
    coordinates: { lat: 28.545, lng: 77.193 },
    routes: ["Delhi University → Select City Mall"],
  },
  {
    id: "ST-006",
    name: "Delhi University",
    coordinates: { lat: 28.6881, lng: 77.212 },
    routes: [
      "Delhi University → Select City Mall",
      "New Delhi Railway Station → Cyber City",
    ],
  },
];

const mockETAs: Record<string, BusETA[]> = {
  "ST-001": [
    {
      busId: "BUS-001",
      route: "CP → IGI Airport",
      eta: "3 min",
      timeToDestination: "28 min",
    },
    {
      busId: "BUS-002",
      route: "Delhi University → Select City Mall",
      eta: "8 min",
      timeToDestination: "15 min",
    },
  ],
  "ST-002": [
    {
      busId: "BUS-002",
      route: "Delhi University → Select City Mall",
      eta: "5 min",
      timeToDestination: "18 min",
    },
  ],
  "ST-003": [
    {
      busId: "BUS-003",
      route: "AIIMS → India Gate",
      eta: "12 min",
      timeToDestination: "32 min",
    },
  ],
  "ST-004": [
    {
      busId: "BUS-001",
      route: "CP → IGI Airport",
      eta: "18 min",
      timeToDestination: "25 min",
    },
  ],
};

export function StopsTab() {
  const [pickupPoint, setPickupPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<BusETA[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Suggestion dropdown state
  const locations = useMemo(
    () => [
      "India Gate",
      "Connaught Place",
      "AIIMS",
      "Delhi University",
      "Green Park",
      "Hauz Khas",
      "Malviya Nagar",
      "Rajiv Chowk",
      "Aerocity",
      "IGI Airport Terminal 3",
    ],
    []
  );
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [pickupActiveIndex, setPickupActiveIndex] = useState(-1);
  const [destActiveIndex, setDestActiveIndex] = useState(-1);

  const rankAndFilter = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    const scored = locations
      .map((loc) => {
        const l = loc.toLowerCase();
        let score = -1;
        if (l.startsWith(q)) score = 2;
        else if (l.includes(q)) score = 1;
        return { loc, score, idx: l.indexOf(q) };
      })
      .filter((s) => s.score >= 0)
      .sort((a, b) => (b.score - a.score) || (a.idx - b.idx) || a.loc.localeCompare(b.loc));
    return scored.map((s) => s.loc);
  };

  const pickupSuggestions = useMemo(() => rankAndFilter(pickupPoint), [pickupPoint, locations]);
  const destSuggestions = useMemo(() => rankAndFilter(destination), [destination, locations]);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusETA | null>(null);

  // Dummy tracking data per busId
  const mockBusTracking: Record<string, BusTrackingDetails> = {
    "BUS-001": {
      busId: "BUS-001",
      route: "CP → IGI Airport",
      currentStopIndex: 3,
      nextStopIndex: 4,
      stops: [
        { index: 1, name: "Connaught Place", eta: "09:00 AM", departure: "09:02 AM", distanceFromSourceKm: 0, platform: "A1", status: "Departed" },
        { index: 2, name: "Jantar Mantar", eta: "09:06 AM", departure: "09:07 AM", distanceFromSourceKm: 2.1, platform: "B3", status: "Departed" },
        { index: 3, name: "India Gate", eta: "09:14 AM", departure: "09:16 AM", distanceFromSourceKm: 5.8, platform: "C2", status: "Arrived", isCurrent: true },
        { index: 4, name: "South Extension", eta: "09:22 AM", departure: "09:24 AM", distanceFromSourceKm: 9.6, platform: "D1", status: "On time", isNext: true },
        { index: 5, name: "Lajpat Nagar", eta: "09:28 AM", departure: "09:30 AM", distanceFromSourceKm: 12.2, platform: "E4", status: "On time" },
        { index: 6, name: "Kalkaji", eta: "09:34 AM", departure: "09:36 AM", distanceFromSourceKm: 15.1, platform: "F2", status: "On time" },
        { index: 7, name: "Mahipalpur", eta: "09:46 AM", departure: "09:48 AM", distanceFromSourceKm: 22.8, platform: "G5", status: "Delayed" },
        { index: 8, name: "Aerocity", eta: "09:52 AM", departure: "09:54 AM", distanceFromSourceKm: 25.0, platform: "H1", status: "On time" },
        { index: 9, name: "Airport Metro Station", eta: "09:58 AM", departure: "10:00 AM", distanceFromSourceKm: 27.2, platform: "I3", status: "On time" },
        { index: 10, name: "IGI Airport T3", eta: "10:05 AM", distanceFromSourceKm: 28.0, platform: "T3-Stand", status: "On time" },
      ],
    },
    "BUS-002": {
      busId: "BUS-002",
      route: "Delhi University → Select City Mall",
      currentStopIndex: 2,
      nextStopIndex: 3,
      stops: [
        { index: 1, name: "Delhi University", eta: "10:00 AM", departure: "10:02 AM", distanceFromSourceKm: 0, platform: "DU-1", status: "Departed" },
        { index: 2, name: "Vishwavidyalaya", eta: "10:05 AM", departure: "10:06 AM", distanceFromSourceKm: 1.5, platform: "V-2", status: "Arrived", isCurrent: true },
        { index: 3, name: "Civil Lines", eta: "10:12 AM", departure: "10:14 AM", distanceFromSourceKm: 4.2, platform: "CL-3", status: "On time", isNext: true },
        { index: 4, name: "Kashmere Gate", eta: "10:20 AM", departure: "10:22 AM", distanceFromSourceKm: 7.9, platform: "KG-5", status: "On time" },
        { index: 5, name: "Rajiv Chowk", eta: "10:28 AM", departure: "10:30 AM", distanceFromSourceKm: 12.3, platform: "RC-1", status: "On time" },
        { index: 6, name: "AIIMS", eta: "10:42 AM", departure: "10:44 AM", distanceFromSourceKm: 18.7, platform: "AI-2", status: "On time" },
        { index: 7, name: "Saket", eta: "10:55 AM", departure: "10:56 AM", distanceFromSourceKm: 24.1, platform: "SK-4", status: "Delayed" },
        { index: 8, name: "Select City Mall", eta: "11:02 AM", distanceFromSourceKm: 26.3, platform: "SCM-Stand", status: "On time" },
      ],
    },
    "BUS-003": {
      busId: "BUS-003",
      route: "AIIMS → India Gate",
      currentStopIndex: 4,
      nextStopIndex: 5,
      stops: [
        { index: 1, name: "AIIMS", eta: "08:30 AM", departure: "08:32 AM", distanceFromSourceKm: 0, platform: "AI-1", status: "Departed" },
        { index: 2, name: "Green Park", eta: "08:36 AM", departure: "08:37 AM", distanceFromSourceKm: 2.3, platform: "GP-1", status: "Departed" },
        { index: 3, name: "Hauz Khas", eta: "08:42 AM", departure: "08:44 AM", distanceFromSourceKm: 4.8, platform: "HK-2", status: "Departed" },
        { index: 4, name: "Malviya Nagar", eta: "08:50 AM", departure: "08:52 AM", distanceFromSourceKm: 8.1, platform: "MN-3", status: "Arrived", isCurrent: true },
        { index: 5, name: "Saket", eta: "08:58 AM", departure: "09:00 AM", distanceFromSourceKm: 10.3, platform: "SK-1", status: "On time", isNext: true },
        { index: 6, name: "Qutub Minar", eta: "09:06 AM", departure: "09:07 AM", distanceFromSourceKm: 13.5, platform: "QM-1", status: "On time" },
        { index: 7, name: "Dhaula Kuan", eta: "09:18 AM", departure: "09:20 AM", distanceFromSourceKm: 19.2, platform: "DK-2", status: "On time" },
        { index: 8, name: "Chanakyapuri", eta: "09:26 AM", distanceFromSourceKm: 22.4, platform: "CH-1", status: "On time" },
        { index: 9, name: "India Gate", eta: "09:34 AM", distanceFromSourceKm: 26.1, platform: "IG-Stand", status: "On time" },
      ],
    },
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

    // Simulate API call
    setTimeout(() => {
      const matchingStop = mockStops.find((stop) =>
        stop.name.toLowerCase().includes(pickupPoint.toLowerCase())
      );

      if (matchingStop && mockETAs[matchingStop.id]) {
        setSearchResults(mockETAs[matchingStop.id]);
      } else {
        // Show closest available bus
        setSearchResults([
          {
            busId: "BUS-003",
            route: "AIIMS → India Gate",
            eta: "14 min",
            timeToDestination: "35 min",
            isClosest: true,
          },
        ]);
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
                  }}
                  className="pl-10"
                  onFocus={() => setShowPickupSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 120)}
                  onKeyDown={(e) => {
                    if (!showPickupSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setPickupActiveIndex((i) => Math.min(i + 1, pickupSuggestions.length - 1));
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
                      {pickupSuggestions.map((s, idx) => (
                        <li
                          key={s}
                          className={`px-3 py-2 text-sm cursor-pointer ${idx === pickupActiveIndex ? "bg-muted/60" : "hover:bg-muted/40"}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setPickupPoint(s);
                            setShowPickupSuggestions(false);
                          }}
                          onMouseEnter={() => setPickupActiveIndex(idx)}
                        >
                          {s}
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
                  onBlur={() => setTimeout(() => setShowDestSuggestions(false), 120)}
                  onKeyDown={(e) => {
                    if (!showDestSuggestions) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setDestActiveIndex((i) => Math.min(i + 1, destSuggestions.length - 1));
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
                      {destSuggestions.map((s, idx) => (
                        <li
                          key={s}
                          className={`px-3 py-2 text-sm cursor-pointer ${idx === destActiveIndex ? "bg-muted/60" : "hover:bg-muted/40"}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setDestination(s);
                            setShowDestSuggestions(false);
                          }}
                          onMouseEnter={() => setDestActiveIndex(idx)}
                        >
                          {s}
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

      {/* Track Bus Modal */}
      <Dialog open={isTrackModalOpen} onOpenChange={setIsTrackModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              {selectedBus?.busId} - Live Tracking
            </DialogTitle>
            <DialogDescription>
              {selectedBus?.route}
            </DialogDescription>
          </DialogHeader>

          {selectedBus && (
            <div className="relative overflow-y-auto" style={{ height: "calc(85vh - 120px)" }}>
              {/* Minimal vertical timeline */}
              <div className="space-y-2 p-1">
                {mockBusTracking[selectedBus.busId]?.stops.map((s, index, arr) => (
                  <Card key={s.index} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full ${s.isCurrent ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'} flex items-center justify-center text-sm font-semibold`}>
                              {s.isCurrent ? <Bus className="w-4 h-4" /> : index + 1}
                            </div>
                            {index < arr.length - 1 && (
                              <div className="w-0.5 h-8 bg-border mt-2"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[14px] truncate">{s.name}</h4>
                            <div className="mt-1 text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> ETA {s.eta}</span>
                              {s.departure && <span>Dep {s.departure}</span>}
                              {typeof s.distanceFromSourceKm === 'number' && <span>{s.distanceFromSourceKm.toFixed(0)} km</span>}
                              {s.platform && <span>PF {s.platform}</span>}
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${statusPillClasses(s.status)}`}>{s.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Popular Stops */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Popular Stops</CardTitle>
          <CardDescription>
            Frequently used bus stops with current ETAs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStops.slice(0, 6).map((stop) => (
              <div
                key={stop.id}
                className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">{stop.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{stop.id}</p>
                <div className="flex flex-wrap gap-1">
                  {stop.routes.map((route) => (
                    <Badge key={route} variant="secondary" className="text-xs">
                      {route.split(" → ")[0]}
                    </Badge>
                  ))}
                </div>
                {mockETAs[stop.id] && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Next bus:</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {mockETAs[stop.id][0].busId}
                      </span>
                      <span className="text-sm text-primary">
                        {mockETAs[stop.id][0].eta}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

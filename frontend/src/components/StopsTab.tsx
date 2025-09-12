import { useState } from "react";
import { Button } from "./ui/button";
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
import { MapPin, Search, Clock, Navigation, Plus, X } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Navigation className="w-16 h-16 mx-auto mb-4 text-primary" />
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
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className="pl-10"
                />
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
                  onChange={(e) => setDestination(e.target.value)}
                  className="pl-10"
                />
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
                        <Navigation className="w-4 h-4 text-primary" />
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

                    <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:shadow-lg transition-all duration-300">
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

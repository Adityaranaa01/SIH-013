import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Route, MapPin, Clock, Bus, ChevronRight, X } from "lucide-react";

interface StopInfo {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  estimatedTime: string;
  amenities?: string[];
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

const mockRoutes: RouteData[] = [
  {
    id: "RT-A",
    name: "Route A",
    startPoint: "Connaught Place",
    endPoint: "IGI Airport Terminal 3",
    totalStops: 12,
    activeBuses: 2,
    avgTime: "45 min",
    status: "active",
    stops: [
      {
        id: "ST-A1",
        name: "Connaught Place",
        coordinates: { lat: 28.6315, lng: 77.2167 },
        estimatedTime: "0 min",
        amenities: ["Metro Station", "Shopping", "Food Court"],
      },
      {
        id: "ST-A2",
        name: "Jantar Mantar",
        coordinates: { lat: 28.6269, lng: 77.2165 },
        estimatedTime: "3 min",
        amenities: ["Historical Site"],
      },
      {
        id: "ST-A3",
        name: "India Gate",
        coordinates: { lat: 28.6129, lng: 77.2295 },
        estimatedTime: "8 min",
        amenities: ["Monument", "Park"],
      },
      {
        id: "ST-A4",
        name: "South Extension",
        coordinates: { lat: 28.5682, lng: 77.2156 },
        estimatedTime: "12 min",
        amenities: ["Shopping", "Market"],
      },
      {
        id: "ST-A5",
        name: "Lajpat Nagar",
        coordinates: { lat: 28.5672, lng: 77.2431 },
        estimatedTime: "16 min",
        amenities: ["Market", "Metro Station"],
      },
      {
        id: "ST-A6",
        name: "Kalkaji",
        coordinates: { lat: 28.5495, lng: 77.262 },
        estimatedTime: "20 min",
        amenities: ["Temple", "Metro Station"],
      },
      {
        id: "ST-A7",
        name: "Govindpuri",
        coordinates: { lat: 28.5444, lng: 77.2667 },
        estimatedTime: "24 min",
        amenities: ["Metro Station"],
      },
      {
        id: "ST-A8",
        name: "Okhla",
        coordinates: { lat: 28.5348, lng: 77.2669 },
        estimatedTime: "28 min",
        amenities: ["Industrial Area"],
      },
      {
        id: "ST-A9",
        name: "Mahipalpur",
        coordinates: { lat: 28.5475, lng: 77.1167 },
        estimatedTime: "32 min",
        amenities: ["Hotels", "Restaurants"],
      },
      {
        id: "ST-A10",
        name: "Aerocity",
        coordinates: { lat: 28.5562, lng: 77.1 },
        estimatedTime: "36 min",
        amenities: ["Hotels", "Shopping"],
      },
      {
        id: "ST-A11",
        name: "Airport Metro Station",
        coordinates: { lat: 28.5562, lng: 77.1 },
        estimatedTime: "40 min",
        amenities: ["Metro Station"],
      },
      {
        id: "ST-A12",
        name: "IGI Airport Terminal 3",
        coordinates: { lat: 28.5562, lng: 77.1 },
        estimatedTime: "45 min",
        amenities: ["Airport", "Food Court", "Shopping"],
      },
    ],
  },
  {
    id: "RT-B",
    name: "Route B",
    startPoint: "Delhi University",
    endPoint: "Select City Mall",
    totalStops: 8,
    activeBuses: 1,
    avgTime: "30 min",
    status: "active",
    stops: [
      {
        id: "ST-B1",
        name: "Delhi University",
        coordinates: { lat: 28.6881, lng: 77.212 },
        estimatedTime: "0 min",
        amenities: ["University", "Metro Station"],
      },
      {
        id: "ST-B2",
        name: "Vishwavidyalaya",
        coordinates: { lat: 28.6881, lng: 77.212 },
        estimatedTime: "2 min",
        amenities: ["Metro Station"],
      },
      {
        id: "ST-B3",
        name: "Civil Lines",
        coordinates: { lat: 28.6667, lng: 77.2167 },
        estimatedTime: "6 min",
        amenities: ["Government Offices"],
      },
      {
        id: "ST-B4",
        name: "Kashmere Gate",
        coordinates: { lat: 28.6667, lng: 77.2333 },
        estimatedTime: "10 min",
        amenities: ["Metro Station", "Bus Terminal"],
      },
      {
        id: "ST-B5",
        name: "Chandni Chowk",
        coordinates: { lat: 28.6511, lng: 77.2314 },
        estimatedTime: "14 min",
        amenities: ["Market", "Historical Site"],
      },
      {
        id: "ST-B6",
        name: "Rajiv Chowk",
        coordinates: { lat: 28.6315, lng: 77.2167 },
        estimatedTime: "18 min",
        amenities: ["Metro Station", "Shopping"],
      },
      {
        id: "ST-B7",
        name: "AIIMS",
        coordinates: { lat: 28.5672, lng: 77.2091 },
        estimatedTime: "24 min",
        amenities: ["Hospital", "Metro Station"],
      },
      {
        id: "ST-B8",
        name: "Select City Mall",
        coordinates: { lat: 28.545, lng: 77.193 },
        estimatedTime: "30 min",
        amenities: ["Shopping Mall", "Food Court", "Cinema"],
      },
    ],
  },
  {
    id: "RT-C",
    name: "Route C",
    startPoint: "AIIMS",
    endPoint: "India Gate",
    totalStops: 10,
    activeBuses: 1,
    avgTime: "35 min",
    status: "active",
    stops: [
      {
        id: "ST-C1",
        name: "AIIMS",
        coordinates: { lat: 28.5672, lng: 77.2091 },
        estimatedTime: "0 min",
        amenities: ["Hospital", "Metro Station"],
      },
      {
        id: "ST-C2",
        name: "Green Park",
        coordinates: { lat: 28.55, lng: 77.2167 },
        estimatedTime: "4 min",
        amenities: ["Metro Station", "Market"],
      },
      {
        id: "ST-C3",
        name: "Hauz Khas",
        coordinates: { lat: 28.55, lng: 77.2 },
        estimatedTime: "8 min",
        amenities: ["Metro Station", "Market", "Restaurants"],
      },
      {
        id: "ST-C4",
        name: "Malviya Nagar",
        coordinates: { lat: 28.5333, lng: 77.2167 },
        estimatedTime: "12 min",
        amenities: ["Metro Station", "Market"],
      },
      {
        id: "ST-C5",
        name: "Saket",
        coordinates: { lat: 28.5167, lng: 77.2 },
        estimatedTime: "16 min",
        amenities: ["Metro Station", "Malls"],
      },
      {
        id: "ST-C6",
        name: "Qutub Minar",
        coordinates: { lat: 28.5244, lng: 77.1855 },
        estimatedTime: "20 min",
        amenities: ["Historical Monument"],
      },
      {
        id: "ST-C7",
        name: "Mehrauli",
        coordinates: { lat: 28.5167, lng: 77.1833 },
        estimatedTime: "24 min",
        amenities: ["Historical Area"],
      },
      {
        id: "ST-C8",
        name: "Dhaula Kuan",
        coordinates: { lat: 28.5833, lng: 77.1667 },
        estimatedTime: "28 min",
        amenities: ["Metro Station"],
      },
      {
        id: "ST-C9",
        name: "Chanakyapuri",
        coordinates: { lat: 28.5833, lng: 77.1833 },
        estimatedTime: "32 min",
        amenities: ["Diplomatic Area"],
      },
      {
        id: "ST-C10",
        name: "India Gate",
        coordinates: { lat: 28.6129, lng: 77.2295 },
        estimatedTime: "35 min",
        amenities: ["Monument", "Park"],
      },
    ],
  },
  {
    id: "RT-D",
    name: "Route D",
    startPoint: "New Delhi Railway Station",
    endPoint: "Gurgaon Cyber City",
    totalStops: 15,
    activeBuses: 0,
    avgTime: "55 min",
    status: "maintenance",
    stops: [
      {
        id: "ST-D1",
        name: "New Delhi Railway Station",
        coordinates: { lat: 28.6439, lng: 77.2186 },
        estimatedTime: "0 min",
        amenities: ["Railway Station", "Metro Station"],
      },
      {
        id: "ST-D2",
        name: "Connaught Place",
        coordinates: { lat: 28.6315, lng: 77.2167 },
        estimatedTime: "3 min",
        amenities: ["Metro Station", "Shopping"],
      },
      {
        id: "ST-D3",
        name: "Rajiv Chowk",
        coordinates: { lat: 28.6315, lng: 77.2167 },
        estimatedTime: "5 min",
        amenities: ["Metro Station", "Shopping"],
      },
      {
        id: "ST-D4",
        name: "Barakhamba Road",
        coordinates: { lat: 28.6167, lng: 77.2167 },
        estimatedTime: "8 min",
        amenities: ["Business District"],
      },
      {
        id: "ST-D5",
        name: "Mandi House",
        coordinates: { lat: 28.6167, lng: 77.2333 },
        estimatedTime: "12 min",
        amenities: ["Cultural Center", "Metro Station"],
      },
      {
        id: "ST-D6",
        name: "ITO",
        coordinates: { lat: 28.6167, lng: 77.2333 },
        estimatedTime: "16 min",
        amenities: ["Government Offices"],
      },
      {
        id: "ST-D7",
        name: "Jama Masjid",
        coordinates: { lat: 28.6508, lng: 77.2333 },
        estimatedTime: "20 min",
        amenities: ["Historical Mosque"],
      },
      {
        id: "ST-D8",
        name: "Red Fort",
        coordinates: { lat: 28.6562, lng: 77.241 },
        estimatedTime: "24 min",
        amenities: ["Historical Fort"],
      },
      {
        id: "ST-D9",
        name: "ISBT Kashmere Gate",
        coordinates: { lat: 28.6667, lng: 77.2333 },
        estimatedTime: "28 min",
        amenities: ["Bus Terminal"],
      },
      {
        id: "ST-D10",
        name: "Civil Lines",
        coordinates: { lat: 28.6667, lng: 77.2167 },
        estimatedTime: "32 min",
        amenities: ["Government Offices"],
      },
      {
        id: "ST-D11",
        name: "Model Town",
        coordinates: { lat: 28.7167, lng: 77.2 },
        estimatedTime: "36 min",
        amenities: ["Residential Area"],
      },
      {
        id: "ST-D12",
        name: "GTB Nagar",
        coordinates: { lat: 28.7, lng: 77.2 },
        estimatedTime: "40 min",
        amenities: ["Metro Station"],
      },
      {
        id: "ST-D13",
        name: "Haryana Border",
        coordinates: { lat: 28.5, lng: 77.1 },
        estimatedTime: "48 min",
        amenities: ["State Border"],
      },
      {
        id: "ST-D14",
        name: "Gurgaon Bus Stand",
        coordinates: { lat: 28.5022, lng: 77.091 },
        estimatedTime: "52 min",
        amenities: ["Bus Terminal"],
      },
      {
        id: "ST-D15",
        name: "Gurgaon Cyber City",
        coordinates: { lat: 28.5022, lng: 77.091 },
        estimatedTime: "55 min",
        amenities: ["IT Hub", "Offices", "Malls"],
      },
    ],
  },
];

export function RoutesTab() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRouteClick = (route: RouteData) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-yellow-500";
      case "maintenance":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Route className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Available Routes</h2>
        <p className="text-muted-foreground">
          Browse all bus routes with start/end points and real-time status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRoutes.map((route) => (
          <Card
            key={route.id}
            className="hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <Badge variant="outline" className="gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      route.status
                    )}`}
                  ></div>
                  {getStatusText(route.status)}
                </Badge>
              </div>
              <CardDescription className="text-sm">{route.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route Path */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {route.startPoint}
                  </span>
                </div>
                <div className="flex-1 mx-4 border-t-2 border-dashed border-muted-foreground/30"></div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">{route.endPoint}</span>
                </div>
              </div>

              {/* Route Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <MapPin className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Stops</p>
                  <p className="font-semibold">{route.totalStops}</p>
                </div>
                <div className="text-center">
                  <Bus className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Active Buses</p>
                  <p className="font-semibold">{route.activeBuses}</p>
                </div>
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                  <p className="font-semibold">{route.avgTime}</p>
                </div>
              </div>

              {/* Route Note */}
              {route.status === "maintenance" && (
                <div className="p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded text-sm text-red-700 dark:text-red-400">
                  Route temporarily unavailable for maintenance
                </div>
              )}

              {/* View Stops Button */}
              <Button
                onClick={() => handleRouteClick(route)}
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
                disabled={route.status === "maintenance"}
              >
                <MapPin className="w-4 h-4 mr-2" />
                View All Stops ({route.totalStops})
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Future Scope Note */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="w-5 h-5" />
            Future Enhancements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Currently showing basic route information. Future updates will
            include:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Interactive route maps with polylines</li>
            <li>• Real-time bus positions on route paths</li>
            <li>• Individual stop details with amenities</li>
            <li>• Route optimization suggestions</li>
            <li>• Historical performance analytics</li>
          </ul>
        </CardContent>
      </Card>

      {/* Route Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              {selectedRoute?.name} - Route Details
            </DialogTitle>
            <DialogDescription>
              Complete list of stops along {selectedRoute?.startPoint} →{" "}
              {selectedRoute?.endPoint}
            </DialogDescription>
          </DialogHeader>

          {selectedRoute && (
            <div className="space-y-6">
              {/* Route Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Total Stops</p>
                  <p className="font-semibold text-lg">
                    {selectedRoute.totalStops}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Bus className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Active Buses</p>
                  <p className="font-semibold text-lg">
                    {selectedRoute.activeBuses}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Total Time</p>
                  <p className="font-semibold text-lg">
                    {selectedRoute.avgTime}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(
                        selectedRoute.status
                      )}`}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-lg">
                    {getStatusText(selectedRoute.status)}
                  </p>
                </div>
              </div>

              {/* Route Path */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-950/20 dark:to-red-950/20 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-sm">Start Point</p>
                    <p className="text-lg font-semibold">
                      {selectedRoute.startPoint}
                    </p>
                  </div>
                </div>
                <div className="flex-1 mx-6 border-t-2 border-dashed border-muted-foreground/50"></div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm">End Point</p>
                    <p className="text-lg font-semibold">
                      {selectedRoute.endPoint}
                    </p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                </div>
              </div>

              {/* Stops List */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  All Stops ({selectedRoute.stops.length})
                </h3>
                {/* FIXED: stops list scrollable */}
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                  {selectedRoute.stops.map((stop, index) => (
                    <Card
                      key={stop.id}
                      className="bg-card/50 backdrop-blur-sm border-border/50"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {index + 1}
                              </div>
                              {index < selectedRoute.stops.length - 1 && (
                                <div className="w-0.5 h-8 bg-border mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-base">
                                {stop.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {stop.id}
                              </p>
                              {stop.amenities && stop.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {stop.amenities.map(
                                    (amenity, amenityIndex) => (
                                      <Badge
                                        key={amenityIndex}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {amenity}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-primary">
                              {stop.estimatedTime}
                            </p>
                            <p className="text-xs text-muted-foreground">ETA</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Route Information */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Route className="w-5 h-5" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Route ID:</p>
                      <p className="font-medium">{selectedRoute.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Frequency:</p>
                      <p className="font-medium">Every 15-20 minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        Operating Hours:
                      </p>
                      <p className="font-medium">5:00 AM - 11:00 PM</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Fare:</p>
                      <p className="font-medium">₹10 - ₹25 (Distance based)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Route, MapPin, Clock, Bus } from "lucide-react";

interface RouteData {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  totalStops: number;
  activeBuses: number;
  avgTime: string;
  status: "active" | "inactive" | "maintenance";
}

const mockRoutes: RouteData[] = [
  {
    id: "RT-A",
    name: "Route A",
    startPoint: "City Center",
    endPoint: "Airport Terminal",
    totalStops: 12,
    activeBuses: 2,
    avgTime: "45 min",
    status: "active"
  },
  {
    id: "RT-B",
    name: "Route B",
    startPoint: "University Campus",
    endPoint: "Shopping Mall",
    totalStops: 8,
    activeBuses: 1,
    avgTime: "30 min",
    status: "active"
  },
  {
    id: "RT-C",
    name: "Route C",
    startPoint: "General Hospital",
    endPoint: "Marine Drive",
    totalStops: 10,
    activeBuses: 1,
    avgTime: "35 min",
    status: "active"
  },
  {
    id: "RT-D",
    name: "Route D",
    startPoint: "Railway Station",
    endPoint: "Tech Park",
    totalStops: 15,
    activeBuses: 0,
    avgTime: "55 min",
    status: "maintenance"
  }
];

export function RoutesTab() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-yellow-500";
      case "maintenance": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "inactive": return "Inactive";
      case "maintenance": return "Maintenance";
      default: return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Route className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Available Routes</h2>
        <p className="text-muted-foreground">Browse all bus routes with start/end points and real-time status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRoutes.map((route) => (
          <Card key={route.id} className="hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{route.name}</CardTitle>
                <Badge variant="outline" className="gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(route.status)}`}></div>
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
                  <span className="text-sm font-medium">{route.startPoint}</span>
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
            Currently showing basic route information. Future updates will include:
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
    </div>
  );
}
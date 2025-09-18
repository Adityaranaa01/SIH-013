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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ThemeToggle } from "./ThemeToggle";
import { MapView } from "./MapView";
import { RoutesTab } from "./RoutesTab";
import { StopsTab } from "./StopsTab";
import { AboutTab } from "./AboutTab";
import { useRealTimeBusData } from "../hooks/useRealTimeBusData";
import cityConfig from "../config/cityConfig";
import { getBusDetails } from "../config/busMapping";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Bus,
  Navigation,
  Route,
  Info,
  Settings,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

interface DashboardProps {
  onBack: () => void;
}

interface BusData {
  id: string;
  route: string;
  currentLocation: { lat: number; lng: number };
  eta: string;
  timeToDestination: string;
  nextStop: string;
}

export function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("all");
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [showMap, setShowMap] = useState(false);

  const { buses: realTimeBuses, isLoading, isConnected } = useRealTimeBusData();

  const filteredBuses = realTimeBuses.filter((bus) => {
    const matchesSearch =
      bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoute =
      selectedRoute === "all" || bus.route.includes(selectedRoute);
    return matchesSearch && matchesRoute;
  });

  const handleViewLocation = (bus: BusData) => {
    setSelectedBus(bus);
    setShowMap(true);
  };

  if (showMap && selectedBus) {
    return (
      <MapView
        bus={selectedBus}
        onBack={() => setShowMap(false)}
        allBuses={realTimeBuses}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "routes":
        return <RoutesTab />;
      case "stops":
        return <StopsTab />;
      case "about":
        return <AboutTab />;
      case "settings":
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground">
              Theme toggle available in header
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by bus ID or route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50"
                />
              </div>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="w-full md:w-48 bg-card/50 border-border/50">
                  <SelectValue placeholder="Filter by route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  {Object.entries(cityConfig.transport.routes).map(
                    ([routeId, route]) => (
                      <SelectItem key={routeId} value={routeId}>
                        {route.name} → {route.description.split(" → ")[1]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="bg-card/50 border-border/50"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading bus data...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBuses.map((bus) => {
                const busDetails = getBusDetails(bus.id);
                return (
                  <Card
                    key={bus.id}
                    className={`group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50 ${
                      bus.isActive ? "ring-2 ring-green-500/20" : "opacity-75"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{bus.id}</CardTitle>
                        <div className="flex items-center space-x-2">
                          {bus.isActive ? (
                            <div className="flex items-center space-x-1 text-green-500">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs">Live</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-gray-500">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <span className="text-xs">Offline</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-sm">
                        {bus.route}
                      </CardDescription>
                      {busDetails && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Driver: {busDetails.driverName} | Bus:{" "}
                          {busDetails.busNumber}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">ETA</p>
                            <p className="font-semibold">{bus.eta}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              To Destination
                            </p>
                            <p className="font-semibold">
                              {bus.timeToDestination}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Next Stop
                          </p>
                          <p className="font-medium text-sm">{bus.nextStop}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewLocation(bus)}
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 group-hover:shadow-lg transition-all duration-300"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Live Location
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredBuses.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Bus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No buses found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/30 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SafarSaathi</h1>
                <p className="text-sm text-muted-foreground">
                  Passenger Dashboard
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-500">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Live</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-500">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Offline</span>
                </div>
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="px-4 pb-4">
          <nav className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
            {[
              { id: "dashboard", label: "Dashboard", icon: Users },
              { id: "routes", label: "Routes", icon: Route },
              { id: "stops", label: "Stops & ETA", icon: MapPin },
              { id: "about", label: "About", icon: Info },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-card text-card-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{renderTabContent()}</main>
    </div>
  );
}

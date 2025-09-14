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

const mockBusData: BusData[] = [
  {
    id: "BUS-001",
    route: "CP → IGI Airport",
    currentLocation: { lat: 28.6315, lng: 77.2167 },
    eta: "5 min",
    timeToDestination: "25 min",
    nextStop: "Connaught Place",
  },
  {
    id: "BUS-002",
    route: "Delhi University → Select City Mall",
    currentLocation: { lat: 28.5022, lng: 77.091 },
    eta: "12 min",
    timeToDestination: "18 min",
    nextStop: "Gurgaon Cyber City",
  },
  {
    id: "BUS-003",
    route: "AIIMS → India Gate",
    currentLocation: { lat: 28.6129, lng: 77.2295 },
    eta: "8 min",
    timeToDestination: "32 min",
    nextStop: "India Gate",
  },
  {
    id: "BUS-004",
    route: "New Delhi Railway Station → Cyber City",
    currentLocation: { lat: 28.6439, lng: 77.2186 },
    eta: "15 min",
    timeToDestination: "28 min",
    nextStop: "New Delhi Railway Station",
  },
];

export function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("all");
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [showMap, setShowMap] = useState(false);

  const filteredBuses = mockBusData.filter((bus) => {
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
        allBuses={mockBusData}
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
            {/* Search and Filters */}
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
                  <SelectItem value="CP">Connaught Place</SelectItem>
                  <SelectItem value="Delhi University">
                    Delhi University
                  </SelectItem>
                  <SelectItem value="AIIMS">AIIMS</SelectItem>
                  <SelectItem value="Railway">
                    New Delhi Railway Station
                  </SelectItem>
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

            {/* Bus Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBuses.map((bus) => (
                <Card
                  key={bus.id}
                  className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 bg-card/50 backdrop-blur-sm border-border/50"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{bus.id}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {bus.route}
                    </CardDescription>
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
              ))}
            </div>

            {filteredBuses.length === 0 && (
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
      {/* Header */}
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
                <h1 className="text-xl font-bold">SmartFleet</h1>
                <p className="text-sm text-muted-foreground">
                  Passenger Dashboard
                </p>
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation Tabs */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{renderTabContent()}</main>
    </div>
  );
}

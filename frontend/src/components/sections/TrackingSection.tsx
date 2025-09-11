import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

interface TrackingSectionProps {
  onSectionChange: (section: string) => void;
}

export function TrackingSection({ onSectionChange }: TrackingSectionProps) {
  const liveVehicles = [
    { id: "MH12AB1234", type: "Bus", route: "Route 45", status: "On Time", eta: "5 min", location: "MG Road" },
    { id: "MH12CD5678", type: "Bus", route: "Route 12", status: "Delayed", eta: "12 min", location: "Station Road" },
    { id: "METRO001", type: "Metro", route: "Line 1", status: "On Time", eta: "3 min", location: "Central Station" },
    { id: "MH12EF9012", type: "Bus", route: "Route 78", status: "On Time", eta: "8 min", location: "Market Square" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center py-8">
        <h1 className="text-3xl mb-4 text-gray-900">Live Tracking</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Track specific vehicles or routes in real-time. Search by vehicle number, route, or location.
        </p>
      </section>

      {/* Search and Filter */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Vehicle</label>
              <Input 
                placeholder="Enter vehicle number..." 
                className="bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Select defaultValue="mumbai">
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="nagpur">Nagpur</SelectItem>
                  <SelectItem value="nashik">Nashik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transport Type</label>
              <Select defaultValue="all">
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="bus">Bus</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Track Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Vehicles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-gray-900">Live Vehicles</h2>
          <Button 
            variant="outline"
            onClick={() => onSectionChange("map")}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            View on Map
          </Button>
        </div>
        
        <div className="grid gap-4">
          {liveVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-gray-900">{vehicle.id}</span>
                        <Badge variant="secondary" className="text-xs">
                          {vehicle.type}
                        </Badge>
                        <Badge 
                          variant={vehicle.status === "On Time" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {vehicle.route} • Current: {vehicle.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-medium text-gray-900">{vehicle.eta}</div>
                    <div className="text-sm text-gray-500">ETA</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Can't find your vehicle? Try searching by route number or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" className="bg-white">
              Search by Route
            </Button>
            <Button 
              onClick={() => onSectionChange("contact")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
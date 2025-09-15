import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface MapSectionProps {
  onSectionChange: (section: string) => void;
}

export function MapSection({ onSectionChange }: MapSectionProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="text-center py-8">
        <h1 className="text-3xl mb-4 text-gray-900">Live Transport Map</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Interactive map showing real-time locations of all public transport vehicles in your selected city.
        </p>
      </section>

      {/* Map Controls */}
      <section className="bg-gray-50 p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Select City</label>
              <Select defaultValue="mumbai">
                <SelectTrigger className="w-48 bg-white">
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
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Transport Type</label>
              <Select defaultValue="all">
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transport</SelectItem>
                  <SelectItem value="bus">Buses</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="train">Trains</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={() => onSectionChange("tracking")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Live Tracking
          </Button>
        </div>
      </section>

      {/* Map Display */}
      <Card>
        <CardContent className="p-8">
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-96 lg:h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
              <h3 className="text-xl mb-2 text-gray-900">Interactive Map Loading...</h3>
              <p className="text-gray-500 mb-4">Real-time transport locations will appear here</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">🚌 Buses: 12 active</p>
                <p className="text-sm text-gray-600">🚇 Metro: 8 active</p>
                <p className="text-sm text-gray-600">🚂 Trains: 5 active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-medium text-blue-600 mb-1">25</div>
          <div className="text-sm text-gray-600">Active Vehicles</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-medium text-green-600 mb-1">18</div>
          <div className="text-sm text-gray-600">On Schedule</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-medium text-orange-600 mb-1">5</div>
          <div className="text-sm text-gray-600">Delayed</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-medium text-red-600 mb-1">2</div>
          <div className="text-sm text-gray-600">Offline</div>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Bus } from 'lucide-react';

interface TrackedBus {
  id: string;
  plateNumber: string;
  route: string;
  driver: string;
  status: 'on-time' | 'delayed' | 'early' | 'stopped';
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  nextStop: string;
  estimatedArrival: string;
  passengers: number;
  capacity: number;
  fuelLevel: number;
  speed: number;
  lastUpdate: string;
}

export function TrackingPage() {
  // Start with no tracked buses; expect live data from backend/socket
  const [trackedBuses, setTrackedBuses] = useState<TrackedBus[]>([]);
  const [filter, setFilter] = useState<'active' | 'all'>('active');
  const [lastRefresh, setLastRefresh] = useState(new Date());



  const filteredBuses = filter === 'all' 
    ? trackedBuses 
    : trackedBuses.filter(bus => bus.status === 'on-time' || bus.status === 'delayed' || bus.status === 'early');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'early':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'stopped':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gradient-primary tracking-tight">Tracking</h2>
          <p className="text-lg text-muted-foreground">
            Monitor active buses and their real-time locations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-gradient-primary text-white">
            Live
          </Badge>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="w-fit floating-panel">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Filter:</span>
            <Select value={filter} onValueChange={(value: 'active' | 'all') => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Full-width Map Preview */}
      <Card className="w-full card-elevated border-0">
        <CardContent className="p-0">
          <div className="bg-muted rounded-xl min-h-[500px] flex flex-col items-center justify-center relative">
            <div className="p-3 bg-gradient-primary rounded-xl mb-4">
              <MapPin className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gradient-primary mb-2">Live Bus Tracking Map</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-center">
              This would display a full-width interactive map showing real-time positions of all active buses with markers. 
              Clicking on a marker would show a popup with bus details.
            </p>
            
            <div className="absolute top-4 left-4 space-y-2">
              {filteredBuses.map((bus) => (
                <div key={bus.id} className="floating-panel rounded-xl p-3 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bus.plateNumber}</span>
                    <Badge className={getStatusColor(bus.status)} variant="secondary">
                      {bus.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Route: {bus.route}</p>
                    <p>Driver: {bus.driver}</p>
                    <p>Speed: {bus.speed} km/h</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
              <p>Last updated: {lastRefresh.toLocaleTimeString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>



      {filteredBuses.length === 0 && (
        <Card className="card-elevated border-0">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="p-3 bg-gradient-primary rounded-xl mx-auto w-fit">
                <Bus className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gradient-primary">No Active Buses</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'No buses are currently being tracked'
                  : 'No buses are currently active'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
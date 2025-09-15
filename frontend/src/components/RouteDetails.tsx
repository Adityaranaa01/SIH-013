import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, Edit } from 'lucide-react';
import { RouteFormModal } from './RouteFormModal';
import { RoutesAPI } from '../lib/api';

interface Stop {
  stopNumber: number;
  name: string;
  lat: number;
  long: number;
}

interface Route {
  routeId: string;
  start: string;
  end: string;
  name?: string | null;
  stops: Stop[];
}

interface RouteDetailsProps {
  routeId: string | null;
  onBack: () => void;
}

export function RouteDetails({ routeId, onBack }: RouteDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // No mock data – start without a route; expect parent to load and pass data later
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (!routeId) return;
    RoutesAPI.get(routeId).then(setRoute).catch(() => setRoute(null));
  }, [routeId]);

  if (!route) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Routes
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Route Not Found</h3>
              <p className="text-muted-foreground">
                {routeId ? `The requested route (${routeId}) could not be found.` : 'No route selected.'}
              </p>
              <div className="pt-4">
                <Button onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Create Route
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSaveRoute = async (updatedRoute: Route) => {
    await RoutesAPI.update(updatedRoute.routeId, { start: updatedRoute.start, end: updatedRoute.end });
    await RoutesAPI.replaceStops(updatedRoute.routeId, updatedRoute.stops.map(s => ({ stopNumber: s.stopNumber, name: s.name, lat: s.lat, long: s.long })));
    setRoute(updatedRoute);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Routes
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {route.name ? `${route.name} (${route.routeId})` : route.routeId}: {route.start} → {route.end}
            </h2>
            <p className="text-muted-foreground">
              Route details and stop information
            </p>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Route
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
            <CardDescription>Basic route details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Route ID</h4>
                <p className="font-medium">{route.routeId}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Name</h4>
                <p className="font-medium">{route.name || '-'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Total Stops</h4>
                <p className="font-medium">{route.stops.length}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">Start Point</h4>
                <p className="font-medium">{route.start}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">End Point</h4>
                <p className="font-medium">{route.end}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stops List */}
      <Card>
        <CardHeader>
          <CardTitle>Route Stops</CardTitle>
          <CardDescription>Complete list of stops in order</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stop #</TableHead>
                <TableHead>Stop Name</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead>Coordinates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {route.stops.map((stop) => (
                <TableRow key={stop.stopNumber}>
                  <TableCell className="font-medium">{stop.stopNumber}</TableCell>
                  <TableCell>{stop.name}</TableCell>
                  <TableCell className="font-mono text-sm">{stop.lat.toFixed(4)}</TableCell>
                  <TableCell className="font-mono text-sm">{stop.long.toFixed(4)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {stop.lat.toFixed(4)}, {stop.long.toFixed(4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Route Modal */}
      <RouteFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveRoute}
        initialRoute={route}
      />
    </div>
  );
}
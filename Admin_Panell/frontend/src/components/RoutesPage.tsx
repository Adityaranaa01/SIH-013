import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { RouteFormModal } from './RouteFormModal';
import { RoutesAPI } from '../lib/api';
import { store } from '../lib/store';

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
  stopsCount?: number;
}

interface RoutesPageProps {
  onViewRoute: (routeId: string) => void;
}

export function RoutesPage({ onViewRoute }: RoutesPageProps) {
  const [routes, setRoutes] = useState<Route[]>(() => store.routes ? store.routes.map(r => ({ routeId: r.routeId, start: r.start, end: r.end, name: (r as any).name ?? null, stops: [], stopsCount: (r as any).stopsCount ?? 0 })) : []);
  const [loading, setLoading] = useState(!store.routes);

  useEffect(() => {
    RoutesAPI.list().then(list => {
      store.routes = list as any
      setRoutes(list.map(r => ({ routeId: r.routeId, start: r.start, end: r.end, name: (r as any).name ?? null, stops: [], stopsCount: (r as any).stopsCount ?? 0 })));
    }).finally(() => setLoading(false));
  }, []);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const handleAddRoute = () => {
    setEditingRoute(null);
    setIsRouteModalOpen(true);
  };

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route);
    setIsRouteModalOpen(true);
  };

  const handleDeleteRoute = async (routeId: string) => {
  await RoutesAPI.remove(routeId);
    setRoutes(routes.filter(r => r.routeId !== routeId));
  if (store.routes) store.routes = store.routes.filter(r => r.routeId !== routeId) as any
  };

  const handleSaveRoute = async (route: Route) => {
    if (editingRoute) {
      await RoutesAPI.update(route.routeId, { start: route.start, end: route.end, name: route.name ?? null });
      await RoutesAPI.replaceStops(route.routeId, route.stops.map(s => ({ stopNumber: s.stopNumber, name: s.name, lat: s.lat, long: s.long })));
      const updated = routes.map(r => r.routeId === route.routeId ? { ...route, stopsCount: route.stops?.length ?? r.stopsCount ?? 0 } : r)
      setRoutes(updated);
      if (store.routes) store.routes = store.routes.map(r => r.routeId === route.routeId ? { ...r, start: route.start, end: route.end, name: route.name ?? null, stopsCount: route.stops?.length ?? (r as any).stopsCount ?? 0 } : r)
    } else {
      await RoutesAPI.create({ routeId: route.routeId, start: route.start, end: route.end, name: route.name ?? null, stops: route.stops });
      const next = [...routes, { ...route, stopsCount: route.stops?.length ?? 0 }]
      setRoutes(next);
      if (store.routes) store.routes = [...store.routes, { routeId: route.routeId, start: route.start, end: route.end, name: route.name ?? null, stopsCount: route.stops?.length ?? 0 }] as any
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gradient-primary tracking-tight">Routes</h2>
          <p className="text-lg text-muted-foreground">
            Manage bus routes and stops
          </p>
        </div>
        <Button onClick={handleAddRoute} className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </div>

      {/* Routes Table */}
      <Card className="card-elevated border-0">
        <CardHeader>
          <CardTitle className="text-gradient-primary">All Routes</CardTitle>
          <CardDescription>Complete list of bus routes in your system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading routes…</div>
          ) : routes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead># Stops</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.routeId}>
                    <TableCell className="font-medium">{route.routeId}</TableCell>
                    <TableCell>{route.name || '-'}</TableCell>
                    <TableCell>{route.start}</TableCell>
                    <TableCell>{route.end}</TableCell>
                    <TableCell>{route.stopsCount ?? route.stops.length}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewRoute(route.routeId)}
                          className="btn-secondary"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Open
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRoute(route)}
                          className="btn-secondary"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.routeId)}
                          className="btn-secondary"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No routes yet. Click "Add Route" to create your first route.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Form Modal */}
      <RouteFormModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onSave={handleSaveRoute}
        initialRoute={editingRoute}
      />
    </div>
  );
}
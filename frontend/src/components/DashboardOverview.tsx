import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Bus, Route, MapPin, Plus, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MetricsAPI } from '../lib/api';

interface Admin {
  id: string;
  name: string;
}

interface DashboardOverviewProps {
  onCreateRoute: () => void;
  onViewTracking: () => void;
  currentAdmin: Admin | null;
}

type Stat = { title: string; value: string; icon: typeof Route };

export function DashboardOverview({ onCreateRoute, onViewTracking, currentAdmin }: DashboardOverviewProps) {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<Array<{ routeId: string; start: string; end: string; stops: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MetricsAPI.get()
      .then((m) => {
        setStats([
          { title: 'Routes', value: String(m.routesCount), icon: Route },
          { title: 'Buses', value: String(m.busesCount), icon: Bus },
          { title: 'Active Buses', value: String(m.activeBusesCount), icon: MapPin },
        ]);
        setRecentRoutes(m.recentRoutes);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gradient-primary tracking-tight">
          Welcome, {currentAdmin?.name || 'Admin'}
        </h2>
        <p className="text-lg text-muted-foreground">
          Manage your SmartTransit fleet and routes
        </p>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <Card className="card-elevated border-0">
          <CardContent className="py-8 text-center text-muted-foreground">Loading stats…</CardContent>
        </Card>
      ) : stats.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title} className="card-elevated border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gradient-primary">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="card-elevated border-0">
          <CardContent className="py-8 text-center text-muted-foreground">
            No stats yet. Connect your backend to show live metrics.
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={onCreateRoute} className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="mr-2 h-4 w-4" />
          Create Route
        </Button>
        <Button variant="outline" onClick={onViewTracking} className="btn-secondary">
          <Eye className="mr-2 h-4 w-4" />
          Start Tracking
        </Button>
      </div>

      {/* Recent Routes Table */}
      <Card className="card-elevated border-0">
        <CardHeader>
          <CardTitle className="text-gradient-primary">Recent Routes</CardTitle>
          <CardDescription>Latest routes in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route ID</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead># Stops</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">Loading…</TableCell>
                </TableRow>
              ) : recentRoutes.length > 0 ? (
                recentRoutes.map((route) => (
                  <TableRow key={route.routeId}>
                    <TableCell className="font-medium">{route.routeId}</TableCell>
                    <TableCell>{route.start}</TableCell>
                    <TableCell>{route.end}</TableCell>
                    <TableCell>{route.stops}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No recent routes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
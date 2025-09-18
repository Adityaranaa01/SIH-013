import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
    BarChart3,
    MapPin,
    Users,
    Bus,
    Route,
    Activity,
    Settings,
    LogOut,
    Plus,
    Eye,
    Edit,
    Trash2,
    ArrowLeft
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [activeTrips, setActiveTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuth();
        loadDashboardData();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    };

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            const [statsRes, routesRes, driversRes, busesRes, tripsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/stats', { headers }),
                fetch('http://localhost:5000/api/admin/routes', { headers }),
                fetch('http://localhost:5000/api/admin/drivers', { headers }),
                fetch('http://localhost:5000/api/admin/buses', { headers }),
                fetch('http://localhost:5000/api/admin/trips/active', { headers })
            ]);

            const [statsData, routesData, driversData, busesData, tripsData] = await Promise.all([
                statsRes.json(),
                routesRes.json(),
                driversRes.json(),
                busesRes.json(),
                tripsRes.json()
            ]);

            if (statsData.success) setStats(statsData.data);
            if (routesData.success) setRoutes(routesData.data);
            if (driversData.success) setDrivers(driversData.data);
            if (busesData.success) setBuses(busesData.data);
            if (tripsData.success) setActiveTrips(tripsData.data);

        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'on_trip': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
            case 'running': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'assigned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'halt': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/login')}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Driver Panel
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">BMTC Admin Panel</h1>
                            <p className="text-sm text-muted-foreground">Bangalore Metropolitan Transport Corporation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                            <Activity className="w-3 h-3 mr-1" />
                            Live
                        </Badge>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="bg-card/30 backdrop-blur-sm border-b border-border/50">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'routes', label: 'Routes', icon: Route },
                            { id: 'drivers', label: 'Drivers', icon: Users },
                            { id: 'buses', label: 'Buses', icon: Bus },
                            { id: 'trips', label: 'Active Trips', icon: Activity }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${activeTab === id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Routes</p>
                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.totalRoutes || 0}</p>
                                        </div>
                                        <Route className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Trips</p>
                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.activeTrips || 0}</p>
                                        </div>
                                        <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Drivers</p>
                                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats?.totalDrivers || 0}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Buses</p>
                                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats?.totalBuses || 0}</p>
                                        </div>
                                        <Bus className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Recent Trips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {stats?.recentTrips?.slice(0, 5).map((trip, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                                                <div>
                                                    <p className="font-medium">Trip {trip.trip_id?.slice(-8)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {trip.driver_id} • {trip.bus_number}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(trip.status)}>
                                                    {trip.status}
                                                </Badge>
                                            </div>
                                        )) || (
                                                <p className="text-muted-foreground text-center py-4">No recent trips</p>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        System Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Active Drivers</span>
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                {stats?.activeDrivers || 0}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">System Health</span>
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                Operational
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Last Update</span>
                                            <span className="text-sm text-muted-foreground">
                                                {formatTime(Date.now())}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'routes' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Route Management</h2>
                            <Button className="gradient-cta text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Route
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {routes.map((route) => (
                                <Card key={route.route_id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{route.route_name}</CardTitle>
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: route.color }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{route.description}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge className={route.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {route.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Created: {new Date(route.created_at).toLocaleDateString()}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'drivers' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Driver Management</h2>
                            <Button className="gradient-cta text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Driver
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {drivers.map((driver) => (
                                <Card key={driver.driver_id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{driver.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">ID: {driver.driver_id}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Status</span>
                                                <Badge className={getStatusColor(driver.status)}>
                                                    {driver.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Assigned Route</span>
                                                <span className="text-sm font-medium">
                                                    {driver.routes?.route_name || 'Unassigned'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Current Bus</span>
                                                <span className="text-sm font-medium">
                                                    {driver.current_bus || 'None'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Settings className="w-4 h-4 mr-1" />
                                                    Assign
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'buses' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Bus Management</h2>
                            <Button className="gradient-cta text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Bus
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {buses.map((bus) => (
                                <Card key={bus.bus_number} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{bus.bus_number}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Driver: {bus.drivers?.name || 'Unassigned'}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Status</span>
                                                <Badge className={getStatusColor(bus.status)}>
                                                    {bus.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Current Driver</span>
                                                <span className="text-sm font-medium">
                                                    {bus.current_driver || 'None'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <Settings className="w-4 h-4 mr-1" />
                                                    Assign
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'trips' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Active Trips</h2>
                            <Button variant="outline" onClick={loadDashboardData}>
                                <Activity className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {activeTrips.map((trip) => (
                                <Card key={trip.trip_id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">Trip {trip.trip_id?.slice(-8)}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Started: {formatTime(trip.start_time)}
                                                </p>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">
                                                Active
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Driver</p>
                                                <p className="font-medium">{trip.drivers?.name || 'Unknown'}</p>
                                                <p className="text-xs text-muted-foreground">{trip.driver_id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Bus</p>
                                                <p className="font-medium">{trip.bus_number}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Status: {trip.buses?.status || 'Unknown'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Route</p>
                                                <p className="font-medium">{trip.drivers?.assigned_route || 'Unassigned'}</p>
                                                <p className="text-xs text-muted-foreground">Live Tracking</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {activeTrips.length === 0 && (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Active Trips</h3>
                                        <p className="text-muted-foreground">
                                            There are currently no active trips in the system.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

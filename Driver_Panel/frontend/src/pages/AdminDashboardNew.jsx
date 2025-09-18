import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import RouteFormModal from '../components/RouteFormModal';
import RouteDetailsModal from '../components/RouteDetailsModal';
import LiveTrackingModal from '../components/LiveTrackingModal';
import BusModal from '../components/BusModal';
import AssignRouteModal from '../components/AssignRouteModal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useToast } from '../components/ui/Toast';
import {
    BarChart3,
    MapPin,
    Users,
    Route,
    Bus,
    Activity,
    Plus,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

const AdminDashboardNew = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [stats, setStats] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [activeTrips, setActiveTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [isRouteDetailsModalOpen, setIsRouteDetailsModalOpen] = useState(false);
    const [isLiveTrackingModalOpen, setIsLiveTrackingModalOpen] = useState(false);
    const [isBusModalOpen, setIsBusModalOpen] = useState(false);
    const [isAssignRouteModalOpen, setIsAssignRouteModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [viewingRoute, setViewingRoute] = useState(null);
    const [trackingTrip, setTrackingTrip] = useState(null);
    const [editingBus, setEditingBus] = useState(null);
    const [assigningBus, setAssigningBus] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
        type: 'warning',
        isLoading: false
    });

    useEffect(() => {
        checkAuth();
        loadDashboardData();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        if (!token || !adminData) {
            navigate('/admin/login');
        } else {
            setCurrentAdmin(JSON.parse(adminData));
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
                fetch('http://localhost:5000/api/admin/routes/with-stops', { headers }),
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

    // Action handlers
    const handleCreateRoute = () => {
        setEditingRoute(null);
        setIsRouteModalOpen(true);
    };

    const handleEditRoute = (route) => {
        setEditingRoute(route);
        setIsRouteModalOpen(true);
    };

    const handleDeleteRoute = (routeId) => {
        const route = routes.find(r => r.route_id === routeId);
        setConfirmModal({
            isOpen: true,
            title: 'Delete Route',
            description: `Are you sure you want to delete the route "${route?.route_name || routeId}"? This action cannot be undone.`,
            onConfirm: () => confirmDeleteRoute(routeId),
            type: 'danger',
            isLoading: false
        });
    };

    const confirmDeleteRoute = async (routeId) => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/routes/${routeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setRoutes(routes.filter(r => r.route_id !== routeId));
                toast.success('Route Deleted', 'The route has been successfully deleted.');
                setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
            } else {
                toast.error('Delete Failed', 'Failed to delete the route. Please try again.');
                setConfirmModal(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            toast.error('Delete Error', 'An error occurred while deleting the route.');
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleViewRoute = (route) => {
        setViewingRoute(route);
        setIsRouteDetailsModalOpen(true);
    };

    const handleTrackLive = (trip) => {
        setTrackingTrip(trip);
        setIsLiveTrackingModalOpen(true);
    };

    const handleCreateBus = () => {
        setEditingBus(null);
        setIsBusModalOpen(true);
    };

    const handleEditBus = (bus) => {
        setEditingBus(bus);
        setIsBusModalOpen(true);
    };

    const handleAssignDriver = (bus) => {
        // TODO: Implement driver assignment functionality
        toast.info('Driver Assignment', 'Driver assignment feature coming soon!');
    };

    const handleAssignBusToRoute = (bus) => {
        setAssigningBus(bus);
        setIsAssignRouteModalOpen(true);
    };

    const handleAssignRoute = async (routeId) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/buses/${assigningBus.bus_number}/assign-route`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ route_id: routeId })
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Route Assigned', `Bus ${assigningBus.bus_number} has been assigned to the route successfully.`);
                setIsAssignRouteModalOpen(false);
                setAssigningBus(null);
                loadDashboardData(); // Refresh the data
            } else {
                throw new Error(result.error || 'Failed to assign route');
            }
        } catch (error) {
            console.error('Assign route error:', error);
            toast.error('Assignment Failed', `Failed to assign route: ${error.message}`);
        }
    };

    const handleDeleteBus = (bus) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Bus',
            message: `Are you sure you want to delete bus ${bus.bus_number}? This action cannot be undone.`,
            onConfirm: () => deleteBus(bus.bus_number),
            isLoading: false
        });
    };

    const deleteBus = async (busNumber) => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/buses/${busNumber}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                setBuses(buses.filter(b => b.bus_number !== busNumber));
                toast.success('Bus Deleted', 'The bus has been successfully deleted.');
                setConfirmModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
            } else {
                toast.error('Delete Failed', result.error || 'Failed to delete the bus. Please try again.');
                setConfirmModal(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error('Delete bus error:', error);
            toast.error('Delete Error', 'An error occurred while deleting the bus.');
            setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleSaveBus = async (busData) => {
        try {
            const token = localStorage.getItem('adminToken');
            const url = editingBus
                ? `http://localhost:5000/api/admin/buses/${editingBus.bus_number}`
                : 'http://localhost:5000/api/admin/buses';

            const method = editingBus ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(busData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Success', editingBus ? 'Bus updated successfully!' : 'Bus added successfully!');
                setIsBusModalOpen(false);
                setEditingBus(null);
                loadDashboardData(); // Refresh the data
            } else {
                throw new Error(result.error || 'Failed to save bus');
            }
        } catch (error) {
            console.error('Save bus error:', error);
            toast.error('Error', `Failed to save bus: ${error.message}`);
        }
    };

    const handleSaveRoute = async (routeData) => {
        try {
            const token = localStorage.getItem('adminToken');
            const url = editingRoute
                ? `http://localhost:5000/api/admin/routes/${routeData.route_id}`
                : 'http://localhost:5000/api/admin/routes';

            const method = editingRoute ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(routeData)
            });

            if (response.ok) {
                const result = await response.json();
                if (editingRoute) {
                    setRoutes(routes.map(r => r.route_id === routeData.route_id ? routeData : r));
                    toast.success('Route Updated', 'The route has been successfully updated.');
                } else {
                    setRoutes([...routes, routeData]);
                    toast.success('Route Created', 'The route has been successfully created.');
                }
            } else {
                toast.error('Save Failed', 'Failed to save the route. Please try again.');
            }
        } catch (error) {
            toast.error('Save Error', 'An error occurred while saving the route.');
        }
    };

    // Bus action handlers

    const renderDashboardOverview = () => (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    Welcome, {currentAdmin?.username || 'Admin'}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Manage your SmartTransit fleet and routes
                </p>
            </div>

            {/* Quick Stats */}
            {isLoading ? (
                <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        Loading stats…
                    </CardContent>
                </Card>
            ) : stats ? (
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Routes</CardTitle>
                            <Route className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {stats.totalRoutes || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Buses</CardTitle>
                            <Bus className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {stats.totalBuses || 0}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Buses</CardTitle>
                            <MapPin className="h-5 w-5 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {stats.activeTrips || 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No stats yet. Connect your backend to show live metrics.
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
                <Button
                    onClick={handleCreateRoute}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity text-white px-6 py-3 rounded-lg font-medium"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Route
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setCurrentPage('tracking')}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-medium"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    Start Tracking
                </Button>
            </div>

            {/* Recent Routes Table */}
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="px-6 py-4">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Routes</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Latest routes in your system</p>
                </CardHeader>
                <CardContent className="px-6 py-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Route ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400">Loading…</TableCell>
                                </TableRow>
                            ) : routes.length > 0 ? (
                                routes.slice(0, 5).map((route) => (
                                    <TableRow key={route.route_id}>
                                        <TableCell className="font-medium">{route.route_id}</TableCell>
                                        <TableCell>{route.route_name}</TableCell>
                                        <TableCell>
                                            <Badge className={route.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}>
                                                {route.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(route.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500 dark:text-gray-400">
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

    const renderRoutesPage = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Routes</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Manage bus routes and stops
                    </p>
                </div>
                <Button
                    onClick={handleCreateRoute}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity text-white px-6 py-3 rounded-lg font-medium"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Route
                </Button>
            </div>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="px-6 py-4">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">All Routes</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete list of bus routes in your system</p>
                </CardHeader>
                <CardContent className="px-6 py-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading routes…</div>
                    ) : routes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Route ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {routes.map((route) => (
                                    <TableRow key={route.route_id}>
                                        <TableCell className="font-medium">{route.route_id}</TableCell>
                                        <TableCell>{route.route_name}</TableCell>
                                        <TableCell>{route.description || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={route.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}>
                                                {route.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-start space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewRoute(route)}
                                                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1 text-xs"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Open
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditRoute(route)}
                                                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1 text-xs"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteRoute(route.route_id)}
                                                    className="border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 text-xs"
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
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No routes yet. Click "Add Route" to create your first route.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderBusesPage = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Buses</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Manage buses and driver assignments
                    </p>
                </div>
                <Button
                    onClick={handleCreateBus}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity text-white px-6 py-3 rounded-lg font-medium"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bus
                </Button>
            </div>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="px-6 py-4">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">All Buses</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete list of buses in your fleet</p>
                </CardHeader>
                <CardContent className="px-6 py-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading buses…</div>
                    ) : buses.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Bus Number</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned Route</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {buses.map((bus) => (
                                    <TableRow key={bus.bus_number}>
                                        <TableCell className="font-medium">{bus.bus_number}</TableCell>
                                        <TableCell>{bus.drivers?.name || 'Unassigned'}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(bus.status)}>
                                                {bus.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{bus.assigned_route || 'None'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-start space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditBus(bus)}
                                                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1 text-xs"
                                                >
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAssignBusToRoute(bus)}
                                                    className="border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-800 px-3 py-1 text-xs"
                                                >
                                                    <Route className="h-3 w-3 mr-1" />
                                                    Assign Route
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteBus(bus)}
                                                    className="border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-800 px-3 py-1 text-xs text-red-600 dark:text-red-400"
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
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No buses yet. Click "Add Bus" to add your first bus.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderTrackingPage = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Live Tracking</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Monitor active buses in real-time
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={loadDashboardData}
                    className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 px-6 py-3 rounded-lg font-medium"
                >
                    <Activity className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="px-6 py-4">
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Active Trips</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Currently running trips and their status</p>
                </CardHeader>
                <CardContent className="px-6 py-4">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading active trips…</div>
                    ) : activeTrips.length > 0 ? (
                        <div className="space-y-4">
                            {activeTrips.map((trip) => (
                                <div key={trip.trip_id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold">Trip {trip.trip_id?.slice(-8)}</h3>
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                                Active
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleTrackLive(trip)}
                                            className="flex items-center gap-2"
                                        >
                                            <MapPin className="w-4 h-4" />
                                            Track Live
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">Driver</p>
                                            <p className="font-medium">{trip.drivers?.name || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">Bus</p>
                                            <p className="font-medium">{trip.bus_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">Route</p>
                                            <p className="font-medium">{trip.drivers?.assigned_route || 'Unassigned'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold mb-2">No Active Trips</h3>
                            <p>There are currently no active trips in the system.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderAddDriverPage = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">Add Driver</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Register new drivers to the system
                    </p>
                </div>
            </div>

            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Driver Registration</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add a new driver to your fleet</p>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Driver Registration Form</h3>
                        <p>This feature will be implemented in the next update.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

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

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'dashboard': return renderDashboardOverview();
            case 'routes': return renderRoutesPage();
            case 'buses': return renderBusesPage();
            case 'tracking': return renderTrackingPage();
            case 'add-driver': return renderAddDriverPage();
            default: return renderDashboardOverview();
        }
    };

    return (
        <>
            <AdminLayout
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                currentAdmin={currentAdmin}
                onLogout={handleLogout}
            >
                {renderCurrentPage()}
            </AdminLayout>

            {/* Route Form Modal */}
            <RouteFormModal
                isOpen={isRouteModalOpen}
                onClose={() => setIsRouteModalOpen(false)}
                onSave={handleSaveRoute}
                initialRoute={editingRoute}
            />

            {/* Route Details Modal */}
            <RouteDetailsModal
                isOpen={isRouteDetailsModalOpen}
                onClose={() => setIsRouteDetailsModalOpen(false)}
                route={viewingRoute}
                onEdit={handleEditRoute}
            />

            {/* Live Tracking Modal */}
            <LiveTrackingModal
                isOpen={isLiveTrackingModalOpen}
                onClose={() => setIsLiveTrackingModalOpen(false)}
                trip={trackingTrip}
            />

            {/* Bus Modal */}
            <BusModal
                isOpen={isBusModalOpen}
                onClose={() => {
                    setIsBusModalOpen(false);
                    setEditingBus(null);
                }}
                onSave={handleSaveBus}
                bus={editingBus}
            />

            {/* Assign Route Modal */}
            <AssignRouteModal
                isOpen={isAssignRouteModalOpen}
                onClose={() => {
                    setIsAssignRouteModalOpen(false);
                    setAssigningBus(null);
                }}
                onAssign={handleAssignRoute}
                bus={assigningBus}
                routes={routes}
            />

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText="Delete"
                cancelText="Cancel"
                type={confirmModal.type}
                isLoading={confirmModal.isLoading}
            />
        </>
    );
};

export default AdminDashboardNew;

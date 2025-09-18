import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { X, MapPin, Clock, Bus, Route } from 'lucide-react';

const RouteDetailsModal = ({ isOpen, onClose, route, onEdit }) => {
    if (!route) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 relative">
                    <div className="flex items-center space-x-3 pr-8">
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: route.color || '#3B82F6' }}
                        />
                        <DialogTitle className="text-xl font-semibold">
                            {route.route_name}
                        </DialogTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        {/* Route Information */}
                        <Card>
                            <CardHeader className="px-6 py-4">
                                <CardTitle className="flex items-center space-x-2">
                                    <Route className="w-5 h-5" />
                                    <span>Route Information</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Route ID</label>
                                        <p className="text-lg font-semibold">{route.route_id}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                                        <div className="mt-1">
                                            <Badge className={route.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}>
                                                {route.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {route.description || 'No description provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {new Date(route.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                                        <p className="text-sm text-gray-900 dark:text-white mt-1">
                                            {new Date(route.updated_at || route.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Route Stops */}
                        <Card>
                            <CardHeader className="px-6 py-4">
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="w-5 h-5" />
                                    <span>Route Stops ({route.route_stops?.length || 0})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-4">
                                {route.route_stops && route.route_stops.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Stop Name</TableHead>
                                                <TableHead>Latitude</TableHead>
                                                <TableHead>Longitude</TableHead>
                                                <TableHead>Type</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {route.route_stops.map((stop, index) => (
                                                <TableRow key={stop.stop_id || index}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>{stop.stop_name}</TableCell>
                                                    <TableCell>{stop.latitude?.toFixed(6) || 'N/A'}</TableCell>
                                                    <TableCell>{stop.longitude?.toFixed(6) || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                                            {stop.is_major_stop ? 'Major' : 'Minor'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>No stops defined for this route</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button variant="outline" onClick={onClose} className="px-6 py-2">
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    onEdit(route);
                                    onClose();
                                }}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2"
                            >
                                Edit Route
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RouteDetailsModal;

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useToast } from './ui/Toast';
import { Plus, Trash2, ArrowUp, ArrowDown, X } from 'lucide-react';

const RouteFormModal = ({ isOpen, onClose, onSave, initialRoute = null }) => {
    const toast = useToast();
    const [routeId, setRouteId] = useState(initialRoute?.route_id || '');
    const [routeName, setRouteName] = useState(initialRoute?.route_name || '');
    const [description, setDescription] = useState(initialRoute?.description || '');
    const [color, setColor] = useState(initialRoute?.color || '#3B82F6');
    const [isActive, setIsActive] = useState(initialRoute?.is_active !== false);
    const [stops, setStops] = useState(initialRoute?.stops || []);

    const [newStopName, setNewStopName] = useState('');
    const [newStopLat, setNewStopLat] = useState('');
    const [newStopLong, setNewStopLong] = useState('');

    useEffect(() => {
        if (initialRoute) {
            setRouteId(initialRoute.route_id || '');
            setRouteName(initialRoute.route_name || '');
            setDescription(initialRoute.description || '');
            setColor(initialRoute.color || '#3B82F6');
            setIsActive(initialRoute.is_active !== false);
            setStops(initialRoute.stops || []);
        } else {
            setRouteId('');
            setRouteName('');
            setDescription('');
            setColor('#3B82F6');
            setIsActive(true);
            setStops([]);
        }
    }, [initialRoute, isOpen]);

    const handleAddStop = () => {
        if (!newStopName || !newStopLat || !newStopLong) return;

        const newStop = {
            stop_id: `stop_${Date.now()}`,
            stop_name: newStopName,
            latitude: parseFloat(newStopLat),
            longitude: parseFloat(newStopLong),
            stop_order: stops.length + 1,
            is_major_stop: true
        };

        setStops([...stops, newStop]);
        setNewStopName('');
        setNewStopLat('');
        setNewStopLong('');
    };

    const handleRemoveStop = (index) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const handleMoveStop = (index, direction) => {
        const newStops = [...stops];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex >= 0 && targetIndex < newStops.length) {
            [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
            setStops(newStops);
        }
    };

    const handleSave = () => {
        if (!routeId || !routeName) {
            toast.warning('Validation Error', 'Please fill in all required fields (Route ID and Route Name).');
            return;
        }

        const routeData = {
            route_id: routeId,
            route_name: routeName,
            description: description,
            color: color,
            is_active: isActive,
            stops: stops
        };

        onSave(routeData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl w-[90vw] h-[85vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 relative">
                    <DialogTitle className="text-xl font-semibold pr-8">
                        {initialRoute ? 'Edit Route' : 'Create New Route'}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute top-1/2 right-0 -translate-y-1/2 h-12 w-12 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-l-lg rounded-r-none"
                    >
                        <X className="h-8 w-8" />
                    </Button>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        {/* Basic Route Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Route Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="routeId">Route ID *</Label>
                                        <Input
                                            id="routeId"
                                            value={routeId}
                                            onChange={(e) => setRouteId(e.target.value)}
                                            placeholder="e.g., 500A"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="routeName">Route Name *</Label>
                                        <Input
                                            id="routeName"
                                            value={routeName}
                                            onChange={(e) => setRouteName(e.target.value)}
                                            placeholder="e.g., Majestic to Electronic City"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Route description..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="color">Route Color</Label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                id="color"
                                                type="color"
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                className="w-16 h-10 p-1"
                                            />
                                            <Input
                                                value={color}
                                                onChange={(e) => setColor(e.target.value)}
                                                placeholder="#3B82F6"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <Label htmlFor="isActive">Active Route</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stops Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Route Stops</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Add New Stop */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newStopName">Stop Name</Label>
                                        <Input
                                            id="newStopName"
                                            placeholder="e.g., Majestic Bus Stand"
                                            value={newStopName}
                                            onChange={(e) => setNewStopName(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newStopLat">Latitude</Label>
                                        <Input
                                            id="newStopLat"
                                            placeholder="e.g., 12.9774"
                                            type="number"
                                            step="any"
                                            value={newStopLat}
                                            onChange={(e) => setNewStopLat(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newStopLong">Longitude</Label>
                                        <Input
                                            id="newStopLong"
                                            placeholder="e.g., 77.5708"
                                            type="number"
                                            step="any"
                                            value={newStopLong}
                                            onChange={(e) => setNewStopLong(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleAddStop} className="px-6 py-2">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Stop
                                    </Button>
                                </div>

                                {/* Stops List */}
                                {stops.length > 0 && (
                                    <div className="border rounded-lg">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Order</TableHead>
                                                    <TableHead>Stop Name</TableHead>
                                                    <TableHead>Latitude</TableHead>
                                                    <TableHead>Longitude</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {stops.map((stop, index) => (
                                                    <TableRow key={stop.stop_id || index}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{stop.stop_name}</TableCell>
                                                        <TableCell>{stop.latitude.toFixed(6)}</TableCell>
                                                        <TableCell>{stop.longitude.toFixed(6)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleMoveStop(index, 'up')}
                                                                    disabled={index === 0}
                                                                >
                                                                    <ArrowUp className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleMoveStop(index, 'down')}
                                                                    disabled={index === stops.length - 1}
                                                                >
                                                                    <ArrowDown className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveStop(index)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={onClose} className="px-6 py-2">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2">
                            {initialRoute ? 'Update Route' : 'Create Route'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RouteFormModal;

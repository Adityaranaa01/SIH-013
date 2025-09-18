import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { X, Route } from 'lucide-react';

const AssignRouteModal = ({ isOpen, onClose, onAssign, bus, routes }) => {
    const [selectedRouteId, setSelectedRouteId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedRouteId) {
            onAssign(selectedRouteId);
        }
    };

    const handleClose = () => {
        setSelectedRouteId('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader className="relative">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Route className="h-5 w-5" />
                            Assign Bus to Route
                        </DialogTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="absolute top-1/2 right-0 -translate-y-1/2 h-12 w-12 p-0 text-gray-400 hover:text-gray-600 rounded-l-lg rounded-r-none"
                    >
                        <X className="h-8 w-8" />
                    </Button>
                </DialogHeader>

                <div className="px-6 pb-6">
                    {bus && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Bus:</span> {bus.bus_number}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Current Route:</span> {bus.drivers?.assigned_route || 'None'}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="route">Select Route *</Label>
                            <select
                                id="route"
                                value={selectedRouteId}
                                onChange={(e) => setSelectedRouteId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose a route...</option>
                                {routes.map((route) => (
                                    <option key={route.route_id} value={route.route_id}>
                                        {route.route_name} - {route.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 px-6"
                                disabled={!selectedRouteId}
                            >
                                Assign Route
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AssignRouteModal;

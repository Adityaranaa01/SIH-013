import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { X } from 'lucide-react';

const BusModal = ({ isOpen, onClose, onSave, bus }) => {
    const [formData, setFormData] = useState({
        bus_number: '',
        capacity: '',
        model: '',
        year: '',
        status: 'active'
    });

    useEffect(() => {
        if (bus) {
            setFormData({
                bus_number: bus.bus_number || '',
                capacity: bus.capacity || '',
                model: bus.model || '',
                year: bus.year || '',
                status: bus.status || 'active'
            });
        } else {
            setFormData({
                bus_number: '',
                capacity: '',
                model: '',
                year: '',
                status: 'active'
            });
        }
    }, [bus, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader className="relative">
                    <div className="flex items-center justify-between">
                        <DialogTitle>
                            {bus ? 'Edit Bus' : 'Add New Bus'}
                        </DialogTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute top-1/2 right-0 -translate-y-1/2 h-12 w-12 p-0 text-gray-400 hover:text-gray-600 rounded-l-lg rounded-r-none"
                    >
                        <X className="h-8 w-8" />
                    </Button>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
                    <div>
                        <Label htmlFor="bus_number">Bus Number *</Label>
                        <Input
                            id="bus_number"
                            name="bus_number"
                            value={formData.bus_number}
                            onChange={handleChange}
                            placeholder="e.g., BUS-001"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="capacity">Capacity *</Label>
                        <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="e.g., 50"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="model">Model</Label>
                        <Input
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="e.g., Volvo B7R"
                        />
                    </div>

                    <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="year"
                            name="year"
                            type="number"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="e.g., 2023"
                            min="2000"
                            max={new Date().getFullYear()}
                        />
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 px-6"
                        >
                            {bus ? 'Update Bus' : 'Add Bus'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BusModal;

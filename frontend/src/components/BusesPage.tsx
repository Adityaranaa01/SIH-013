import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Save, X, Check } from 'lucide-react';

interface Bus {
  id: string;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  assignedRoute: string | null;
  driver: string | null;
  fuelLevel: number;
  lastMaintenance: string;
  mileage: number;
}

// No dummy data: start with empty lists; populate from backend when available
const initialBuses: Bus[] = [];
const availableRoutes: string[] = [];

export function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>(initialBuses);
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [tempValues, setTempValues] = useState<Record<string, Partial<Bus>>>({});

  const handleEditRow = (busId: string) => {
    const bus = buses.find(b => b.id === busId);
    if (bus) {
      setTempValues({ ...tempValues, [busId]: { ...bus } });
      setEditingRows(prev => new Set([...prev, busId]));
    }
  };

  const handleSaveRow = (busId: string) => {
    const updatedBus = tempValues[busId];
    if (updatedBus) {
      setBuses(buses.map(bus => 
        bus.id === busId ? { ...bus, ...updatedBus } : bus
      ));
    }
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(busId);
      return newSet;
    });
    setTempValues(prev => {
      const newValues = { ...prev };
      delete newValues[busId];
      return newValues;
    });
  };

  const handleCancelRow = (busId: string) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(busId);
      return newSet;
    });
    setTempValues(prev => {
      const newValues = { ...prev };
      delete newValues[busId];
      return newValues;
    });
  };

  const handleUpdateTempValue = (busId: string, field: keyof Bus, value: any) => {
    setTempValues(prev => ({
      ...prev,
      [busId]: {
        ...prev[busId],
        [field]: value
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gradient-primary tracking-tight">Buses</h2>
        <p className="text-lg text-muted-foreground">
          Manage bus assignments and status
        </p>
      </div>

      {/* Buses Table */}
      <Card className="card-elevated border-0">
        <CardHeader>
          <CardTitle className="text-gradient-primary">Bus Fleet</CardTitle>
          <CardDescription>Assign routes and update bus status</CardDescription>
        </CardHeader>
        <CardContent>
          {buses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus ID</TableHead>
                  <TableHead>Route ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => {
                const isEditing = editingRows.has(bus.id);
                const tempBus = tempValues[bus.id] || bus;

                return (
                  <TableRow key={bus.id}>
                    <TableCell className="font-medium">{bus.plateNumber}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={tempBus.assignedRoute || 'none'}
                          onValueChange={(value) => 
                            handleUpdateTempValue(bus.id, 'assignedRoute', value === 'none' ? null : value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {availableRoutes.map((route) => (
                              <SelectItem key={route} value={route}>
                                {route}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span>{bus.assignedRoute || <span className="text-muted-foreground">None</span>}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={tempBus.status}
                          onValueChange={(value) => 
                            handleUpdateTempValue(bus.id, 'status', value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusColor(bus.status)}>
                          {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveRow(bus.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRow(bus.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRow(bus.id)}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No buses found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useEffect, useState } from "react";
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "./ui/table";
import {Card,CardContent,CardDescription,CardHeader,CardTitle} from "./ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

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

interface RouteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (route: Route) => void;
  initialRoute?: Route | null;
}

export function RouteFormModal({
  isOpen,
  onClose,
  onSave,
  initialRoute,
}: RouteFormModalProps) {
  const [routeId, setRouteId] = useState(initialRoute?.routeId || "");
  const [start, setStart] = useState(initialRoute?.start || "");
  const [end, setEnd] = useState(initialRoute?.end || "");
  const [name, setName] = useState(initialRoute?.name || "");
  const [stops, setStops] = useState<Stop[]>(initialRoute?.stops || []);

  const [newStopName, setNewStopName] = useState("");
  const [newStopLat, setNewStopLat] = useState("");
  const [newStopLong, setNewStopLong] = useState("");

  // Add a new stop
  const handleAddStop = () => {
    if (!newStopName || !newStopLat || !newStopLong) return;

    const newStop: Stop = {
      stopNumber: stops.length + 1,
      name: newStopName,
      lat: parseFloat(newStopLat),
      long: parseFloat(newStopLong),
    };

    setStops([...stops, newStop]);
    setNewStopName("");
    setNewStopLat("");
    setNewStopLong("");
  };

  // Remove a stop and re-number
  const handleRemoveStop = (index: number) => {
    const updatedStops = stops.filter((_, i) => i !== index);
    setStops(updatedStops.map((stop, i) => ({ ...stop, stopNumber: i + 1 })));
  };

  // Move stop up or down
  const handleMoveStop = (index: number, direction: "up" | "down") => {
    const newStops = [...stops];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    [newStops[index], newStops[targetIndex]] = [
      newStops[targetIndex],
      newStops[index],
    ];

    setStops(newStops.map((stop, i) => ({ ...stop, stopNumber: i + 1 })));
  };

  // Save route
  const handleSave = () => {
    if (!routeId || !start || !end) return;

    const route: Route = {
      routeId,
      start,
      end,
      name: name || null,
      stops,
    };

    onSave(route);
    handleClose();
  };

  // Reset & close form
  const handleClose = () => {
    setRouteId("");
    setStart("");
    setEnd("");
    setName("");
    setStops([]);
    setNewStopName("");
    setNewStopLat("");
    setNewStopLong("");
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    if (initialRoute) {
      setRouteId(initialRoute.routeId || "");
      setStart(initialRoute.start || "");
      setEnd(initialRoute.end || "");
      setName(initialRoute.name || "");
      setStops(initialRoute.stops || []);
    } else {
      setRouteId("");
      setStart("");
      setEnd("");
      setName("");
      setStops([]);
    }

    setNewStopName("");
    setNewStopLat("");
    setNewStopLong("");
  }, [initialRoute, isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialRoute ? "Edit Route" : "Add New Route"}
          </DialogTitle>
          <DialogDescription>
            {initialRoute
              ? "Update route information and stops"
              : "Create a new bus route with stops"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Route Info Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="routeId">Route ID</Label>
              <Input
                id="routeId"
                placeholder="e.g., R-101"
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                disabled={!!initialRoute}
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Downtown Express"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                placeholder="e.g., Central Station"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                placeholder="e.g., Airport"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>

            {/* Add Stop */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Stop</CardTitle>
                <CardDescription>
                  Enter stop details to add to the route
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="stopName">Stop Name</Label>
                  <Input
                    id="stopName"
                    placeholder="e.g., City Center"
                    value={newStopName}
                    onChange={(e) => setNewStopName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="12.9716"
                      value={newStopLat}
                      onChange={(e) => setNewStopLat(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="long">Longitude</Label>
                    <Input
                      id="long"
                      type="number"
                      step="any"
                      placeholder="77.5946"
                      value={newStopLong}
                      onChange={(e) => setNewStopLong(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleAddStop} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Stop
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Stops List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stops ({stops.length})</CardTitle>
                <CardDescription>Route stops in order</CardDescription>
              </CardHeader>
              <CardContent>
                {stops.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Stop Name</TableHead>
                        <TableHead>Lat</TableHead>
                        <TableHead>Long</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stops.map((stop, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {stop.stopNumber}
                          </TableCell>
                          <TableCell>{stop.name}</TableCell>
                          <TableCell className="text-sm">
                            {stop.lat.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {stop.long.toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveStop(index, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMoveStop(index, "down")}
                                disabled={index === stops.length - 1}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveStop(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    No stops added yet. Use the form to add stops.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!routeId || !start || !end}>
            Save Route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

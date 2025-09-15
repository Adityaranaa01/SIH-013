import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";

interface BusLocation {
  busId: string;
  driverId: string;
  route: string;
  location: {
    lat: number;
    lng: number;
    timestamp: string;
    accuracy?: number;
  };
}

interface BusData {
  id: string;
  route: string;
  currentLocation: { lat: number; lng: number };
  eta: string;
  timeToDestination: string;
  nextStop: string;
  isActive: boolean;
  lastUpdate?: string;
}

export const useRealTimeBusData = () => {
  const { socket, isConnected } = useSocket();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    // Listen for bus location updates
    const handleLocationUpdate = (data: any) => {
      // Convert WebSocket data to BusData format
      const updatedBus: BusData = {
        id: data.busNumber || data.tripId,
        route: data.routeId || `Route ${data.tripId?.slice(-4) || "Unknown"}`,
        currentLocation: {
          lat: data.latitude,
          lng: data.longitude,
        },
        eta: "Live",
        timeToDestination: "Live",
        nextStop: "Live Tracking",
        isActive: true,
        lastUpdate: data.timestamp,
      };

      setBuses((prevBuses) => {
        const existingBusIndex = prevBuses.findIndex(
          (bus) => bus.id === updatedBus.id
        );

        if (existingBusIndex >= 0) {
          // Update existing bus
          const updatedBuses = [...prevBuses];
          updatedBuses[existingBusIndex] = updatedBus;
          return updatedBuses;
        } else {
          // Add new bus
          return [...prevBuses, updatedBus];
        }
      });
    };

    // Listen for bus status updates
    const handleStatusUpdate = (data: any) => {
      if (data.status === "offline") {
        setBuses((prevBuses) =>
          prevBuses.map((bus) =>
            bus.id === data.busId ? { ...bus, isActive: false } : bus
          )
        );
      }
    };

    socket.on("bus-location-update", handleLocationUpdate);
    socket.on("bus-status-update", handleStatusUpdate);

    // Fetch initial bus data from Supabase API
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/locations/active"
        );
        const data = await response.json();

        if (data.success && data.data) {
          const formattedBuses: BusData[] = data.data.map((location: any) => ({
            id: location.busNumber || location.tripId,
            route: `Route ${location.tripId?.slice(-4) || "Unknown"}`,
            currentLocation: {
              lat: location.latitude,
              lng: location.longitude,
            },
            eta: "Live",
            timeToDestination: "Live",
            nextStop: "Live Tracking",
            isActive: true,
            lastUpdate: location.timestamp,
          }));

          setBuses(formattedBuses);
        } else {
          setBuses([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch initial bus data:", error);
        setIsLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      socket.off("bus-location-update", handleLocationUpdate);
      socket.off("bus-status-update", handleStatusUpdate);
    };
  }, [socket]);

  return { buses, isLoading, isConnected };
};

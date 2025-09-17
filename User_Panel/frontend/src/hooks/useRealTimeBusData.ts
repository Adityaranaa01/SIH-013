import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";
import { getBusDetails } from "../config/busMapping";

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
      // Get bus details from mapping
      const busDetails = getBusDetails(data.busNumber || data.tripId);

      // Convert WebSocket data to BusData format
      const updatedBus: BusData = {
        id: data.busNumber || data.tripId,
        route: busDetails
          ? busDetails.routeName
          : data.routeId || `Route ${data.tripId?.slice(-4) || "Unknown"}`,
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
        const base = (import.meta as any)?.env?.VITE_SOCKET_REST_BASE || "http://localhost:5000";
        const response = await fetch(`${base}/api/locations/active`);
        const data = await response.json();

        if (data.success && data.data) {
          const formattedBuses: BusData[] = data.data.map((location: any) => {
            const busDetails = getBusDetails(
              location.busNumber || location.tripId
            );
            return {
              id: location.busNumber || location.tripId,
              route: busDetails
                ? busDetails.routeName
                : `Route ${location.tripId?.slice(-4) || "Unknown"}`,
              currentLocation: {
                lat: location.latitude,
                lng: location.longitude,
              },
              eta: "Live",
              timeToDestination: "Live",
              nextStop: "Live Tracking",
              isActive: true,
              lastUpdate: location.timestamp,
            };
          });

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

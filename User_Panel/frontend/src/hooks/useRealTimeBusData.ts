import { useState, useEffect } from "react";
import { useSocket } from "./useSocket";
import { routeService, BusData } from "../services/routeService";

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

// BusData interface is now imported from routeService

export const useRealTimeBusData = () => {
  const { socket, isConnected } = useSocket();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes] = useState<any[]>([]);

  // Load routes on component mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await routeService.getRoutes();
        setRoutes(routesData);
      } catch (error) {
        console.error("Failed to load routes:", error);
      }
    };
    loadRoutes();
  }, []);

  // Fallback: Load initial bus data from database
  useEffect(() => {
    const loadInitialBusData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/locations/active"
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const initialBuses = result.data.map((location: any) => ({
              id: location.trip_id || location.bus_number || "unknown",
              route:
                location.route_name ||
                `Route ${location.trip_id?.slice(-4) || "Unknown"}`,
              currentLocation: {
                lat: location.latitude,
                lng: location.longitude,
              },
              eta: "Live",
              timeToDestination: "Live",
              nextStop: "Live Tracking",
              isActive: true,
              lastUpdate: location.timestamp,
              routeColor: location.route_color || "#1f77b4",
              routeDescription: location.route_description || "Live Tracking",
            }));
            setBuses(initialBuses);
          }
        }
      } catch (error) {
        console.error("Failed to load initial bus data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load initial data if no WebSocket connection or no buses yet
    if (!isConnected || buses.length === 0) {
      loadInitialBusData();
    }
  }, [isConnected, buses.length]);

  useEffect(() => {
    if (!socket) return;

    // Listen for bus location updates
    const handleLocationUpdate = (data: any) => {
      console.log("📍 Received bus-location-update:", data);

      // Get route details from dynamic routes (fallback only)
      const routeDetails =
        routes.find((route) => route.route_id === data.routeId) ||
        routeService.getRouteById(data.routeId);

      // Convert WebSocket data to BusData format
      // Prioritize backend data over cached route details
      const updatedBus: BusData = {
        id: data.busNumber || data.tripId,
        route:
          data.routeName ||
          data.routeId ||
          routeDetails?.route_name ||
          `Route ${data.tripId?.slice(-4) || "Unknown"}`,
        currentLocation: {
          lat: data.latitude,
          lng: data.longitude,
        },
        eta: "Live",
        timeToDestination: "Live",
        nextStop: "Live Tracking",
        isActive: true,
        lastUpdate: data.timestamp,
        routeColor: data.routeColor || routeDetails?.color || "#1f77b4",
        routeDescription:
          data.routeDescription || routeDetails?.description || "Live Tracking",
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

    console.log("🔌 Setting up WebSocket event listeners");
    socket.on("bus-location-update", handleLocationUpdate);
    socket.on("bus-status-update", handleStatusUpdate);
    console.log("✅ WebSocket event listeners registered");

    // Fetch initial bus data from Supabase API
    const fetchInitialData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/locations/active"
        );
        const data = await response.json();

        if (data.success && data.data) {
          const formattedBuses: BusData[] = data.data.map((location: any) => {
            const routeDetails =
              routes.find((route) => route.route_id === location.routeId) ||
              routeService.getRouteById(location.routeId);
            return {
              id: location.busNumber || location.tripId,
              route:
                location.routeName ||
                location.routeId ||
                routeDetails?.route_name ||
                `Route ${location.tripId?.slice(-4) || "Unknown"}`,
              currentLocation: {
                lat: location.latitude,
                lng: location.longitude,
              },
              eta: "Live",
              timeToDestination: "Live",
              nextStop: "Live Tracking",
              isActive: true,
              lastUpdate: location.timestamp,
              routeColor:
                location.routeColor || routeDetails?.color || "#1f77b4",
              routeDescription:
                location.routeDescription ||
                routeDetails?.description ||
                "Live Tracking",
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

    // Set up periodic refresh as fallback (every 10 seconds)
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/locations/active"
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const updatedBuses = result.data.map((location: any) => {
              const routeDetails =
                routes.find((route) => route.route_id === location.routeId) ||
                routeService.getRouteById(location.routeId);
              return {
                id: location.busNumber || location.tripId,
                route:
                  location.routeName ||
                  location.routeId ||
                  routeDetails?.route_name ||
                  `Route ${location.tripId?.slice(-4) || "Unknown"}`,
                currentLocation: {
                  lat: location.latitude,
                  lng: location.longitude,
                },
                eta: "Live",
                timeToDestination: "Live",
                nextStop: "Live Tracking",
                isActive: true,
                lastUpdate: location.timestamp,
                routeColor:
                  location.routeColor || routeDetails?.color || "#1f77b4",
                routeDescription:
                  location.routeDescription ||
                  routeDetails?.description ||
                  "Live Tracking",
              };
            });

            // Update buses with fresh data
            setBuses(updatedBuses);
          }
        }
      } catch (error) {
        console.error("Failed to refresh bus data:", error);
      }
    }, 10000); // 10 seconds

    return () => {
      socket.off("bus-location-update", handleLocationUpdate);
      socket.off("bus-status-update", handleStatusUpdate);
      clearInterval(refreshInterval);
    };
  }, [socket, routes]);

  return { buses, isLoading, isConnected };
};

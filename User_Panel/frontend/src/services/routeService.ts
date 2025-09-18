const API_BASE_URL = "http://localhost:5000/api";

export interface RouteStop {
  stop_id: number;
  stop_name: string;
  stop_order: number;
  latitude: number;
  longitude: number;
  is_major_stop: boolean;
}

export interface Route {
  route_id: string;
  route_name: string;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  route_stops?: RouteStop[];
}

export interface BusData {
  id: string;
  route: string;
  currentLocation: { lat: number; lng: number };
  eta: string;
  timeToDestination: string;
  nextStop: string;
  isActive: boolean;
  lastUpdate?: string;
  routeColor?: string;
  routeDescription?: string;
}

class RouteService {
  private routes: Route[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getRoutes(): Promise<Route[]> {
    const now = Date.now();

    if (this.routes.length > 0 && now - this.lastFetch < this.CACHE_DURATION) {
      return this.routes;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/routes/with-stops`);
      const result = await response.json();

      if (result.success) {
        this.routes = result.data;
        this.lastFetch = now;
        return this.routes;
      } else {
        console.error("Failed to fetch routes:", result.error);
        return this.getFallbackRoutes();
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      return this.getFallbackRoutes();
    }
  }

  async getRoutesWithStops(): Promise<Route[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/routes/with-stops`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        console.error("Failed to fetch routes with stops:", result.error);
        return this.getFallbackRoutes();
      }
    } catch (error) {
      console.error("Error fetching routes with stops:", error);
      return this.getFallbackRoutes();
    }
  }

  getRouteById(routeId: string): Route | null {
    return this.routes.find((route) => route.route_id === routeId) || null;
  }

  getBusesForRoute(routeId: string): BusData[] {
    return [];
  }

  searchRoutes(query: string): Route[] {
    const lowerQuery = query.toLowerCase();
    return this.routes.filter(
      (route) =>
        route.route_name.toLowerCase().includes(lowerQuery) ||
        route.description.toLowerCase().includes(lowerQuery)
    );
  }

  private getFallbackRoutes(): Route[] {
    return [
      {
        route_id: "500A",
        route_name: "500A",
        description: "Majestic → Electronic City",
        color: "#FF6B6B",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        route_stops: [
          {
            stop_id: 1,
            stop_name: "Majestic Bus Stand",
            stop_order: 1,
            latitude: 12.9774,
            longitude: 77.5708,
            is_major_stop: true,
          },
          {
            stop_id: 2,
            stop_name: "Cubbon Park",
            stop_order: 2,
            latitude: 12.9716,
            longitude: 77.5946,
            is_major_stop: true,
          },
          {
            stop_id: 3,
            stop_name: "MG Road",
            stop_order: 3,
            latitude: 12.9716,
            longitude: 77.5946,
            is_major_stop: true,
          },
          {
            stop_id: 4,
            stop_name: "Banashankari",
            stop_order: 4,
            latitude: 12.9254,
            longitude: 77.5671,
            is_major_stop: true,
          },
          {
            stop_id: 5,
            stop_name: "JP Nagar",
            stop_order: 5,
            latitude: 12.9076,
            longitude: 77.5852,
            is_major_stop: true,
          },
          {
            stop_id: 6,
            stop_name: "Bommanahalli",
            stop_order: 6,
            latitude: 12.8994,
            longitude: 77.6184,
            is_major_stop: true,
          },
          {
            stop_id: 7,
            stop_name: "Hosur Road",
            stop_order: 7,
            latitude: 12.8456,
            longitude: 77.6603,
            is_major_stop: true,
          },
          {
            stop_id: 8,
            stop_name: "Electronic City",
            stop_order: 8,
            latitude: 12.8456,
            longitude: 77.6603,
            is_major_stop: true,
          },
        ],
      },
      {
        route_id: "600B",
        route_name: "600B",
        description: "Whitefield → Majestic",
        color: "#4ECDC4",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        route_stops: [
          {
            stop_id: 9,
            stop_name: "Whitefield",
            stop_order: 1,
            latitude: 12.9698,
            longitude: 77.75,
            is_major_stop: true,
          },
          {
            stop_id: 10,
            stop_name: "Marathahalli",
            stop_order: 2,
            latitude: 12.9698,
            longitude: 77.75,
            is_major_stop: true,
          },
          {
            stop_id: 11,
            stop_name: "Koramangala",
            stop_order: 3,
            latitude: 12.9352,
            longitude: 77.6245,
            is_major_stop: true,
          },
          {
            stop_id: 12,
            stop_name: "Indiranagar",
            stop_order: 4,
            latitude: 12.9716,
            longitude: 77.6406,
            is_major_stop: true,
          },
          {
            stop_id: 13,
            stop_name: "Cubbon Park",
            stop_order: 5,
            latitude: 12.9716,
            longitude: 77.5946,
            is_major_stop: true,
          },
          {
            stop_id: 14,
            stop_name: "Majestic Bus Stand",
            stop_order: 6,
            latitude: 12.9774,
            longitude: 77.5708,
            is_major_stop: true,
          },
        ],
      },
      {
        route_id: "700A",
        route_name: "700A",
        description: "Majestic → Kempegowda Airport",
        color: "#45B7D1",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        route_stops: [
          {
            stop_id: 15,
            stop_name: "Majestic Bus Stand",
            stop_order: 1,
            latitude: 12.9774,
            longitude: 77.5708,
            is_major_stop: true,
          },
          {
            stop_id: 16,
            stop_name: "Cubbon Park",
            stop_order: 2,
            latitude: 12.9716,
            longitude: 77.5946,
            is_major_stop: true,
          },
          {
            stop_id: 17,
            stop_name: "Hebbal",
            stop_order: 3,
            latitude: 13.0507,
            longitude: 77.5908,
            is_major_stop: true,
          },
          {
            stop_id: 18,
            stop_name: "Yelahanka",
            stop_order: 4,
            latitude: 13.1007,
            longitude: 77.5963,
            is_major_stop: true,
          },
          {
            stop_id: 19,
            stop_name: "Kempegowda Airport",
            stop_order: 5,
            latitude: 13.1986,
            longitude: 77.7063,
            is_major_stop: true,
          },
        ],
      },
    ];
  }
}

export const routeService = new RouteService();
export default routeService;

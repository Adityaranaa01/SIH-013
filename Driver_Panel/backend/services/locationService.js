import { supabase } from '../config/database.js';

export class LocationService {

  static async saveLocation(locationData) {
    try {
      const { tripId, latitude, longitude, timestamp } = locationData;

      if (!tripId || latitude === undefined || longitude === undefined) {
        return {
          success: false,
          error: 'Missing required location data fields'
        };
      }

      const { data, error } = await supabase
        .from('trip_locations')
        .insert({
          trip_id: tripId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: timestamp || new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          locationId: data.location_id ?? data.id,
          tripId: data.trip_id,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp
        }
      };
    } catch (error) {
      console.error('Save location error:', error);
      return {
        success: false,
        error: 'Failed to save location data'
      };
    }
  }

  static async getLocationHistory(tripId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('trip_locations')
        .select('*')
        .eq('trip_id', tripId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data.map(location => ({
          locationId: location.location_id ?? location.id,
          tripId: location.trip_id,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp
        }))
      };
    } catch (error) {
      console.error('Get location history error:', error);
      return {
        success: false,
        error: 'Failed to retrieve location history'
      };
    }
  }

  static async getLatestLocation(tripId) {
    try {
      const { data, error } = await supabase
        .from('trip_locations')
        .select('*')
        .eq('trip_id', tripId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        success: true,
        data: data ? {
          locationId: data.location_id ?? data.id,
          tripId: data.trip_id,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp
        } : null
      };
    } catch (error) {
      console.error('Get latest location error:', error);
      return {
        success: false,
        error: 'Failed to retrieve latest location'
      };
    }
  }

  static async getLatestByBus(busNumber) {
    try {
      const { data, error } = await supabase
        .from('trip_locations')
        .select('*, trips!inner(bus_number, trip_id)')
        .eq('trips.bus_number', busNumber)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        success: true,
        data: data ? {
          locationId: data.location_id ?? data.id,
          tripId: data.trip_id,
          busNumber,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp
        } : null
      };
    } catch (error) {
      console.error('Get latest by bus error:', error);
      return {
        success: false,
        error: 'Failed to retrieve latest location for bus'
      };
    }
  }

  static async getActiveLocations() {
    try {
      const { data: activeTrips, error: tripsError } = await supabase
        .from('trips')
        .select(`
          trip_id, 
          driver_id, 
          bus_number,
          drivers(assigned_route),
          buses(assigned_route)
        `)
        .eq('status', 'active');

      if (tripsError) {
        throw tripsError;
      }

      if (!activeTrips || activeTrips.length === 0) {
        return {
          success: true,
          data: []
        };
      }

      const locationPromises = activeTrips.map(trip =>
        this.getLatestLocation(trip.trip_id)
      );

      const locationResults = await Promise.all(locationPromises);

      const routeIds = [...new Set(activeTrips.map(trip =>
        trip.buses?.assigned_route || trip.drivers?.assigned_route
      ).filter(Boolean))];
      const routeDetails = {};

      if (routeIds.length > 0) {
        const { data: routes, error: routesError } = await supabase
          .from('routes')
          .select('route_id, route_name, description, color')
          .in('route_id', routeIds);

        if (!routesError && routes) {
          routes.forEach(route => {
            routeDetails[route.route_id] = route;
          });
        }
      }

      const activeLocations = locationResults
        .filter(result => result.success && result.data)
        .map((result, index) => {
          const trip = activeTrips[index];
          const location = result.data;
          const assignedRoute = trip.buses?.assigned_route || trip.drivers?.assigned_route;
          const route = routeDetails[assignedRoute];

          return {
            ...location,
            routeId: assignedRoute,
            routeName: route?.route_name || `Route ${assignedRoute}`,
            routeDescription: route?.description || 'Live Tracking',
            routeColor: route?.color || '#1f77b4',
            busNumber: trip.bus_number,
            driverId: trip.driver_id
          };
        });

      return {
        success: true,
        data: activeLocations
      };
    } catch (error) {
      console.error('Get active locations error:', error);
      return {
        success: false,
        error: 'Failed to retrieve active locations'
      };
    }
  }
}

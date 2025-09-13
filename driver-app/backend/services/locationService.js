// backend/services/locationService.js
import { supabase } from '../config/database.js';

/**
 * GPS location tracking service
 */
export class LocationService {
  
  /**
   * Save GPS location data
   * @param {Object} locationData - GPS location data
   * @param {string} locationData.tripId - Trip ID
   * @param {number} locationData.latitude - Latitude coordinate
   * @param {number} locationData.longitude - Longitude coordinate
   * @param {string} locationData.timestamp - Timestamp (optional, defaults to now)
   * @returns {Promise<Object>} Saved location data or error
   */
  static async saveLocation(locationData) {
    try {
      const { tripId, latitude, longitude, timestamp } = locationData;

      // Validate required fields
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

  /**
   * Get location history for a trip
   * @param {string} tripId - Trip ID
   * @param {number} limit - Maximum number of records to return (default: 50)
   * @returns {Promise<Object>} Location history or error
   */
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

  /**
   * Get latest location for a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Latest location data or error
   */
  static async getLatestLocation(tripId) {
    try {
      const { data, error } = await supabase
        .from('trip_locations')
        .select('*')
        .eq('trip_id', tripId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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

  /**
   * Get latest location for a bus regardless of trip status
   * @param {string} busNumber - Bus number
   * @returns {Promise<Object>} Latest location data or null
   */
  static async getLatestByBus(busNumber) {
    try {
      // Join trip_locations with trips to filter by bus_number
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

  /**
   * Get real-time locations for all active trips
   * @returns {Promise<Object>} Active locations or error
   */
  static async getActiveLocations() {
    try {
      // First get all active trips
      const { data: activeTrips, error: tripsError } = await supabase
        .from('trips')
        .select('trip_id, driver_id, bus_number')
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

      // Get latest location for each active trip
      const locationPromises = activeTrips.map(trip => 
        this.getLatestLocation(trip.trip_id)
      );

      const locationResults = await Promise.all(locationPromises);
      
      const activeLocations = locationResults
        .filter(result => result.success && result.data)
        .map(result => result.data);

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

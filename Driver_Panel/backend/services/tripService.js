// backend/services/tripService.js
import { supabase } from '../config/database.js';

/**
 * Trip management service
 */
export class TripService {
  
  /**
   * Check if driver has an active trip
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} Active trip data or null
   */
  static async getActiveTrip(driverId) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('trip_id, driver_id, bus_number, start_time, status')
        .eq('driver_id', driverId)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return {
        success: true,
        data: data ? {
          tripId: data.trip_id,
          driverId: data.driver_id,
          busNumber: data.bus_number,
          startTime: data.start_time,
          status: data.status
        } : null
      };
    } catch (error) {
      console.error('Get active trip error:', error);
      return {
        success: false,
        error: 'Failed to check for active trips'
      };
    }
  }

  /**
   * Start a new trip
   * @param {string} driverId - Driver ID
   * @param {string} busNumber - Bus number
   * @returns {Promise<Object>} New trip data or error
   */
  static async startTrip(driverId, busNumber) {
    try {
      // First check if there's already an active trip
      const activeTrip = await this.getActiveTrip(driverId);
      if (activeTrip.success && activeTrip.data) {
        return {
          success: false,
          error: 'Driver already has an active trip'
        };
      }

      const { data, error } = await supabase
        .from('trips')
        .insert({
          driver_id: driverId,
          bus_number: busNumber,
          status: 'active',
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update driver and bus statuses
      await supabase.from('drivers').update({ status: 'on_trip', current_bus: busNumber }).eq('driver_id', driverId);
      await supabase.from('buses').update({ status: 'running', current_driver: driverId }).eq('bus_number', busNumber);

      return {
        success: true,
        data: {
          tripId: data.trip_id,
          driverId: data.driver_id,
          busNumber: data.bus_number,
          startTime: data.start_time,
          status: data.status
        }
      };
    } catch (error) {
      console.error('Start trip error:', error);
      return {
        success: false,
        error: 'Failed to start trip'
      };
    }
  }

  /**
   * End an active trip
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Updated trip data or error
   */
  static async endTrip(tripId) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          end_time: new Date().toISOString(),
          status: 'ended'
        })
        .eq('trip_id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update driver and bus statuses after trip ends
      if (data) {
        const driverId = data.driver_id;
        const busNumber = data.bus_number;
        await supabase.from('drivers').update({ status: 'active', current_bus: busNumber }).eq('driver_id', driverId);
        await supabase.from('buses').update({ status: 'assigned', current_driver: driverId }).eq('bus_number', busNumber);
      }

      return {
        success: true,
        data: {
          tripId: data.trip_id,
          driverId: data.driver_id,
          busNumber: data.bus_number,
          startTime: data.start_time,
          endTime: data.end_time,
          status: data.status
        }
      };
    } catch (error) {
      console.error('End trip error:', error);
      return {
        success: false,
        error: 'Failed to end trip'
      };
    }
  }

  /**
   * Get trip details by ID
   * @param {string} tripId - Trip ID
   * @returns {Promise<Object>} Trip data or error
   */
  static async getTripById(tripId) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('trip_id', tripId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Trip not found'
        };
      }

      return {
        success: true,
        data: {
          tripId: data.trip_id,
          driverId: data.driver_id,
          busNumber: data.bus_number,
          startTime: data.start_time,
          endTime: data.end_time,
          status: data.status,
          createdAt: data.created_at
        }
      };
    } catch (error) {
      console.error('Get trip error:', error);
      return {
        success: false,
        error: 'Service error'
      };
    }
  }
}

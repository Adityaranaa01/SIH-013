// backend/services/driverService.js
import { supabase } from '../config/database.js';

/**
 * Driver authentication and management service
 */
export class DriverService {
  
  /**
   * Authenticate driver with ID and bus number
   * @param {string} driverId - Driver ID
   * @param {string} busNumber - Bus number
   * @returns {Promise<Object>} Driver data or error
   */
  static async authenticateDriver(driverId, busNumber) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('driver_id', driverId)
        .eq('bus_number', busNumber)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Invalid driver ID or bus number'
        };
      }

      return {
        success: true,
        data: {
          driverId: data.driver_id,
          busNumber: data.bus_number,
          name: data.name,
          routeId: data.route_id
        }
      };
    } catch (error) {
      console.error('Driver authentication error:', error);
      return {
        success: false,
        error: 'Authentication service error'
      };
    }
  }

  /**
   * Get driver information by ID
   * @param {string} driverId - Driver ID
   * @returns {Promise<Object>} Driver data or error
   */
  static async getDriverById(driverId) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('driver_id', driverId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'Driver not found'
        };
      }

      return {
        success: true,
        data: {
          driverId: data.driver_id,
          busNumber: data.bus_number,
          name: data.name,
          routeId: data.route_id,
          createdAt: data.created_at
        }
      };
    } catch (error) {
      console.error('Get driver error:', error);
      return {
        success: false,
        error: 'Service error'
      };
    }
  }
}
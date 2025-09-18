import { supabase } from '../config/database.js';

export class DriverService {

  static async authenticateDriver(driverId, busNumber) {
    try {
      const { data: driver, error: dErr } = await supabase
        .from('drivers')
        .select('driver_id, status, current_bus, name')
        .eq('driver_id', driverId)
        .maybeSingle();

      if (dErr || !driver) {
        return { success: false, error: 'Invalid driver ID' };
      }

      const { data: bus, error: bErr } = await supabase
        .from('buses')
        .select('bus_number, status, current_driver')
        .eq('bus_number', busNumber)
        .maybeSingle();

      if (bErr || !bus) {
        return { success: false, error: 'Invalid bus number' };
      }

      const { error: updDriverErr } = await supabase
        .from('drivers')
        .update({ status: 'active', current_bus: busNumber })
        .eq('driver_id', driverId);

      if (updDriverErr) {
        throw updDriverErr;
      }

      const { error: updBusErr } = await supabase
        .from('buses')
        .update({ status: 'assigned', current_driver: driverId })
        .eq('bus_number', busNumber);

      if (updBusErr) {
        throw updBusErr;
      }

      return {
        success: true,
        data: {
          driverId,
          busNumber,
          driverStatus: 'active',
          busStatus: 'assigned',
          name: driver.name ?? null
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

  static async getDriverById(driverId) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('driver_id, status, current_bus, name, created_at')
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
          status: data.status,
          currentBus: data.current_bus,
          name: data.name,
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

  static async logout(driverId, busNumber) {
    try {
      const { data: activeTrip, error: tripErr } = await supabase
        .from('trips')
        .select('trip_id')
        .eq('driver_id', driverId)
        .eq('status', 'active')
        .maybeSingle();

      if (tripErr) {
        throw tripErr;
      }

      if (activeTrip) {
        return {
          success: false,
          error: 'Cannot logout while a trip is active. Please end the trip first.'
        };
      }

      const { error: dErr } = await supabase
        .from('drivers')
        .update({ status: 'inactive', current_bus: null })
        .eq('driver_id', driverId);
      if (dErr) throw dErr;

      const { error: bErr } = await supabase
        .from('buses')
        .update({ status: 'halt', current_driver: null })
        .eq('bus_number', busNumber)
        .eq('current_driver', driverId);
      if (bErr) throw bErr;

      return { success: true, data: { driverId, busNumber, driverStatus: 'inactive', busStatus: 'halt' } };
    } catch (error) {
      console.error('Driver logout error:', error);
      return { success: false, error: 'Logout service error' };
    }
  }
}

import { supabase } from '../config/database.js';

export class CleanupService {

  static async cleanupOldLocations(hoursOld = 24) {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

      console.log(`Cleaning up location data for ended trips older than ${hoursOld} hour(s): ${cutoffTime.toISOString()}`);

      const { data, error } = await supabase
        .from('trip_locations')
        .delete()
        .lt('timestamp', cutoffTime.toISOString())
        .in('trip_id',
          supabase
            .from('trips')
            .select('trip_id')
            .eq('status', 'ended')
        )
        .select('location_id, trip_id, timestamp');

      if (error) {
        throw error;
      }

      const deletedCount = data ? data.length : 0;
      console.log(`Cleaned up ${deletedCount} old location records from ended trips`);

      return {
        success: true,
        deletedCount,
        cutoffTime: cutoffTime.toISOString()
      };
    } catch (error) {
      console.error('Cleanup old locations error:', error);
      return {
        success: false,
        error: 'Failed to cleanup old locations'
      };
    }
  }

  static async getLocationCount() {
    try {
      const { count, error } = await supabase
        .from('trip_locations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw error;
      }

      return {
        success: true,
        count: count || 0
      };
    } catch (error) {
      console.error('Get location count error:', error);
      return {
        success: false,
        error: 'Failed to get location count'
      };
    }
  }

  static async cleanupTripLocations(tripId) {
    try {
      console.log(`Cleaning up location data for ended trip: ${tripId}`);

      const { data, error } = await supabase
        .from('trip_locations')
        .delete()
        .eq('trip_id', tripId)
        .select('location_id, trip_id, timestamp');

      if (error) {
        throw error;
      }

      const deletedCount = data ? data.length : 0;
      console.log(`Cleaned up ${deletedCount} location records for trip ${tripId}`);

      return {
        success: true,
        deletedCount,
        tripId
      };
    } catch (error) {
      console.error('Cleanup trip locations error:', error);
      return {
        success: false,
        error: 'Failed to cleanup trip locations'
      };
    }
  }

  static async getOldestLocation() {
    try {
      const { data, error } = await supabase
        .from('trip_locations')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return {
        success: true,
        data: data || null
      };
    } catch (error) {
      console.error('Get oldest location error:', error);
      return {
        success: false,
        error: 'Failed to get oldest location'
      };
    }
  }
}

export function startCleanupJob() {
  console.log('Starting location cleanup job...');

  setInterval(async () => {
    try {
      const result = await CleanupService.cleanupOldLocations(24);

      if (result.success && result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} old location records from ended trips`);
      }

      const countResult = await CleanupService.getLocationCount();
      if (countResult.success) {
        console.log(`Current location records in database: ${countResult.count}`);
      }
    } catch (error) {
      console.error('Cleanup job error:', error);
    }
  }, 3600000);

  console.log('Location cleanup job started (runs every hour, only cleans ended trips)');
}
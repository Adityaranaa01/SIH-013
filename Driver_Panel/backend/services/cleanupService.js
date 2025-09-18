// backend/services/cleanupService.js
import { supabase } from '../config/database.js';

/**
 * Cleanup service for managing old data
 */
export class CleanupService {

  /**
   * Clean up old location data for ended trips only
   * @param {number} hoursOld - Age in hours for ended trips (default: 24 hours)
   * @returns {Promise<Object>} Cleanup result
   */
  static async cleanupOldLocations(hoursOld = 24) {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - hoursOld);

      console.log(`Cleaning up location data for ended trips older than ${hoursOld} hour(s): ${cutoffTime.toISOString()}`);

      // Only delete location data for trips that have ended
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

  /**
   * Get location count for monitoring
   * @returns {Promise<Object>} Location count data
   */
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

  /**
   * Clean up location data for a specific ended trip
   * @param {string} tripId - Trip ID to clean up
   * @returns {Promise<Object>} Cleanup result
   */
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

  /**
   * Get oldest location timestamp
   * @returns {Promise<Object>} Oldest location data
   */
  static async getOldestLocation() {
    try {
      const { data, error } = await supabase
        .from('trip_locations')
        .select('timestamp')
        .order('timestamp', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
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

/**
 * Start the background cleanup job
 * Runs every hour to clean up old location data from ended trips only
 */
export function startCleanupJob() {
  console.log('🧹 Starting location cleanup job...');

  // Run cleanup every hour (3600000 ms)
  setInterval(async () => {
    try {
      const result = await CleanupService.cleanupOldLocations(24); // Clean up data from ended trips older than 24 hours

      if (result.success && result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} old location records from ended trips`);
      }

      // Optional: Log current location count for monitoring
      const countResult = await CleanupService.getLocationCount();
      if (countResult.success) {
        console.log(`📍 Current location records in database: ${countResult.count}`);
      }
    } catch (error) {
      console.error('❌ Cleanup job error:', error);
    }
  }, 3600000); // 1 hour

  console.log('✅ Location cleanup job started (runs every hour, only cleans ended trips)');
}
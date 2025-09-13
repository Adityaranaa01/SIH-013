// backend/services/cleanupService.js
import { supabase } from '../config/database.js';

/**
 * Background cleanup job to delete intermediary coordinates for completed trips
 * Strategy:
 * - Periodically (every 30s) find trips completed > 1 minute ago
 * - For each such trip, keep the latest bus_locations row and delete the rest
 * - Mark trip as cleaned to avoid repeated work (uses a helper table or a metadata flag)
 *
 * Note: For a production-grade solution on Supabase, consider using Postgres
 * cron (pg_cron) or a Supabase scheduled function. This in-process job is
 * acceptable for a single-instance dev deployment.
 */

const CLEANUP_INTERVAL_MS = 30_000; // run every 30s
const GRACE_PERIOD_MS = 60_000; // 1 minute after trip end

async function getCompletedTripsNeedingCleanup() {
  // Fetch trips where status = 'ended' and end_time older than 1 minute
  const cutoffIso = new Date(Date.now() - GRACE_PERIOD_MS).toISOString();
  const { data, error } = await supabase
    .from('trips')
    .select('trip_id')
.eq('status', 'ended')
    .lt('end_time', cutoffIso);

  if (error) throw error;
  return data || [];
}

async function cleanupTripLocations(tripId) {
  // Find latest location id for the trip
  const { data: latest, error: latestErr } = await supabase
    .from('trip_locations')
    .select('location_id')
    .eq('trip_id', tripId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestErr) throw latestErr;

  // If no locations, nothing to do
  if (!latest) return { success: true, deleted: 0 };

  const latestId = latest.location_id ?? latest.id;

  // Delete all other locations for the trip
  const { error: delErr, count } = await supabase
    .from('trip_locations')
    .delete({ count: 'exact' })
    .eq('trip_id', tripId)
    .neq('location_id', latestId);

  if (delErr) throw delErr;
  return { success: true, deleted: count ?? 0 };
}

export function startCleanupJob() {
  const run = async () => {
    try {
      const trips = await getCompletedTripsNeedingCleanup();
      if (!trips.length) return;

      for (const t of trips) {
        try {
          const result = await cleanupTripLocations(t.trip_id);
          if (result.success) {
            // Optional: could mark a cleaned flag if schema supports it
            // For now, deletion is idempotent; repeats will delete 0 rows
            // console.log(`Cleanup for trip ${t.trip_id}: deleted ${result.deleted} rows`);
          }
        } catch (err) {
          console.error(`Cleanup failed for trip ${t.trip_id}:`, err.message || err);
        }
      }
    } catch (err) {
      console.error('Cleanup scan failed:', err.message || err);
    }
  };

  // Run periodically
  setInterval(run, CLEANUP_INTERVAL_MS);
  // Also run once at startup (after small delay to let server boot)
  setTimeout(run, 5_000);
}


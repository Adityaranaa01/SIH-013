// src/utils/geo.js
class GeoTracker {
  constructor() {
    this.watchId = null;
    this.intervalId = null;
    this.updateInterval = 5000; // 5 seconds in milliseconds
    this.isTracking = false;
    this.tripData = null;
    this.onLocationUpdate = null;
    this.onError = null;
    this.lastUpdateTime = 0;
    this.isGettingPosition = false; // Flag to prevent concurrent requests
    this.lastGpsDataTime = 0; // Track when we last received ANY GPS data
  }

  /**
   * Start GPS tracking with regular 5-second updates
   * @param {Object} tripData - Contains trip_id, driver_id, bus_number
   * @param {Function} onLocationUpdate - Callback for successful location updates
   * @param {Function} onError - Callback for errors
   */
  startTracking(tripData, onLocationUpdate = null, onError = null) {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser');
      if (onError) onError(error);
      return false;
    }

    this.tripData = tripData;
    this.isTracking = true;
    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;

    console.log('🚀 GPS tracking started with hybrid approach');

    // Use watchPosition for continuous tracking (browser-friendly)
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => this.handleError(error),
      options
    );

    // Set up a backup timer that only activates if watchPosition stops working
    // This will force an update only if we haven't received GPS data for 10+ seconds
    this.intervalId = setInterval(() => {
      if (this.isTracking) {
        const timeSinceLastGpsData = Date.now() - this.lastGpsDataTime;
        const timeSinceLastUpdate = Date.now() - this.lastUpdateTime;
        
        // Only use backup if:
        // 1. We haven't received ANY GPS data for 10+ seconds (watchPosition likely failed)
        // 2. We haven't saved to database for 5+ seconds
        // 3. No request is already in progress
        if (timeSinceLastGpsData > 10000 && timeSinceLastUpdate >= this.updateInterval && !this.isGettingPosition) {
          console.log(`⚠️ watchPosition seems dead (${Math.round(timeSinceLastGpsData/1000)}s no GPS data) - using backup timer`);
          this.getCurrentPosition();
        } else if (timeSinceLastGpsData <= 10000) {
          // watchPosition is working fine, no need for backup
          // console.log(`✅ watchPosition working fine (last GPS data ${Math.round(timeSinceLastGpsData/1000)}s ago)`);
        }
      }
    }, 5000); // Check every 5 seconds

    return true;
  }

  /**
   * Stop GPS tracking
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isTracking = false;
    this.isGettingPosition = false;
    this.tripData = null;
    this.lastUpdateTime = 0;
    this.lastGpsDataTime = 0;
    
    console.log('GPS tracking stopped');
  }

  /**
   * Get current GPS position
   */
  getCurrentPosition() {
    if (this.isGettingPosition) {
      console.log('⚠️ GPS request already in progress, skipping');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const startTime = Date.now();
    this.isGettingPosition = true;
    console.log('📍 Requesting current GPS position...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const responseTime = Date.now() - startTime;
        this.isGettingPosition = false;
        console.log(`✅ GPS position received in ${responseTime}ms`);
        this.handlePosition(position);
      },
      (error) => {
        const responseTime = Date.now() - startTime;
        this.isGettingPosition = false;
        console.log(`❌ GPS error after ${responseTime}ms`);
        this.handleError(error);
      },
      options
    );
  }

  /**
   * Handle GPS position updates with 5-second throttling
   */
  async handlePosition(position) {
    const currentTime = Date.now();
    this.lastGpsDataTime = currentTime; // Update GPS data timestamp
    
    const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
    
    // Only process if 5 seconds have passed since last update
    if (this.lastUpdateTime > 0 && timeSinceLastUpdate < this.updateInterval) {
      console.log(`⏳ Throttling GPS update - only ${timeSinceLastUpdate}ms passed, need ${this.updateInterval}ms`);
      return;
    }

    const { latitude, longitude } = position.coords;
    const timestamp = new Date().toISOString();
    const timeString = new Date().toLocaleTimeString();

    console.log(`🎯 Processing GPS update at ${timeString}:`, {
      lat: latitude.toFixed(6),
      lng: longitude.toFixed(6),
      timeSinceLastUpdate: timeSinceLastUpdate
    });

    try {
      // Import supabase dynamically to avoid initialization errors
      const { supabase } = await import('../config/supabase.js');
      
      if (!supabase) {
        throw new Error('Supabase client not initialized. Please check your environment variables.');
      }

      // Insert location data into bus_locations table
      const { data, error } = await supabase
        .from('bus_locations')
        .insert({
          trip_id: this.tripData.trip_id,
          driver_id: this.tripData.driver_id,
          bus_number: this.tripData.bus_number,
          latitude: latitude,    // Fixed: was 'lat', now 'latitude' to match schema
          longitude: longitude,  // Fixed: was 'lng', now 'longitude' to match schema
          timestamp: timestamp
        });

      if (error) {
        throw error;
      }

      this.lastUpdateTime = currentTime;
      console.log(`✅ Location saved at ${timeString}`);

      // Call success callback if provided
      if (this.onLocationUpdate) {
        this.onLocationUpdate({
          latitude,
          longitude,
          timestamp,
          data
        });
      }

    } catch (error) {
      console.error('Error saving location:', error);
      if (this.onError) this.onError(error);
    }
  }

  /**
   * Handle GPS errors
   */
  handleError(error) {
    let errorMessage = 'Unknown location error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timeout';
        break;
    }

    console.error('GPS error:', errorMessage);
    if (this.onError) this.onError(new Error(errorMessage));
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      intervalId: this.intervalId,
      tripData: this.tripData,
      lastUpdateTime: this.lastUpdateTime
    };
  }

  /**
   * Update trip data without restarting tracking
   */
  updateTripData(newTripData) {
    if (this.isTracking) {
      this.tripData = { ...this.tripData, ...newTripData };
    }
  }
}

// Create and export a singleton instance
export const geoTracker = new GeoTracker();

// Export the class for creating additional instances if needed
export { GeoTracker };
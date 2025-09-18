// src/utils/geo.js
import { locationAPI } from '../services/api.js';

class GeoTracker {
  constructor() {
    this.watchId = null;
    this.intervalId = null;
    this.updateInterval = 2000; // 2 seconds in milliseconds
    this.isTracking = false;
    this.tripData = null;
    this.onLocationUpdate = null;
    this.onError = null;
    this.lastUpdateTime = 0;
    this.isGettingPosition = false; // Flag to prevent concurrent requests
    this.lastGpsDataTime = 0; // Track when we last received ANY GPS data
    this.bestAccuracy = null; // Track the best accuracy achieved
    this.accuracyThreshold = 100; // Target accuracy in meters (100m initially, will improve)
    this.maxWaitTime = 10000; // Maximum time to wait for accurate fix (10 seconds)
    this.fallbackThreshold = 30000; // After 30s, accept any accuracy under 50km
    this.emergencyThreshold = 60000; // After 60s, accept any reasonable accuracy
    this.accuracyWaitStart = 0; // When we started waiting for accurate fix
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
    this.bestAccuracy = null;
    this.accuracyWaitStart = Date.now();


    // Use watchPosition for continuous tracking with high accuracy
    const options = {
      enableHighAccuracy: true, // Force high accuracy mode
      timeout: 10000, // Wait up to 10 seconds for a position
      maximumAge: 60000 // Allow cached positions up to 1 minute old
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(position),
      (error) => this.handleError(error),
      options
    );

    // Set up a backup timer that only activates if watchPosition stops working
    this.intervalId = setInterval(() => {
      if (this.isTracking) {
        const timeSinceLastGpsData = Date.now() - this.lastGpsDataTime;
        const timeSinceLastUpdate = Date.now() - this.lastUpdateTime;

        // Only use backup if:
        // 1. We haven't received ANY GPS data for 10+ seconds (watchPosition likely failed)
        // 2. We haven't saved to database for 5+ seconds
        // 3. No request is already in progress
        if (timeSinceLastGpsData > 10000 && timeSinceLastUpdate >= this.updateInterval && !this.isGettingPosition) {
          this.getCurrentPosition();
        }
      }
    }, 2000); // Check every 2 seconds

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
    this.bestAccuracy = null;
  }

  /**
   * Get current GPS position with high accuracy
   */
  getCurrentPosition() {
    if (this.isGettingPosition) {
      console.log('⚠️ GPS request already in progress, skipping');
      return;
    }

    const options = {
      enableHighAccuracy: true, // Force high accuracy
      timeout: 10000, // Wait up to 10 seconds
      maximumAge: 60000 // Allow cached positions up to 1 minute old
    };

    const startTime = Date.now();
    this.isGettingPosition = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.isGettingPosition = false;
        this.handlePosition(position);
      },
      (error) => {
        this.isGettingPosition = false;
        this.handleError(error);
      },
      options
    );
  }

  /**
   * Handle GPS position updates with accuracy filtering
   */
  async handlePosition(position) {
    const currentTime = Date.now();
    this.lastGpsDataTime = currentTime; // Update GPS data timestamp

    const timeSinceLastUpdate = currentTime - this.lastUpdateTime;

    // Check if we have good accuracy (<= 10m)
    const hasGoodAccuracy = position.coords.accuracy <= this.accuracyThreshold;

    // Update best accuracy achieved
    if (this.bestAccuracy === null || position.coords.accuracy < this.bestAccuracy) {
      this.bestAccuracy = position.coords.accuracy;
    }

    // Progressive accuracy fallback system
    const timeWaiting = currentTime - this.accuracyWaitStart;
    const waitedTooLong = timeWaiting > this.maxWaitTime;
    const fallbackMode = timeWaiting > this.fallbackThreshold;
    const emergencyMode = timeWaiting > this.emergencyThreshold;

    // Determine if we should accept this accuracy level
    let shouldAccept = false;
    let reason = '';

    if (hasGoodAccuracy) {
      shouldAccept = true;
      reason = 'good accuracy';
    } else if (emergencyMode) {
      // Emergency mode: accept any accuracy under 100km
      if (position.coords.accuracy < 100000) {
        shouldAccept = true;
        reason = 'emergency mode (any accuracy under 100km)';
      }
    } else if (fallbackMode) {
      // Fallback mode: accept accuracy under 50km
      if (position.coords.accuracy < 50000) {
        shouldAccept = true;
        reason = 'fallback mode (accuracy under 50km)';
      }
    } else if (waitedTooLong) {
      // After initial wait, accept accuracy under 10km
      if (position.coords.accuracy < 10000) {
        shouldAccept = true;
        reason = 'waited too long (accuracy under 10km)';
      }
    }

    // Check throttling (5 second interval)
    if (this.lastUpdateTime > 0 && timeSinceLastUpdate < this.updateInterval && !shouldAccept) {
      return;
    }

    if (!shouldAccept) {
      return;
    }

    const { latitude, longitude } = position.coords;
    const timestamp = new Date().toISOString();
    const timeString = new Date().toLocaleTimeString();

    // Validate coordinates are reasonable (not 21km off)
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.error(`❌ Invalid coordinates: lat=${latitude}, lng=${longitude}`);
      return;
    }

    // Accuracy check is now handled by the progressive fallback system above


    try {
      // Use the backend API to save location
      const result = await locationAPI.saveLocation({
        tripId: this.tripData.trip_id,
        latitude: latitude,
        longitude: longitude,
        timestamp: timestamp,
        accuracy: position.coords.accuracy
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save location');
      }

      this.lastUpdateTime = currentTime;
      this.accuracyWaitStart = currentTime; // Reset wait timer

      // Call success callback if provided
      if (this.onLocationUpdate) {
        this.onLocationUpdate({
          latitude,
          longitude,
          timestamp,
          accuracy: position.coords.accuracy,
          data: result.data
        });
      }

    } catch (error) {
      console.error('Error saving location via API:', error);
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
        errorMessage = 'Location access denied by user. Please enable location permissions.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Please check your GPS settings.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timeout. Please try again or check your GPS signal.';
        break;
    }

    // Try fallback with lower accuracy if timeout
    if (error.code === error.TIMEOUT && this.isTracking) {
      this.tryFallbackGPS();
    } else {
      if (this.onError) this.onError(new Error(errorMessage));
    }
  }

  /**
   * Try fallback GPS with lower accuracy requirements
   */
  tryFallbackGPS() {
    const fallbackOptions = {
      enableHighAccuracy: false, // Use lower accuracy
      timeout: 10000, // Shorter timeout
      maximumAge: 300000 // Allow 5-minute old positions
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.handlePosition(position);
      },
      (error) => {
        if (this.onError) this.onError(new Error('GPS unavailable. Please check your location settings and try again.'));
      },
      fallbackOptions
    );
  }

  /**
   * Get current tracking status
   */
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      intervalId: this.intervalId,
      tripData: this.tripData,
      lastUpdateTime: this.lastUpdateTime,
      bestAccuracy: this.bestAccuracy
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
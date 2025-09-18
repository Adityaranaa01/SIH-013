import { locationAPI } from '../services/api.js';

class GeoTracker {
  constructor() {
    this.watchId = null;
    this.intervalId = null;
    this.updateInterval = 2000;
    this.isTracking = false;
    this.tripData = null;
    this.onLocationUpdate = null;
    this.onError = null;
    this.lastUpdateTime = 0;
    this.isGettingPosition = false;
    this.lastGpsDataTime = 0;
    this.bestAccuracy = null;
    this.accuracyThreshold = 100;
    this.maxWaitTime = 10000;
    this.fallbackThreshold = 30000;
    this.emergencyThreshold = 60000;
    this.accuracyWaitStart = 0;
  }

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

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionSuccess(position),
      (error) => this.handlePositionError(error),
      options
    );

    this.intervalId = setInterval(() => {
      if (this.isTracking && !this.isGettingPosition) {
        this.getCurrentPosition();
      }
    }, this.updateInterval);

    return true;
  }

  stopTracking() {
    this.isTracking = false;

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.tripData = null;
    this.onLocationUpdate = null;
    this.onError = null;
    this.lastUpdateTime = 0;
    this.isGettingPosition = false;
    this.bestAccuracy = null;
  }

  getCurrentPosition() {
    if (this.isGettingPosition || !this.isTracking) return;

    this.isGettingPosition = true;

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000
    };

    navigator.geolocation.getCurrentPosition(
      (position) => this.handlePositionSuccess(position),
      (error) => this.handlePositionError(error),
      options
    );
  }

  handlePositionSuccess(position) {
    this.isGettingPosition = false;
    this.lastGpsDataTime = Date.now();

    const { latitude, longitude, accuracy, timestamp } = position.coords;

    if (accuracy === null || accuracy === undefined) {
      console.warn('GPS accuracy is null/undefined, using fallback value');
      this.processLocationUpdate(latitude, longitude, 1000, timestamp);
      return;
    }

    if (this.bestAccuracy === null || accuracy < this.bestAccuracy) {
      this.bestAccuracy = accuracy;
    }

    const timeWaiting = Date.now() - this.accuracyWaitStart;
    const shouldAccept = this.shouldAcceptAccuracy(accuracy, timeWaiting);

    if (shouldAccept) {
      this.processLocationUpdate(latitude, longitude, accuracy, timestamp);
    } else {
      console.log(`GPS accuracy ${accuracy}m not good enough yet, waiting for better fix...`);
    }
  }

  shouldAcceptAccuracy(accuracy, timeWaiting) {
    if (accuracy <= this.accuracyThreshold) {
      return true;
    }

    if (timeWaiting >= this.maxWaitTime && accuracy <= 1000) {
      return true;
    }

    if (timeWaiting >= this.fallbackThreshold && accuracy <= 50000) {
      return true;
    }

    if (timeWaiting >= this.emergencyThreshold && accuracy <= 100000) {
      return true;
    }

    return false;
  }

  processLocationUpdate(latitude, longitude, accuracy, timestamp) {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;

    if (timeSinceLastUpdate < 1000) {
      return;
    }

    this.lastUpdateTime = now;

    const locationData = {
      latitude,
      longitude,
      accuracy,
      timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
    };

    if (this.onLocationUpdate) {
      this.onLocationUpdate(locationData);
    }

    this.saveLocationToAPI(locationData);
  }

  async saveLocationToAPI(locationData) {
    if (!this.tripData || !this.tripData.trip_id) {
      console.warn('No trip data available for saving location');
      return;
    }

    try {
      const result = await locationAPI.saveLocation({
        tripId: this.tripData.trip_id,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        timestamp: locationData.timestamp
      });

      if (result.success) {
        console.log('Location saved to API successfully');
      } else {
        console.error('Failed to save location to API:', result.error);
      }
    } catch (error) {
      console.error('Error saving location to API:', error);
    }
  }

  handlePositionError(error) {
    this.isGettingPosition = false;

    let errorMessage = 'Unknown GPS error';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location access denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
      default:
        errorMessage = `GPS error: ${error.message}`;
        break;
    }

    console.error('GPS Error:', errorMessage);

    if (this.onError) {
      this.onError(new Error(errorMessage));
    }
  }

  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      lastUpdateTime: this.lastUpdateTime,
      bestAccuracy: this.bestAccuracy,
      isGettingPosition: this.isGettingPosition
    };
  }

  getLastGpsDataTime() {
    return this.lastGpsDataTime;
  }

  isGpsDataStale(maxAge = 30000) {
    if (this.lastGpsDataTime === 0) return true;
    return (Date.now() - this.lastGpsDataTime) > maxAge;
  }
}

export const geoTracker = new GeoTracker();
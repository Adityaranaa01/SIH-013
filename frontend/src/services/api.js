// src/services/api.js
/**
 * API service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login driver with credentials
   */
  login: async (driverId, busNumber) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ driverId, busNumber }),
    });
  },

  /**
   * Get driver information
   */
  getDriver: async (driverId) => {
    return apiRequest(`/auth/driver/${driverId}`);
  },
};

/**
 * Trip management API
 */
export const tripAPI = {
  /**
   * Get active trip for driver
   */
  getActiveTrip: async (driverId) => {
    return apiRequest(`/trips/active/${driverId}`);
  },

  /**
   * Start a new trip
   */
  startTrip: async (driverId, busNumber) => {
    return apiRequest('/trips/start', {
      method: 'POST',
      body: JSON.stringify({ driverId, busNumber }),
    });
  },

  /**
   * End an active trip
   */
  endTrip: async (tripId) => {
    return apiRequest('/trips/end', {
      method: 'POST',
      body: JSON.stringify({ tripId }),
    });
  },

  /**
   * Get trip details
   */
  getTripById: async (tripId) => {
    return apiRequest(`/trips/${tripId}`);
  },
};

/**
 * Location tracking API
 */
export const locationAPI = {
  /**
   * Save GPS location
   */
  saveLocation: async (locationData) => {
    return apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  /**
   * Get location history for trip
   */
  getLocationHistory: async (tripId, limit = 50) => {
    return apiRequest(`/locations/trip/${tripId}?limit=${limit}`);
  },

  /**
   * Get latest location for trip
   */
  getLatestLocation: async (tripId) => {
    return apiRequest(`/locations/latest/${tripId}`);
  },

  /**
   * Get all active locations
   */
  getActiveLocations: async () => {
    return apiRequest('/locations/active');
  },
};

/**
 * Health check API
 */
export const healthAPI = {
  /**
   * Check backend health
   */
  check: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: 'Backend not reachable' };
    }
  },
};
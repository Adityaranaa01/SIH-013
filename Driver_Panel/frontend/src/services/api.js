const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

export const authAPI = {
  login: async (driverId, busNumber) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ driverId, busNumber }),
    });
  },

  getDriver: async (driverId) => {
    return apiRequest(`/auth/driver/${driverId}`);
  },

  logout: async (driverId, busNumber) => {
    return apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ driverId, busNumber }),
    });
  },
};

export const tripAPI = {
  getActiveTrip: async (driverId) => {
    return apiRequest(`/trips/active/${driverId}`);
  },

  startTrip: async (driverId, busNumber) => {
    return apiRequest('/trips/start', {
      method: 'POST',
      body: JSON.stringify({ driverId, busNumber }),
    });
  },

  endTrip: async (tripId) => {
    return apiRequest('/trips/end', {
      method: 'POST',
      body: JSON.stringify({ tripId }),
    });
  },

  getTrip: async (tripId) => {
    return apiRequest(`/trips/${tripId}`);
  },
};

export const locationAPI = {
  saveLocation: async (locationData) => {
    return apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  },

  getActiveLocations: async () => {
    return apiRequest('/locations/active');
  },

  getLocationHistory: async (tripId, limit = 50) => {
    return apiRequest(`/locations/trip/${tripId}?limit=${limit}`);
  },

  getLatestLocation: async (tripId) => {
    return apiRequest(`/locations/latest/${tripId}`);
  },

  getLatestByBus: async (busNumber) => {
    return apiRequest(`/locations/latest-by-bus/${busNumber}`);
  },
};

export const adminAPI = {
  login: async (username, password) => {
    return apiRequest('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  getStats: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getRoutes: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/routes', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getActiveRoutes: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/routes/active', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getRoutesWithStops: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/routes/with-stops', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  createRoute: async (routeData) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/routes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(routeData),
    });
  },

  updateRoute: async (routeId, updateData) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest(`/admin/routes/${routeId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
  },

  deleteRoute: async (routeId) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest(`/admin/routes/${routeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getDrivers: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/drivers', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  assignDriverToRoute: async (driverId, routeId) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest(`/admin/drivers/${driverId}/assign-route`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ routeId }),
    });
  },

  getBuses: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/buses', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  createBus: async (busData) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/buses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(busData),
    });
  },

  updateBus: async (busNumber, updateData) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest(`/admin/buses/${busNumber}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
  },

  deleteBus: async (busNumber) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest(`/admin/buses/${busNumber}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  assignBusToRoute: async (busNumber, routeId) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest(`/admin/buses/${busNumber}/assign-route`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ route_id: routeId }),
    });
  },

  getActiveTrips: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/trips/active', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getRecentLocationUpdates: async () => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/locations/recent', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  updateProfile: async (profileData) => {
    const token = localStorage.getItem('adminToken');
    return apiRequest('/admin/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  },
};

export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      return { success: false, error: error.message };
    }
  },
};
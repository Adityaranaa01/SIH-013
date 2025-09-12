// src/pages/Trip.jsx
import React, { useState, useEffect } from 'react';
import { useDriver } from '../context/DriverContext';
import { geoTracker } from '../utils/geo';

const Trip = () => {
  const { driver } = useDriver();
  const [tripId, setTripId] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Not tracking');
  const [error, setError] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [nextUpdateIn, setNextUpdateIn] = useState(0);

  // Timer to show countdown to next update
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const trackerStatus = geoTracker.getTrackingStatus();
      if (trackerStatus.isTracking && trackerStatus.lastUpdateTime) {
        const timeSinceLastUpdate = Date.now() - trackerStatus.lastUpdateTime;
        const timeToNextUpdate = Math.max(0, 5000 - timeSinceLastUpdate);
        setNextUpdateIn(Math.ceil(timeToNextUpdate / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Check for any active trips on component mount
  useEffect(() => {
    checkActiveTrip();
  }, [driver.driverId]);

  // Cleanup GPS tracking on component unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        geoTracker.stopTracking();
      }
    };
  }, [isActive]);

  /**
   * Check if there's already an active trip for this driver
   */
  const checkActiveTrip = async () => {
    if (!driver.driverId) return;

    try {
      // Import supabase dynamically to avoid initialization errors
      const { supabase } = await import('../config/supabase');
      
      if (!supabase) {
        console.warn('Supabase not configured - active trip check skipped');
        return;
      }

      const { data, error } = await supabase
        .from('trips')
        .select('trip_id, status')  // Fixed: was 'id', now 'trip_id' to match schema
        .eq('driver_id', driver.driverId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setTripId(data.trip_id);  // Fixed: was 'data.id', now 'data.trip_id' to match schema
        setIsActive(true);
        setLocationStatus('Trip already active - GPS not tracking');
        console.log('Found active trip:', data.trip_id);  // Fixed: was 'data.id', now 'data.trip_id'
      }
    } catch (err) {
      console.error('Error checking for active trip:', err);
      setError('Failed to check for active trips');
    }
  };

  /**
   * Start a new trip
   */
  const startTrip = async () => {
    if (!driver.driverId || !driver.busNumber) {
      setError('Driver ID and Bus Number are required');
      return;
    }

    setError(null);

    try {
      // Import supabase dynamically
      const { supabase } = await import('../config/supabase');
      
      if (!supabase) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      // Insert new trip record
      const { data, error } = await supabase
        .from('trips')
        .insert({
          driver_id: driver.driverId,
          bus_number: driver.busNumber,
          status: 'active',
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newTripId = data.trip_id;  // Fixed: was 'data.id', now 'data.trip_id' to match schema
      setTripId(newTripId);
      setIsActive(true);

      console.log('Trip started with ID:', newTripId);

      // Start GPS tracking
      const trackingStarted = geoTracker.startTracking(
        {
          trip_id: newTripId,
          driver_id: driver.driverId,
          bus_number: driver.busNumber
        },
        handleLocationUpdate,
        handleLocationError
      );

      if (trackingStarted) {
        setLocationStatus('GPS tracking active');
      } else {
        setLocationStatus('GPS tracking failed to start');
      }

    } catch (err) {
      console.error('Error starting trip:', err);
      setError(`Failed to start trip: ${err.message}`);
    }
  };

  /**
   * End the current trip
   */
  const endTrip = async () => {
    if (!tripId) {
      setError('No active trip to end');
      return;
    }

    setError(null);

    try {
      // Stop GPS tracking first
      geoTracker.stopTracking();
      setLocationStatus('GPS tracking stopped');

      // Import supabase dynamically
      const { supabase } = await import('../config/supabase');
      
      if (!supabase) {
        throw new Error('Supabase not configured. Please check your environment variables.');
      }

      // Update trip record with end time and status
      const { data, error } = await supabase
        .from('trips')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('trip_id', tripId)  // Fixed: was 'id', now 'trip_id' to match schema
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Trip ended:', data);

      // Reset state
      setTripId(null);
      setIsActive(false);
      setLocationStatus('Not tracking');
      setLastLocation(null);

    } catch (err) {
      console.error('Error ending trip:', err);
      setError(`Failed to end trip: ${err.message}`);
    }
  };

  /**
   * Handle successful location updates
   */
  const handleLocationUpdate = (locationData) => {
    setUpdateCount(prev => prev + 1);
    setLastLocation({
      lat: locationData.latitude,
      lng: locationData.longitude,
      timestamp: locationData.timestamp
    });
    setLocationStatus(`GPS tracking active - Update #${updateCount + 1}`);
    console.log(`🎯 Location update #${updateCount + 1} received in Trip component`);
  };

  /**
   * Handle location tracking errors
   */
  const handleLocationError = (error) => {
    console.error('Location error:', error);
    setError(`Location error: ${error.message}`);
    setLocationStatus('GPS tracking error');
  };

  // Don't render if driver is not authenticated
  if (!driver.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p>Please log in to access the trip management page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Trip Management
        </h1>

        {/* Driver Information */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Driver Info</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Driver ID:</span>
              <span className="font-medium">{driver.driverId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bus Number:</span>
              <span className="font-medium">{driver.busNumber}</span>
            </div>
          </div>
        </div>

        {/* Trip Status */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Trip Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {tripId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Trip ID:</span>
                <span className="font-medium">{tripId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">GPS:</span>
              <span className={`font-medium text-sm ${
                locationStatus.includes('active') ? 'text-green-600' : 
                locationStatus.includes('error') ? 'text-red-600' : 'text-gray-600'
              }`}>
                {locationStatus}
              </span>
            </div>
            {isActive && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updates:</span>
                  <span className="font-medium text-green-600">{updateCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next update:</span>
                  <span className="font-medium text-blue-600">
                    {nextUpdateIn > 0 ? `${nextUpdateIn}s` : 'Any moment...'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Last Location */}
        {lastLocation && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Last Location</h2>
            <div className="space-y-1 text-sm">
              <div>Lat: {lastLocation.lat.toFixed(6)}</div>
              <div>Lng: {lastLocation.lng.toFixed(6)}</div>
              <div>Time: {new Date(lastLocation.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {!isActive ? (
            <button
              onClick={startTrip}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Start Trip
            </button>
          ) : (
            <button
              onClick={endTrip}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              End Trip
            </button>
          )}
        </div>

        {/* GPS Info */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> GPS tracking sends location updates every 5 seconds when a trip is active. 
            Make sure to allow location access when prompted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Trip;
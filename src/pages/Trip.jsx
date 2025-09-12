import React from 'react';
import { useDriver } from '../context/DriverContext';
import { useNavigate } from 'react-router-dom';

const Trip = () => {
  const { driver, logout } = useDriver();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Trip Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Logout
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Driver Information</h2>
            <div className="space-y-2">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Driver ID:</span> {driver.driverId}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Bus Number:</span> {driver.busNumber}
              </p>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Status</h3>
            <p className="text-sm text-green-800">Ready for trip</p>
          </div>
          
          <div className="space-y-3 mt-6">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Start Trip
            </button>
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              View Schedule
            </button>
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
              Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trip;
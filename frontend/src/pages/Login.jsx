import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriver } from '../context/DriverContext';
import { authAPI, healthAPI } from '../services/api';

const Login = () => {
  console.log('Login component rendering...');
  
  const navigate = useNavigate();
  const { login } = useDriver();
  const [formData, setFormData] = useState({
    driverId: '',
    busNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check backend health on component mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const health = await healthAPI.check();
      setBackendStatus(health.success ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('disconnected');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // If backend is not available, use demo mode
      if (backendStatus !== 'connected') {
        console.log('Demo mode: Backend not available');
        if (formData.driverId.trim() && formData.busNumber.trim()) {
          login(formData.driverId, formData.busNumber);
          navigate('/trip');
          return;
        } else {
          setError('Please enter both driver ID and bus number.');
          setLoading(false);
          return;
        }
      }

      // Use backend API for authentication
      const result = await authAPI.login(formData.driverId, formData.busNumber);

      if (!result.success) {
        setError(result.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // If authentication successful, login and navigate
      login(formData.driverId, formData.busNumber);
      navigate('/trip');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Driver Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access the driver portal
          </p>
          {backendStatus === 'checking' && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Checking backend connection...</strong>
              </p>
            </div>
          )}
          {backendStatus === 'disconnected' && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> Backend not available. Any driver ID and bus number will work for testing.
              </p>
            </div>
          )}
          {backendStatus === 'connected' && (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Backend Connected:</strong> Full functionality available.
              </p>
            </div>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
                Driver ID
              </label>
              <input
                id="driverId"
                name="driverId"
                type="text"
                required
                value={formData.driverId}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your driver ID"
              />
            </div>
            
            <div>
              <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Bus Number
              </label>
              <input
                id="busNumber"
                name="busNumber"
                type="text"
                required
                value={formData.busNumber}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your bus number"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !formData.driverId || !formData.busNumber}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
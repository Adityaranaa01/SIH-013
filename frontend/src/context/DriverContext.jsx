import React, { createContext, useContext, useState, useEffect } from 'react';

const DriverContext = createContext();

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (!context) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};

export const DriverProvider = ({ children }) => {
  const [driver, setDriver] = useState({
    driverId: null,
    busNumber: null,
    isAuthenticated: false
  });

  // Load driver data from localStorage on component mount
  useEffect(() => {
    const savedDriverId = localStorage.getItem('driver_id');
    const savedBusNumber = localStorage.getItem('bus_number');
    
    if (savedDriverId && savedBusNumber) {
      setDriver({
        driverId: savedDriverId,
        busNumber: savedBusNumber,
        isAuthenticated: true
      });
    }
  }, []);

  const login = (driverId, busNumber) => {
    const driverData = {
      driverId,
      busNumber,
      isAuthenticated: true
    };
    
    setDriver(driverData);
    localStorage.setItem('driver_id', driverId);
    localStorage.setItem('bus_number', busNumber);
  };

  const logout = () => {
    setDriver({
      driverId: null,
      busNumber: null,
      isAuthenticated: false
    });
    localStorage.removeItem('driver_id');
    localStorage.removeItem('bus_number');
  };

  const value = {
    driver,
    login,
    logout
  };

  return (
    <DriverContext.Provider value={value}>
      {children}
    </DriverContext.Provider>
  );
};
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DriverProvider, useDriver } from './context/DriverContext';
import Login from './pages/Login';
import Trip from './pages/Trip';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { driver } = useDriver();
  return driver.isAuthenticated ? children : <Navigate to="/login" replace />;
};

// App content with routing
const AppContent = () => {
  console.log('AppContent rendering...');
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/trip" 
          element={
            <ProtectedRoute>
              <Trip />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  console.log('App component rendering...');
  
  return (
    <DriverProvider>
      <AppContent />
    </DriverProvider>
  );
}

export default App

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { DriverProvider, useDriver } from './context/DriverContext';
import Login from './pages/Login';
import Trip from './pages/Trip';
import './App.css';
import './index.css';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { ArrowLeft, Bus } from 'lucide-react';
import { Button } from './components/ui/Button';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { driver } = useDriver();
  return driver.isAuthenticated ? children : <Navigate to="/login" replace />;
};

function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.pathname !== '/login';
  return (
    <div className="max-h-screen header-bar bg-card">
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Button variant="ghost" className="p-2" onClick={() => navigate(-1)} aria-label="Back" disabled={!canGoBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-logo">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Driver Dashboard</div>
            <div className="text-sm text-muted-foreground">GPS Location Tracking</div>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

// App content with routing
const AppContent = () => {
  return (
    <Router>
      <HeaderBar />
      <div className="h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6">
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
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="smarttransit-theme">
      <DriverProvider>
        <AppContent />
      </DriverProvider>
    </ThemeProvider>
  );
}

export default App

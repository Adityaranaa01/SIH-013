import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { DriverProvider, useDriver } from './context/DriverContext';
import Login from './pages/Login';
import Trip from './pages/Trip';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardNew from './pages/AdminDashboardNew';
import './App.css';
import './index.css';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { ThemeToggle } from './components/theme/ThemeToggle';
import { ToastProvider } from './components/ui/Toast';
import { ArrowLeft, Bus, Shield } from 'lucide-react';
import { Button } from './components/ui/Button';

const ProtectedRoute = ({ children }) => {
  const { driver } = useDriver();
  return driver.isAuthenticated ? children : <Navigate to="/login" replace />;
};

function HeaderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.pathname !== '/login' && !location.pathname.startsWith('/admin');
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return (
    <div className="max-h-screen header-bar bg-card">
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Button variant="ghost" className="p-2" onClick={() => navigate(-1)} aria-label="Back" disabled={!canGoBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-logo">
            {isAdminPage ? <Shield className="w-6 h-6 text-white" /> : <Bus className="w-6 h-6 text-white" />}
          </div>
          <div>
            <div className="text-xl font-bold">
              {isAdminPage ? 'BMTC Admin Panel' : 'Driver Dashboard'}
            </div>
            <div className="text-sm text-muted-foreground">
              {isAdminPage ? 'Route & Bus Management' : 'GPS Location Tracking'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isAdminPage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/login')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" replace />;
};

const DynamicTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/admin/login')) {
      document.title = 'Admin Login - BMTC Admin Panel';
    } else if (path.startsWith('/admin/dashboard')) {
      document.title = 'BMTC Admin Panel - Dashboard';
    } else if (path.startsWith('/admin')) {
      document.title = 'BMTC Admin Panel';
    } else if (path === '/trip') {
      document.title = 'Driver Dashboard - BMTC';
    } else if (path === '/login') {
      document.title = 'Driver Login - BMTC';
    } else {
      document.title = 'BMTC Transport System';
    }
  }, [location.pathname]);

  return null;
};

const AppContent = () => {
  return (
    <Router>
      <DynamicTitle />
      <HeaderBar />
      <div className="h-screen bg-background text-foreground">
        <Routes>
          <Route path="/login" element={
            <div className="max-w-4xl mx-auto px-6">
              <Login />
            </div>
          } />
          <Route
            path="/trip"
            element={
              <div className="max-w-4xl mx-auto px-6">
                <ProtectedRoute>
                  <Trip />
                </ProtectedRoute>
              </div>
            }
          />
          <Route path="/admin/login" element={
            <div className="max-w-4xl mx-auto px-6">
              <AdminLogin />
            </div>
          } />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboardNew />
              </AdminProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="safarsaathi-theme">
      <ToastProvider>
        <DriverProvider>
          <AppContent />
        </DriverProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App

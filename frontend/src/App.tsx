import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './components/DashboardOverview';
import { RoutesPage } from './components/RoutesPage';
import { BusesPage } from './components/BusesPage';
import { AddDriverPage } from './components/AddDriverPage';
import { TrackingPage } from './components/TrackingPage';
import { RouteDetails } from './components/RouteDetails';
import { Toaster } from './components/ui/sonner';
import { AuthAPI } from './lib/api';

type Page = 'dashboard' | 'routes' | 'buses' | 'tracking' | 'route-details' | 'add-driver';

interface Admin {
  id: string;
  name: string;
}

interface RouteDetailsState {
  routeId: string | null;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize from localStorage or system preference
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });
  const [routeDetails, setRouteDetails] = useState<RouteDetailsState>({ routeId: null });

  // Attempt session restore on load
  useEffect(() => {
    AuthAPI.me().then((admin) => {
      setCurrentAdmin(admin);
      setIsAuthenticated(true);
    }).catch(() => {
      // not logged in; ignore
    });
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const handleLogin = (admin: Admin) => {
    setCurrentAdmin(admin);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // best-effort logout
    AuthAPI.logout().catch(() => {});
    setCurrentAdmin(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleViewRoute = (routeId: string) => {
    setRouteDetails({ routeId });
    setCurrentPage('route-details');
  };

  const handleCreateRoute = () => {
    setCurrentPage('routes');
  };

  const handleViewTracking = () => {
    setCurrentPage('tracking');
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} theme={theme} onThemeToggle={toggleTheme} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'card-elevated',
          }}
        />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardOverview 
          onCreateRoute={handleCreateRoute}
          onViewTracking={handleViewTracking}
          currentAdmin={currentAdmin}
        />;
      case 'routes':
        return <RoutesPage onViewRoute={handleViewRoute} />;
      case 'buses':
        return <BusesPage />;
      case 'tracking':
        return <TrackingPage />;
      case 'route-details':
        return <RouteDetails 
          routeId={routeDetails.routeId} 
          onBack={() => setCurrentPage('routes')}
        />;
      case 'add-driver':
        return <AddDriverPage />;
      default:
        return <DashboardOverview 
          onCreateRoute={handleCreateRoute}
          onViewTracking={handleViewTracking}
          currentAdmin={currentAdmin}
        />;
    }
  };

  return (
    <>
      <DashboardLayout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        currentAdmin={currentAdmin}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={toggleTheme}
      >
        {renderPage()}
      </DashboardLayout>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'card-elevated',
        }}
      />
    </>
  );
}
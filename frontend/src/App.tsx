import { useState, useEffect, useCallback } from 'react'
import { LoginPage } from './components/LoginPage'
import { DashboardLayout } from './components/DashboardLayout'
import { DashboardOverview } from './components/DashboardOverview'
import { RoutesPage } from './components/RoutesPage'
import { BusesPage } from './components/BusesPage'
import { AddDriverPage } from './components/AddDriverPage'
import { TrackingPage } from './components/TrackingPage'
import { RouteDetails } from './components/RouteDetails'
import { Toaster } from './components/ui/sonner'
import { AuthAPI } from './lib/api'

type Page = 'dashboard' | 'routes' | 'buses' | 'tracking' | 'route-details' | 'add-driver'

interface Admin {
  id: string
  name: string
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [routeDetails, setRouteDetails] = useState<{ routeId: string | null }>({ routeId: null })

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') return stored
    } catch {}
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    AuthAPI.me()
      .then((admin) => {
        setCurrentAdmin(admin)
        setIsAuthenticated(true)
      })
      .catch(() => {
        setCurrentAdmin(null)
      })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  const handleLogin = useCallback((admin: Admin) => {
    setCurrentAdmin(admin)
    setIsAuthenticated(true)
  }, [])

  const handleLogout = useCallback(() => {
    AuthAPI.logout().catch(() => {})
    setCurrentAdmin(null)
    setIsAuthenticated(false)
    setCurrentPage('dashboard')
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const handleViewRoute = useCallback((routeId: string) => {
    setRouteDetails({ routeId })
    setCurrentPage('route-details')
  }, [])

  const handleCreateRoute = useCallback(() => {
    setCurrentPage('routes')
  }, [])

  const handleViewTracking = useCallback(() => {
    setCurrentPage('tracking')
  }, [])

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
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardOverview
            currentAdmin={currentAdmin!}
            onCreateRoute={handleCreateRoute}
            onViewTracking={handleViewTracking}
          />
        )
      case 'routes':
        return <RoutesPage onViewRoute={handleViewRoute} />
      case 'buses':
        return <BusesPage />
      case 'tracking':
        return <TrackingPage />
      case 'route-details':
        return (
          <RouteDetails
            routeId={routeDetails.routeId}
            onBack={() => setCurrentPage('routes')}
          />
        )
      case 'add-driver':
        return <AddDriverPage />
      default:
        return (
          <DashboardOverview
            currentAdmin={currentAdmin!}
            onCreateRoute={handleCreateRoute}
            onViewTracking={handleViewTracking}
          />
        )
    }
  }

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
        {renderCurrentPage()}
      </DashboardLayout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className: 'card-elevated',
        }}
      />
    </>
  )
}

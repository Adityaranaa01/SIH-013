import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { DriverPage } from "./components/DriverPage";
import "leaflet/dist/leaflet.css";

type AppState = "landing" | "user" | "driver";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [appState, setAppState] = useState<AppState>("landing");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/user" || path === "/dashboard") {
      setAppState("user");
    } else if (path === "/driver") {
      setAppState("driver");
    } else {
      setAppState("landing");
    }
  }, [location.pathname]);

  const handleStateChange = (newState: AppState) => {
    setAppState(newState);
    if (newState === "user") {
      navigate("/user");
    } else if (newState === "driver") {
      navigate("/driver");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route
          path="/"
          element={
            <LandingPage
              onUserSelect={() => handleStateChange("user")}
              onDriverSelect={() => handleStateChange("driver")}
            />
          }
        />
        <Route
          path="/user"
          element={<Dashboard onBack={() => handleStateChange("landing")} />}
        />
        <Route
          path="/driver"
          element={<DriverPage onBack={() => handleStateChange("landing")} />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard onBack={() => handleStateChange("landing")} />}
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="safarsaathi-theme">
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

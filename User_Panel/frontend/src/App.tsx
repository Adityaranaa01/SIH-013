import { useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { DriverPage } from "./components/DriverPage";
import 'leaflet/dist/leaflet.css';

type AppState = "landing" | "user" | "driver";

export default function App() {
  const [appState, setAppState] = useState<AppState>("landing");

  const renderCurrentPage = () => {
    switch (appState) {
      case "user":
        return <Dashboard onBack={() => setAppState("landing")} />;
      case "driver":
        return <DriverPage onBack={() => setAppState("landing")} />;
      default:
        return (
          <LandingPage 
            onUserSelect={() => setAppState("user")} 
            onDriverSelect={() => setAppState("driver")} 
          />
        );
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="smarttransit-theme">
      <div className="min-h-screen bg-background text-foreground">
        {renderCurrentPage()}
      </div>
    </ThemeProvider>
  );
}
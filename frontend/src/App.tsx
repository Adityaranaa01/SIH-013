import { ThemeProvider } from "./components/ThemeProvider";
import { LandingPage } from "./components/LandingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./user/Dashboard";
import { DriverPage } from "./driver/DriverPage";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="smarttransit-theme">
      <div className="min-h-screen bg-background text-foreground">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/user" element={<Dashboard />} />
            <Route path="/driver" element={<DriverPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ThemeToggle } from "./ThemeToggle";
import { Users, Bus, MapPin } from "lucide-react";

interface LandingPageProps {
  onUserSelect: () => void;
  onDriverSelect: () => void;
}

export function LandingPage({
  onUserSelect,
  onDriverSelect,
}: LandingPageProps) {
  const handleDriverSelect = () => {
    // Open driver panel in new tab
    window.open("http://localhost:3001", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SmartTransit
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time Bus Tracking
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6">
        <div className="text-center mb-12 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Next-Gen Bus Tracking
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Experience the future of public transportation with real-time GPS
            tracking and precise ETAs.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
          <Card
            className="group hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer"
            onClick={onUserSelect}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">I'm a Passenger</CardTitle>
              <CardDescription className="text-base">
                Track buses, check ETAs, and plan your journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Access Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card
            className="group hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer"
            onClick={handleDriverSelect}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bus className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">I'm a Driver</CardTitle>
              <CardDescription className="text-base">
                Enable GPS tracking and broadcast your location
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Start Tracking
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

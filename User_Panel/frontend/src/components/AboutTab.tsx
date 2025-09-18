import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Info,
  Target,
  Zap,
  MapPin,
  Clock,
  Users,
  Smartphone,
  Lightbulb,
  GraduationCap,
} from "lucide-react";

export function AboutTab() {
  const features = [
    {
      icon: MapPin,
      title: "Real-time GPS Tracking",
      description:
        "Live bus locations updated every 5 seconds using driver's GPS coordinates",
    },
    {
      icon: Clock,
      title: "Precise ETA Calculations",
      description:
        "Accurate arrival time predictions based on current location and traffic conditions",
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description:
        "Optimized for all devices with mobile-first approach and low bandwidth usage",
    },
    {
      icon: Zap,
      title: "Dark Mode Support",
      description: "Modern UI with seamless light/dark theme switching",
    },
  ];

  const futureScope = [
    "Dedicated driver mobile app with route management",
    "Admin dashboard with analytics and performance metrics",
    "Digital ticketing system with QR code integration",
    "Predictive ETA using machine learning algorithms",
    "Push notifications for bus arrivals and delays",
    "Integration with city traffic management systems",
  ];

  const teamMembers = ["SB", "SR", "SY", "AR", "SD", "PS"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Info className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">About SmartTransit</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A next-generation public transport tracking system designed for Smart
          India Hackathon 2025, addressing the challenges of small city
          transportation with cutting-edge technology.
        </p>
      </div>

      {/* Problem Statement */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Problem Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            <strong>Smart India Hackathon 2025:</strong> Small City Real-time
            Public Transport Tracking System
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Many small cities lack efficient public transportation tracking
            systems, leading to passenger frustration, wasted time, and reduced
            adoption of public transport. Our solution provides real-time bus
            tracking, accurate ETAs, and occupancy information to make public
            transportation more reliable and user-friendly in smaller urban
            areas.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
          <CardDescription>
            Technologies and capabilities that make SmartTransit unique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Scope */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Future Scope & Enhancements
          </CardTitle>
          <CardDescription>
            Planned features for the next phase of development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {futureScope.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg"
              >
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Credits */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Team Credits
          </CardTitle>
          <CardDescription>
            Smart India Hackathon 2025 Team Members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((member, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 text-sm"
              >
                {member}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>
            Technologies and architecture powering SmartTransit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Frontend Technologies</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">React.js</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Tailwind CSS</Badge>
                <Badge variant="secondary">Shadcn/ui</Badge>
                <Badge variant="secondary">Leaflet.js</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Core Features</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Geolocation API</Badge>
                <Badge variant="secondary">Real-time Updates</Badge>
                <Badge variant="secondary">Responsive Design</Badge>
                <Badge variant="secondary">Dark Mode</Badge>
                <Badge variant="secondary">Progressive Web App</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Optimization</h4>
              <p className="text-sm text-muted-foreground">
                Designed for low bandwidth environments with optimized assets,
                efficient caching, and minimal data usage. Perfect for small
                cities with limited internet infrastructure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

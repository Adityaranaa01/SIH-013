import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface HomeSectionProps {
  onSectionChange: (section: string) => void;
}

export function HomeSection({ onSectionChange }: HomeSectionProps) {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl mb-6 text-gray-900">
          Welcome to Real-time Public Transport Tracking System
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Track buses, trains, and other public transport in real-time for small cities. 
          Never miss your ride again with accurate arrival times and live location updates.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => onSectionChange("map")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Live Map
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onSectionChange("tracking")}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Start Tracking
          </Button>
        </div>
      </section>

      {/* Map Placeholder Section */}
      <section className="py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl mb-4 text-gray-900">Live Transport Map</h2>
          <p className="text-gray-600">Real-time locations of all public transport vehicles in your city</p>
        </div>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-8 md:p-16">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg mb-2 text-gray-900">Interactive Map Coming Soon</h3>
                <p className="text-gray-500">Live transport tracking will be displayed here</p>
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onSectionChange("map")}
                >
                  View Full Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl mb-4 text-gray-900">How It Works</h2>
          <p className="text-gray-600">Get started in three simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-medium text-blue-600">1</span>
            </div>
            <h3 className="text-lg mb-3 text-gray-900">Select City</h3>
            <p className="text-gray-600">
              Choose your city from the list of supported locations to access local transport data
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-medium text-blue-600">2</span>
            </div>
            <h3 className="text-lg mb-3 text-gray-900">Choose Transport</h3>
            <p className="text-gray-600">
              Pick the type of public transport you want to track - buses, trains, or metros
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-medium text-blue-600">3</span>
            </div>
            <h3 className="text-lg mb-3 text-gray-900">See Location</h3>
            <p className="text-gray-600">
              View real-time locations, arrival times, and route information on the live map
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            onClick={() => onSectionChange("tracking")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Start Tracking Now
          </Button>
        </div>
      </section>
    </div>
  );
}
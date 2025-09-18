import { Card, CardContent } from "../ui/card";

export function AboutSection() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12">
        <h1 className="text-3xl mb-6 text-gray-900">
          About Smart Transit System
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Empowering small cities with real-time public transport tracking
          technology to improve commuter experience and transportation
          efficiency.
        </p>
      </section>

      <section className="py-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl mb-6 text-gray-900">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To bridge the technology gap in small city public transportation
              by providing affordable, reliable, and user-friendly real-time
              tracking solutions.
            </p>
            <p className="text-gray-600">
              We believe every commuter, regardless of their city size, deserves
              access to modern transportation information systems that make
              daily travel more predictable and efficient.
            </p>
          </div>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-lg mb-4 text-gray-900">Key Benefits</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Reduce waiting time at stops
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Improve route planning
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Increase transport efficiency
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Better passenger experience
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl text-center mb-8 text-gray-900">
          Why Small Cities Need This
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg mb-3 text-gray-900">Limited Resources</h3>
              <p className="text-gray-600">
                Small cities often lack the budget for expensive transport
                management systems. Our solution is designed to be
                cost-effective and easy to implement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg mb-3 text-gray-900">Growing Population</h3>
              <p className="text-gray-600">
                As small cities expand, efficient public transport becomes
                crucial. Real-time tracking helps manage increasing passenger
                demand effectively.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg mb-3 text-gray-900">Digital Adoption</h3>
              <p className="text-gray-600">
                Citizens expect modern digital services. Providing real-time
                transport info helps cities meet these expectations and improve
                satisfaction.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-blue-50 rounded-lg text-center">
        <h2 className="text-2xl mb-4 text-gray-900">
          Smart India Hackathon 2025
        </h2>
        <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
          This project is developed for Smart India Hackathon 2025, focusing on
          solving real-world problems in small city public transportation
          through innovative technology solutions.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          <div>
            <div className="text-xl font-medium text-blue-600 mb-1">50+</div>
            <div className="text-sm text-gray-600">Small Cities</div>
          </div>
          <div>
            <div className="text-xl font-medium text-blue-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Live Tracking</div>
          </div>
          <div>
            <div className="text-xl font-medium text-blue-600 mb-1">99%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div>
            <div className="text-xl font-medium text-blue-600 mb-1">5sec</div>
            <div className="text-sm text-gray-600">Update Rate</div>
          </div>
        </div>
      </section>
    </div>
  );
}

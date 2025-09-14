import { Navigation as NavigationIcon, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <NavigationIcon className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-medium text-gray-900">SmartFleet</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Real-time public transport tracking system for small cities. 
              Making public transportation more reliable and accessible.
            </p>
            <p className="text-sm text-gray-500">
              Developed for Smart India Hackathon 2024
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                team.SmartFleet@gmail.com
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                IIT Mumbai, Maharashtra
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Live Map</div>
              <div className="text-sm text-gray-600">Track Vehicle</div>
              <div className="text-sm text-gray-600">About System</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 SmartFleet. Built for Smart India Hackathon.
            </p>
            <div className="flex gap-6">
              <span className="text-sm text-gray-500">Privacy Policy</span>
              <span className="text-sm text-gray-500">Terms of Service</span>
              <span className="text-sm text-gray-500">Documentation</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
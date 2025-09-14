import { Home, Map, Navigation as NavigationIcon, Info, Mail, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "map", label: "Map", icon: Map },
  { id: "tracking", label: "Live Tracking", icon: NavigationIcon },
  { id: "about", label: "About", icon: Info },
  { id: "contact", label: "Contact", icon: Mail },
];

export function Navigation({ currentSection, onSectionChange }: NavigationProps) {
  const NavItems = () => (
    <>
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-colors ${
              currentSection === item.id
                ? "bg-gray-200 text-gray-900"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <IconComponent className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex w-full bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <NavigationIcon className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-medium text-gray-900">SmartFleet</span>
            </div>
            <div className="flex items-center gap-2">
              <NavItems />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NavigationIcon className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-medium text-gray-900">SmartFleet</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-6 bg-white">
              <div className="flex flex-col gap-2">
                <div className="mb-6">
                  <div className="flex items-center gap-2">
                    <NavigationIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-medium text-gray-900">SmartFleet</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Public Transport Tracking</p>
                </div>
                <div className="flex flex-col gap-1">
                  <NavItems />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
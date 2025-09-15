import { ReactNode, useState } from 'react';
import { MetricsAPI, RoutesAPI, BusesAPI } from '../lib/api';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Bus, LayoutDashboard, Route, MapPin, LogOut, Moon, Sun, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type Page = 'dashboard' | 'routes' | 'buses' | 'tracking' | 'route-details';

interface Admin {
  id: string;
  name: string;
  email?: string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  currentAdmin: Admin | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const navigationItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'routes' as Page, label: 'Routes', icon: Route },
  { id: 'buses' as Page, label: 'Buses', icon: Bus },
  { id: 'tracking' as Page, label: 'Tracking', icon: MapPin },
];

export function DashboardLayout({
  children,
  currentPage,
  onPageChange,
  currentAdmin,
  onLogout,
  theme,
  onThemeToggle
}: DashboardLayoutProps) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    toast.success('Successfully logged out');
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="p-2 bg-gradient-primary rounded-xl">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gradient-primary">SmartTransit</h2>
                <p className="text-xs text-sidebar-foreground/70">Next-Gen Tracking</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={currentPage === item.id}
                    onClick={() => onPageChange(item.id)}
                    onMouseEnter={() => {
                      // Lightweight prefetch to warm cache and improve perceived perf
                      if (item.id === 'dashboard') {
                        MetricsAPI.get().catch(() => {})
                      } else if (item.id === 'routes') {
                        RoutesAPI.list().catch(() => {})
                      } else if (item.id === 'buses') {
                        BusesAPI.list().catch(() => {})
                      }
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback>
                        {currentAdmin?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">{currentAdmin?.name}</p>
                      <p className="text-xs text-muted-foreground">{currentAdmin?.id}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="border-b border-border floating-panel">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center">
                <SidebarTrigger />
                <div className="ml-4">
                  <h1 className="text-xl font-bold capitalize text-gradient-primary">{currentPage}</h1>
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-2">
                {/* Quick Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogoutClick}
                  className="h-9 px-3 hover:bg-muted/50 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
                
                {/* Theme Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onThemeToggle}
                  className="h-9 w-9 rounded-full p-0 hover:bg-muted/50 transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors" />
                  ) : (
                    <Sun className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You will need to enter your credentials again to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogoutCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogoutConfirm}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
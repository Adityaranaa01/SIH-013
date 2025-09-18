import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './theme/ThemeProvider';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger
} from './ui/Sidebar';
import { Button } from './ui/Button';
import AdminProfileForm from './AdminProfileForm';
import {
    LayoutDashboard,
    Route,
    Bus,
    MapPin,
    UserPlus,
    LogOut,
    Moon,
    Sun,
    Settings,
    User,
    ChevronDown,
    Edit,
    X
} from 'lucide-react';

const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'buses', label: 'Buses', icon: Bus },
    { id: 'tracking', label: 'Tracking', icon: MapPin },
    { id: 'add-driver', label: 'Add Driver', icon: UserPlus },
];

export function AdminLayout({ children, currentPage, onPageChange, currentAdmin, onLogout }) {
    const { theme, setTheme } = useTheme();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        setShowLogoutDialog(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutDialog(false);
        onLogout();
        navigate('/admin/login');
    };

    const handleLogoutCancel = () => {
        setShowLogoutDialog(false);
    };

    const handleProfileClick = () => {
        setShowProfileModal(true);
        setShowProfileDropdown(false);
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
                setShowProfileDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown]);

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full">
                <Sidebar className="w-64">
                    <SidebarHeader>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                                <Bus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    SafarSaathi
                                </h2>
                                <p className="text-xs text-muted-foreground">Admin Panel</p>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu className="px-3 py-4">
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        isActive={currentPage === item.id}
                                        onClick={() => onPageChange(item.id)}
                                        className="w-full"
                                    >
                                        <item.icon className="h-4 w-4 mr-3" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter>
                        <div className="px-3">
                            <div className="relative profile-dropdown">
                                <div
                                    className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={toggleProfileDropdown}
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {currentAdmin?.username?.charAt(0).toUpperCase() || 'A'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {currentAdmin?.username || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {currentAdmin?.role || 'Administrator'}
                                        </p>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                                </div>

                                {showProfileDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                        <button
                                            onClick={handleProfileClick}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Profile Settings</span>
                                        </button>
                                        <button
                                            onClick={handleLogoutClick}
                                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 overflow-auto">
                    <div className="border-b border-border bg-card/80 backdrop-blur-sm">
                        <div className="flex h-16 items-center justify-between px-6">
                            <div className="flex items-center">
                                <div>
                                    <h1 className="text-xl font-bold capitalize bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {currentPage}
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogoutClick}
                                    className="h-9 px-3 hover:bg-muted"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleTheme}
                                    className="h-9 w-9 rounded-full p-0 hover:bg-muted"
                                >
                                    {theme === 'light' ? (
                                        <Moon className="h-5 w-5" />
                                    ) : (
                                        <Sun className="h-5 w-5" />
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

            {showLogoutDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleLogoutCancel}
                    />
                    <div className="relative z-50 bg-card rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">
                                Confirm Logout
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Are you sure you want to log out? You will need to enter your credentials again to access the admin panel.
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-border flex justify-end space-x-2">
                            <Button variant="outline" onClick={handleLogoutCancel}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleLogoutConfirm}
                                className="bg-destructive hover:opacity-90 text-destructive-foreground"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showProfileModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowProfileModal(false)}
                    />
                    <div className="relative z-50 bg-card rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">
                                    Admin Profile
                                </h3>
                                <button
                                    onClick={() => setShowProfileModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4">
                            <AdminProfileForm
                                currentAdmin={currentAdmin}
                                onClose={() => setShowProfileModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </SidebarProvider>
    );
}

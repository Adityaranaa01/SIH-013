import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <SidebarContext.Provider value={{ open, setOpen }}>
            <div className="flex h-screen w-full">
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

export function Sidebar({ children, className = '' }) {
    return (
        <div className={`bg-white/90 backdrop-blur-sm border-r border-gray-200 dark:bg-gray-900/90 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
}

export function SidebarHeader({ children, className = '' }) {
    return (
        <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
}

export function SidebarContent({ children, className = '' }) {
    return (
        <div className={`flex-1 overflow-y-auto ${className}`}>
            {children}
        </div>
    );
}

export function SidebarFooter({ children, className = '' }) {
    return (
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
}

export function SidebarMenu({ children, className = '' }) {
    return (
        <nav className={`space-y-1 ${className}`}>
            {children}
        </nav>
    );
}

export function SidebarMenuItem({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

export function SidebarMenuButton({
    children,
    isActive = false,
    onClick,
    className = '',
    onMouseEnter
}) {
    const baseClasses = "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";
    const activeClasses = "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
    const inactiveClasses = "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white";

    return (
        <button
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${className}`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
        >
            {children}
        </button>
    );
}

export function SidebarTrigger({ className = '' }) {
    const { setOpen } = useContext(SidebarContext);

    return (
        <button
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
            onClick={() => setOpen(prev => !prev)}
        >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    );
}

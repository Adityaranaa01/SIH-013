import React from 'react';

export function Dialog({ children, open, onOpenChange }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-[10000] w-full max-w-7xl flex justify-center">
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className = '' }) {
    return (
        <div className={`bg-white dark:bg-gray-900 shadow-xl rounded-lg max-h-[90vh] overflow-y-auto ${className}`}>
            {children}
        </div>
    );
}

export function DialogHeader({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className = '' }) {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
            {children}
        </h3>
    );
}

export function DialogDescription({ children, className = '' }) {
    return (
        <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
            {children}
        </p>
    );
}

export function DialogFooter({ children, className = '' }) {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2 ${className}`}>
            {children}
        </div>
    );
}

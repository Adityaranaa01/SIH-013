import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const Toast = ({ toast, onRemove }) => {
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 ${getBackgroundColor()} transform transition-all duration-300 ease-in-out`}
            style={{
                animation: 'slideInRight 0.3s ease-out',
            }}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {toast.title}
                    </p>
                    {toast.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {toast.description}
                        </p>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => onRemove(toast.id)}
                    >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = {
            id,
            type: 'info',
            duration: 5000,
            ...toast,
        };

        setToasts((prev) => [...prev, newToast]);

        if (newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, newToast.duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = useCallback((title, description) => {
        return addToast({ type: 'success', title, description });
    }, [addToast]);

    const error = useCallback((title, description) => {
        return addToast({ type: 'error', title, description });
    }, [addToast]);

    const warning = useCallback((title, description) => {
        return addToast({ type: 'warning', title, description });
    }, [addToast]);

    const info = useCallback((title, description) => {
        return addToast({ type: 'info', title, description });
    }, [addToast]);

    const value = {
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

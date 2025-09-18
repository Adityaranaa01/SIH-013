import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog';
import { Button } from './Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    isLoading = false
}) => {
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />;
            case 'info':
                return <Info className="w-6 h-6 text-blue-500 dark:text-blue-400" />;
            case 'warning':
            default:
                return <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />;
        }
    };

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white';
            case 'warning':
            default:
                return 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 text-white';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center space-x-3">
                        {getIcon()}
                        <DialogTitle className="text-lg font-semibold">
                            {title}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={getConfirmButtonStyle()}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;

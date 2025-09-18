import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { useToast } from './ui/Toast';
import { Eye, EyeOff, Save, User, Lock } from 'lucide-react';

const AdminProfileForm = ({ currentAdmin, onClose }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentAdmin) {
            setFormData(prev => ({
                ...prev,
                username: currentAdmin.username || ''
            }));
        }
    }, [currentAdmin]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username.trim()) {
            toast.error('Validation Error', 'Username is required.');
            return;
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('Validation Error', 'New passwords do not match.');
            return;
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            toast.error('Validation Error', 'New password must be at least 6 characters long.');
            return;
        }

        setIsLoading(true);

        try {
            const updateData = {
                username: formData.username.trim(),
                currentPassword: formData.currentPassword || null,
                newPassword: formData.newPassword || null
            };

            const response = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Profile Updated', 'Your profile has been updated successfully.');
                onClose();
                // Optionally refresh the page or update the parent component
                window.location.reload();
            } else {
                toast.error('Update Failed', result.error || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Update Failed', 'An error occurred while updating your profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
                <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                </Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    required
                    className="mt-1"
                />
            </div>

            {/* Current Password Field */}
            <div>
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Current Password
                </Label>
                <div className="relative mt-1">
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Required only if changing password
                </p>
            </div>

            {/* New Password Field */}
            <div>
                <Label htmlFor="newPassword" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                </Label>
                <div className="relative mt-1">
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Leave blank to keep current password
                </p>
            </div>

            {/* Confirm Password Field */}
            {formData.newPassword && (
                <div>
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Confirm New Password
                    </Label>
                    <div className="relative mt-1">
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm new password"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Profile
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};

export default AdminProfileForm;

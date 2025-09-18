import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/admin/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('adminToken', result.data.token);
                localStorage.setItem('adminData', JSON.stringify(result.data));
                navigate('/admin/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-background to-muted/20">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="mb-2 text-3xl font-bold">Admin Panel</h1>
                    <p className="text-muted-foreground">Sign in to manage routes and buses</p>
                </div>

                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold">Administrator Login</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Access the BMTC management system
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium">
                                    Username
                                </label>
                                <Input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter admin username"
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter admin password"
                                        required
                                        className="w-full pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 border rounded-lg bg-destructive/10 border-destructive/20">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full text-white gradient-cta"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>


                        <div className="mt-4 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/login')}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Driver Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;

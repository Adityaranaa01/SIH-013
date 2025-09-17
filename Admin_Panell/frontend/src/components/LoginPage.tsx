import { useState } from 'react';
import { AuthAPI } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Bus, Shield, AlertCircle, Moon, Sun } from 'lucide-react';

interface Admin {
  id: string;
  name: string;
}

interface LoginPageProps {
  onLogin: (admin: Admin) => void;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export function LoginPage({ onLogin, theme = 'light', onThemeToggle }: LoginPageProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const admin = await AuthAPI.login(adminId, password);
      onLogin(admin);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button - positioned in top-right */}
      {onThemeToggle && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onThemeToggle}
          className="absolute top-6 right-6 h-9 w-9 rounded-full p-0 hover:bg-muted/50 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors" />
          ) : (
            <Sun className="h-4 w-4 text-foreground/70 hover:text-foreground transition-colors" />
          )}
        </Button>
      )}
      
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Bus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">SmartTransit</h1>
              <p className="text-lg text-gradient-primary">Next-Gen Bus Tracking</p>
            </div>
          </div>
          <p className="text-muted-foreground">Admin Dashboard Access</p>
        </div>

        {/* Login Form */}
        <Card className="card-elevated border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-accent" />
              <span>Admin Login</span>
            </CardTitle>
            <CardDescription>
              Enter your admin credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminId">Admin ID</Label>
                <Input
                  id="adminId"
                  type="text"
                  placeholder="Enter admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {!error && !(import.meta as any)?.env?.VITE_API_BASE_URL && (
                <div className="text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-md p-2">
                  Tip: set VITE_API_BASE_URL in Admin_Panel/frontend/.env (e.g., http://localhost:3011)
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Access Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
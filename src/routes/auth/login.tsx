import React, { useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';
import { rootRoute } from '../root';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: () => {
    const { user, profile, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
      // If user is already authenticated, redirect appropriately
      if (!isLoading && user) {
        if (profile && profile.onboarding_completed) {
          navigate({ to: '/feed' });
        } else {
          navigate({ to: '/onboarding' });
        }
      }
    }, [user, profile, isLoading, navigate]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Loading...</h2>
            <p className="text-muted-foreground">Checking authentication status</p>
          </div>
        </div>
      );
    }

    if (!isLoading && user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Redirecting...</h2>
            <p className="text-muted-foreground">You're already logged in</p>
          </div>
        </div>
      );
    }

    return (
      <AuthLayout
        title="Log In to Your Account"
        subtitle="Welcome back! Enter your credentials below to access your personalized market intelligence"
      >
        <LoginForm />
      </AuthLayout>
    );
  },
});
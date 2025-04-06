import { useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useAuthStore } from '../stores/authStore';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { UserProfile } from '../lib/supabase';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const { user, profile, isLoading, authError, fetchProfile } = useAuthStore();
    const { resetOnboardingState } = useOnboardingStore();
    const navigate = useNavigate();
    
    // Check for force refresh flag
    useEffect(() => {
      const forceRefresh = sessionStorage.getItem('force_profile_refresh');
      if (forceRefresh && user) {
        console.log("Force refreshing profile from database");
        fetchProfile().then((refreshedProfile: UserProfile | null) => {
          console.log("Profile refreshed from database:", refreshedProfile);
          sessionStorage.removeItem('force_profile_refresh');
        });
      }
    }, [user, fetchProfile]);
    
    // Use useEffect for navigation, regardless of loading state
    useEffect(() => {
      let timeoutId: NodeJS.Timeout;
      
      // Only navigate when we're done loading
      if (!isLoading) {
        console.log("Root route navigation check with full details:", { 
          user: user, 
          profile: profile, 
          profileComplete: profile?.onboarding_completed,
          isLoading
        });
        
        // Reset onboarding state for logged in users who haven't completed onboarding
        if (user && profile && !profile.onboarding_completed) {
          console.log("Resetting onboarding state for incomplete profile");
          resetOnboardingState();
        }
        
        // Add a short delay to ensure state is settled
        timeoutId = setTimeout(() => {
          if (!user) {
            console.log("No user, redirecting to login");
            navigate({ to: '/auth/login', replace: true });
          } else if (!profile || !profile.onboarding_completed) {
            console.log("User needs onboarding, redirecting. Profile state:", { 
              hasProfile: !!profile, 
              onboardingComplete: profile?.onboarding_completed 
            });
            navigate({ to: '/onboarding', replace: true });
          } else {
            console.log("User authenticated and onboarded, redirecting to feed");
            navigate({ to: '/feed', replace: true });
          }
        }, 300);
      }
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [isLoading, user, profile, navigate, resetOnboardingState]);
    
    // Show error state if authentication failed
    if (authError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Authentication Error</h2>
            <p className="text-muted-foreground mb-4">{authError}</p>
            <button 
              onClick={() => navigate({ to: '/auth/login' })}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Return to Login
            </button>
          </div>
        </div>
      );
    }
    
    // Show loading spinner while auth state is being determined or during navigation
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">
            {isLoading ? "Loading..." : "Redirecting..."}
          </h2>
          <p className="text-muted-foreground">
            {isLoading ? "Setting up your experience" : "Taking you to the right place"}
          </p>
        </div>
      </div>
    );
  }
});
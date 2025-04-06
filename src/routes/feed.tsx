import { useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { MainLayout } from '../components/layout/MainLayout';
import { NewsFeed } from '../components/feed/NewsFeed';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/feed',
  component: () => {
    const { user, profile, isLoading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
      console.log("Feed route useEffect running, loading state:", isLoading);
      if (!isLoading) {
        console.log("Feed route navigation check - full details:", { 
          user: user, 
          profile: profile, 
          isLoading: isLoading,
          hasUser: !!user,
          hasProfile: !!profile,
          onboardingCompleted: profile?.onboarding_completed
        });
        
        // If not authenticated, redirect to login
        if (!user) {
          console.log("No user, redirecting to login");
          navigate({ to: '/auth/login', replace: true });
          return;
        }

        // If onboarding not completed, redirect to onboarding
        if (!profile || !profile.onboarding_completed) {
          console.log("User needs onboarding, redirecting. Profile details:", profile);
          navigate({ to: '/onboarding', replace: true });
          return;
        }
        
        console.log("Feed route checks passed, should display NewsFeed component");
      }
    }, [user, profile, isLoading, navigate]);

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Loading...</h2>
            <p className="text-muted-foreground">Preparing your news feed</p>
          </div>
        </div>
      );
    }

    // If auth checks are complete and user shouldn't be here, show redirecting
    if (!isLoading && (!user || !profile || !profile.onboarding_completed)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Redirecting...</h2>
            <p className="text-muted-foreground">Taking you to the right place</p>
          </div>
        </div>
      );
    }

    // Render the feed if all checks pass
    console.log("Rendering feed component, auth state:", { isLoading, hasUser: !!user, hasProfile: !!profile });
    return (
      <MainLayout>
        <NewsFeed />
      </MainLayout>
    );
  },
});
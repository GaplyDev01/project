import React, { useEffect } from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rootRoute } from './routes/root';
import { indexRoute } from './routes/index';
import { onboardingRoute } from './routes/onboarding';
import { feedRoute } from './routes/feed';
import { savedRoute } from './routes/saved';
import { alertsRoute } from './routes/alerts';
import { settingsRoute } from './routes/settings';
import { loginRoute } from './routes/auth/login';
import { signupRoute } from './routes/auth/signup';
import { forgotPasswordRoute } from './routes/auth/forgot-password';
import { resetPasswordRoute } from './routes/auth/reset-password';
import { callbackRoute } from './routes/auth/callback';
import { useAuthStore } from './stores/authStore';
import { supabase } from './lib/supabase';
import ErrorBoundary from './ErrorBoundary';

// Create a query client
const queryClient = new QueryClient();

// Create the router instance
const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  feedRoute,
  savedRoute,
  alertsRoute,
  settingsRoute,
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  callbackRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register the router for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const { setUser, setSession, setIsLoading, fetchProfile, setAuthError } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setAuthError(null);
        console.log("Initializing auth...");
        
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthError(error.message);
          console.error('Auth session error:', error);
          setIsLoading(false);
          return;
        }
        
        if (data && data.session) {
          console.log("Session found, user is authenticated");
          setUser(data.session.user);
          setSession(data.session);
          await fetchProfile();
        } else {
          // No active session
          console.log("No session found, user is not authenticated");
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        setAuthError(error.message || "Authentication initialization failed");
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          setUser(session.user);
          setSession(session);
          await fetchProfile();
        } else {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
      }
    );
    
    // Always ensure loading state is cleared after a timeout
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 second timeout as a failsafe
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [setUser, setSession, setIsLoading, fetchProfile, setAuthError]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
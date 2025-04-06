import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data && data.session) {
          setUser(data.session.user);
          setSession(data.session);
          
          // Fetch user profile
          const profile = await fetchProfile();
          
          // Redirect based on onboarding status
          if (profile && profile.onboarding_completed) {
            navigate({ to: '/feed' });
          } else {
            navigate({ to: '/onboarding' });
          }
        } else {
          navigate({ to: '/auth/login' });
        }
      } catch (error) {
        console.error('Error during auth callback:', error);
        navigate({ to: '/auth/login' });
      }
    };
    
    handleCallback();
  }, [navigate, setUser, setSession, fetchProfile]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">Authenticating...</h2>
        <p className="text-muted-foreground">Please wait while we authenticate your account.</p>
      </div>
    </div>
  );
};
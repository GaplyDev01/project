import React, { useEffect } from 'react';
import { createRoute, redirect, useNavigate } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { OnboardingWelcome } from '../../components/onboarding/Welcome';
import { OnboardingMarket } from '../../components/onboarding/Market';
import { OnboardingProfessional } from '../../components/onboarding/Professional';
import { OnboardingInterests } from '../../components/onboarding/Interests';
import { OnboardingNarrative } from '../../components/onboarding/Narrative';
import { OnboardingStories } from '../../components/onboarding/Stories';
import { OnboardingCompetitors } from '../../components/onboarding/Competitors';
import { OnboardingComplete } from '../../components/onboarding/Complete';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

export const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: () => {
    const { currentStep, isComplete } = useOnboardingStore();
    const { user, profile, isLoading, authError } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
      // Only run navigation logic when loading is complete
      if (!isLoading) {
        console.log("Onboarding navigation check:", { user, profile, isComplete });
        
        // If not authenticated, redirect to login
        if (!user) {
          console.log("No user, redirecting to login");
          navigate({ to: '/auth/login', replace: true });
          return;
        }

        // If user has completed onboarding and isn't in the final step, redirect to feed
        if (user && profile && profile.onboarding_completed && !isComplete) {
          console.log("Onboarding completed, redirecting to feed");
          navigate({ to: '/feed', replace: true });
          return;
        }
      }
    }, [isLoading, user, profile, navigate, isComplete, currentStep]);

    // If still loading, show loader
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Loading...</h2>
            <p className="text-muted-foreground">Preparing your onboarding experience</p>
          </div>
        </div>
      );
    }

    // If redirecting, show loading state
    if ((!user) || (user && profile && profile.onboarding_completed && !isComplete)) {
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
    
    // Render different components based on the current step
    const renderStep = () => {
      switch (currentStep) {
        case 0:
          return <OnboardingWelcome />;
        case 1:
          return <OnboardingMarket />;
        case 2:
          return <OnboardingProfessional />;
        case 3:
          return <OnboardingInterests />;
        case 4:
          return <OnboardingNarrative />;
        case 5:
          return <OnboardingStories />;
        case 6:
          return <OnboardingCompetitors />;
        case 7:
          return <OnboardingComplete />;
        default:
          return <OnboardingWelcome />;
      }
    };
    
    return renderStep();
  },
});
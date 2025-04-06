import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

// Define the onboarding step type
type OnboardingStep = 1 | 2 | 3;

// Define the step completion data interface
interface StepCompletionData {
  profile?: Partial<UserProfile>;
}

interface OnboardingState {
  step: OnboardingStep;
  isComplete: boolean;
  profile: UserProfile | null;
  setStep: (step: OnboardingStep) => void;
  updateStepCompletion: (step: OnboardingStep, isComplete: boolean, data?: StepCompletionData) => void;
  resetOnboarding: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  extractKeywords: () => Promise<string[]>;
  syncProfileToDatabase: (userProfile?: UserProfile) => Promise<void>;
}

const initialProfile: Partial<UserProfile> = {
  market_preference: 'crypto',
  professional_context: {
    role: '',
    organization: '',
    scale: '',
    industry: '',
  },
  interests: [],
  extracted_keywords: [],
  competitors: [],
  onboarding_completed: false
};

export const useOnboardingStore = create<OnboardingState>()(persist<OnboardingState>(
    (set, get) => ({
      step: 1,
      isComplete: false,
      profile: initialProfile,
      
      setStep: (step: OnboardingStep) => set({ step }),
      
      updateStepCompletion: (step: OnboardingStep, isComplete: boolean, data?: StepCompletionData) => {
        const state = get();
        
        if (data && data.profile) {
          set({
            profile: {
              ...state.profile,
              ...data.profile
            } as UserProfile,
            isComplete: step === 3 && isComplete ? true : state.isComplete
          });
        } else {
          set({
            isComplete: step === 3 && isComplete ? true : state.isComplete
          });
        }
      },
      
      resetOnboarding: () => set({ step: 1, isComplete: false, profile: initialProfile }),
      
      updateProfile: (profileUpdate: Partial<UserProfile>) => {
        const state = get();
        set({
          profile: {
            ...state.profile,
            ...profileUpdate
          } as UserProfile
        });
      },
      
      extractKeywords: async () => {
        try {
          // Get current profile data
          const { profile } = get();
          if (!profile) return [];
          
          const interests = profile.interests || [];
          
          // Call the edge function to extract keywords
          const { data, error } = await supabase.functions.invoke('extract-keywords', {
            body: { interests }
          });
          
          if (error) {
            console.error('Error extracting keywords:', error);
            return [];
          }
          
          // Update the profile with extracted keywords
          const extractedKeywords = data?.keywords || [];
          set({
            profile: {
              ...profile,
              extracted_keywords: extractedKeywords
            } as UserProfile
          });
          
          return extractedKeywords;
        } catch (err) {
          console.error('Error in extractKeywords:', err);
          return [];
        }
      },
      
      syncProfileToDatabase: async (userProfile?: UserProfile) => {
        try {
          const profile = userProfile || get().profile;
          if (!profile) return;
          
          // Ensure user is logged in
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          // Update the profile in the database
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              interests: profile.interests,
              market_preference: profile.market_preference,
              professional_context: profile.professional_context,
              extracted_keywords: profile.extracted_keywords,
              competitors: profile.competitors,
              onboarding_completed: profile.onboarding_completed
            }, {
              onConflict: 'id'
            });
          
          if (error) throw error;
        } catch (err) {
          console.error('Error syncing profile to database:', err);
          throw err;
        }
      }
    }),
    {
      name: 'onboarding-storage'
    }
  )
);
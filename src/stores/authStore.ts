import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  authError: string | null;
  setUser: (user: any | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: any | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<UserProfile | null>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      authError: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setAuthError: (error) => set({ authError: error }),
      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null, profile: null, session: null });
        } catch (error) {
          console.error("Error during sign out:", error);
        }
      },
      fetchProfile: async () => {
        const { user } = get();
        if (!user) {
          console.log("No user, can't fetch profile");
          return null;
        }
        
        try {
          console.log("Fetching profile for user:", user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error fetching profile:", error);
            
            // Try to check if the profile exists at all
            const { count, error: countError } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .eq('id', user.id);
              
            if (countError) {
              console.error("Error checking profile existence:", countError);
            } else if (count === 0) {
              console.log("No profile exists for user, attempting to create one");
              
              // Try to create a profile if it doesn't exist
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([{
                  id: user.id,
                  email: user.email,
                  interests: [],
                  market_preference: 'crypto',
                  extracted_keywords: [],
                  competitors: [],
                  professional_context: {},
                  onboarding_completed: false
                }]);
                
              if (insertError) {
                console.error("Error creating profile:", insertError);
                set({ authError: `Failed to create profile: ${insertError.message}` });
              } else {
                console.log("Profile created successfully");
                // Try fetching again
                const { data: newData, error: newError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();
                  
                if (newError) {
                  console.error("Error fetching newly created profile:", newError);
                  set({ authError: newError.message });
                  set({ isLoading: false });
                  return null;
                }
                
                console.log("Profile fetched successfully after creation:", newData);
                const profile = newData as UserProfile;
                set({ profile, authError: null });
                set({ isLoading: false });
                return profile;
              }
            }
            
            set({ authError: error.message });
            set({ isLoading: false });
            return null;
          }
          
          console.log("Profile fetched successfully:", data);
          const profile = data as UserProfile;
          set({ profile, authError: null });
          set({ isLoading: false });
          return profile;
        } catch (error: any) {
          console.error('Error fetching profile:', error);
          set({ authError: error.message || "Failed to fetch profile" });
          set({ isLoading: false });
          return null;
        }
      },
      updateProfile: async (data) => {
        const { user } = get();
        if (!user) {
          console.error("No user to update profile");
          return;
        }
        
        try {
          set({ isLoading: true });
          console.log("Updating profile for user:", user.id, "with data:", data);
          
          // First check if profile exists
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', user.id);
            
          if (countError) {
            console.error("Error checking profile existence:", countError);
            throw countError;
          }
          
          if (count === 0) {
            console.log("No profile exists for user, creating one");
            
            // Create a new profile with the provided data
            const newProfile = {
              id: user.id,
              email: user.email,
              interests: data.interests || [],
              market_preference: data.market_preference || 'crypto',
              extracted_keywords: data.extracted_keywords || [],
              competitors: data.competitors || [],
              professional_context: data.professional_context || {},
              onboarding_completed: data.onboarding_completed || false
            };
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([newProfile]);
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              throw insertError;
            }
            
            console.log("Profile created successfully:", newProfile);
            set({ 
              profile: newProfile as UserProfile,
              authError: null
            });
          } else {
            // Update existing profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update(data)
              .eq('id', user.id);
            
            if (updateError) {
              console.error("Profile update error:", updateError);
              throw updateError;
            }
            
            // Get the updated profile
            const { data: updatedProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (fetchError) {
              console.error("Error fetching updated profile:", fetchError);
              throw fetchError;
            }
            
            console.log("Profile updated successfully:", updatedProfile);
            set({ 
              profile: updatedProfile as UserProfile,
              authError: null
            });
          }
        } catch (error: any) {
          console.error('Error updating profile:', error);
          set({ authError: error.message || "Failed to update profile" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'crypto-intel-auth',
    }
  )
);
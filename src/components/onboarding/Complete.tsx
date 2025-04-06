import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Cpu, Fingerprint, Search, Zap } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

// Simulated profile matches based on user inputs
const getRandomMatch = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const OnboardingComplete: React.FC = () => {
  const { setIsComplete, profile } = useOnboardingStore();
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<
    'analyzing' | 'calibrating' | 'optimizing' | 'complete'
  >('analyzing');
  const [matches, setMatches] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate the profile generation process
    const totalDuration = 5000; // 5 seconds total
    const interval = 50; // update every 50ms
    const steps = totalDuration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(100, Math.round((currentStep / steps) * 100));
      setProgress(newProgress);
      
      // Change the displayed step based on progress
      if (newProgress < 30) {
        setStep('analyzing');
      } else if (newProgress < 60) {
        setStep('calibrating');
      } else if (newProgress < 90) {
        setStep('optimizing');
      } else if (newProgress === 100) {
        setStep('complete');
        setIsGenerating(false);
        clearInterval(timer);
        
        // Generate category matches
        const categories = [
          'DeFi News', 'NFT Updates', 'Market Analysis', 
          'Regulation Alerts', 'Technology Insights', 'Trading Strategies'
        ];
        
        const matchScores: {[key: string]: number} = {};
        categories.forEach(category => {
          matchScores[category] = getRandomMatch(50, 95);
        });
        
        // Sort by match percentage
        const sortedMatches = Object.fromEntries(
          Object.entries(matchScores).sort(([, a], [, b]) => b - a)
        );
        
        setMatches(sortedMatches);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [setIsComplete]);
  
  const handleEnterPlatform = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Starting onboarding completion process");
      
      // First mark as complete in the local state
      setIsComplete(true);
      console.log("Set isComplete to true in local state");
      
      // Save profile to Supabase if user is logged in
      if (user) {
        console.log("Attempting to save profile for user:", user.id);
        
        // Create the professional context object correctly
        const professionalContext = {
          role: profile.professionalContext.role || '',
          organization: profile.professionalContext.organization || '',
          scale: profile.professionalContext.scale || null,
          industry: profile.professionalContext.industry || ''
        };
        
        console.log("Professional context:", professionalContext);
        
        // Try with a direct Supabase call first
        console.log("Making direct Supabase update call with data:", {
            interests: profile.interests || [],
            market_preference: profile.marketPreference || 'crypto',
            extracted_keywords: profile.extractedKeywords || [],
            competitors: profile.competitors || [],
            professional_context: professionalContext,
            onboarding_completed: true
        });
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            interests: profile.interests || [],
            market_preference: profile.marketPreference || 'crypto',
            extracted_keywords: profile.extractedKeywords || [],
            competitors: profile.competitors || [],
            professional_context: professionalContext,
            onboarding_completed: true
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error("Direct profile update error:", updateError);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
        
        // Double check the update worked by getting the profile
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (fetchError) {
          console.error("Error fetching updated profile:", fetchError);
          throw new Error(`Failed to verify profile update: ${fetchError.message}`);
        }
        
        console.log("Updated profile:", updatedProfile);
        
        if (!updatedProfile.onboarding_completed) {
          console.error("Onboarding_completed flag not set correctly");
          throw new Error("Profile was updated but onboarding completion wasn't saved properly");
        }
        
        // THIS IS THE CRITICAL FIX: Update the auth store's profile state with the updated profile
        // This ensures the feed route sees the updated onboarding_completed flag
        updateProfile(updatedProfile);
        console.log("Profile successfully updated in auth store:", updatedProfile);
      } else {
        console.warn("No user found, continuing without saving profile to database");
      }
      
      // Force reload the profile from auth store to ensure we have latest data
      const currentAuthProfile = useAuthStore.getState().profile;
      console.log("Current auth store profile before navigation:", currentAuthProfile);
      
      // Navigate to feed page
      console.log("Navigating to /feed");
      console.log("Current profile state before navigation:", profile);
      console.log("User state before navigation:", user);
      
      // Force a small delay before navigation to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear any cache that might be preventing the route from seeing updated profile
      sessionStorage.setItem('force_profile_refresh', Date.now().toString());
      
      navigate({ to: '/feed', replace: true });
      console.log("Navigation command executed");
      
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.message || 'Failed to complete onboarding. Try clicking the button again.');
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout 
      title={isGenerating ? "Building Your Intelligence Profile" : "Your Intelligence Profile is Ready"}
      subtitle={isGenerating 
        ? "We're analyzing your inputs to create your personalized market intelligence system" 
        : "Your profile has been calibrated to deliver highly relevant market intelligence"
      }
      showProgress={false}
    >
      <div className="max-w-3xl mx-auto">
        <GlassCard className="mb-8">
          <div className="p-8">
            {isGenerating ? (
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: 360,
                    transition: { duration: 2, repeat: Infinity, ease: "linear" }
                  }}
                  className="w-24 h-24 mx-auto mb-8 relative"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                    style={{ 
                      clipPath: `inset(0 0 0 50%)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {step === 'analyzing' && <Search className="w-10 h-10 text-primary" />}
                    {step === 'calibrating' && <Cpu className="w-10 h-10 text-primary" />}
                    {step === 'optimizing' && <Fingerprint className="w-10 h-10 text-primary" />}
                    {step === 'complete' && <Check className="w-10 h-10 text-primary" />}
                  </div>
                </motion.div>
                
                <div className="mb-8">
                  <div className="text-lg font-medium mb-3">
                    {step === 'analyzing' && "Analyzing patterns..."}
                    {step === 'calibrating' && "Calibrating insights..."}
                    {step === 'optimizing' && "Optimizing filters..."}
                    {step === 'complete' && "Profile generation complete!"}
                  </div>
                  
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {progress}% complete
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center mb-10">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">CryptoIntel Profile</h3>
                    <p className="text-muted-foreground">Personalized for {profile.professionalContext.role || 'you'}</p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Content Match Strength</h3>
                  <div className="space-y-4">
                    {Object.entries(matches).map(([category, percentage], index) => (
                      <motion.div 
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between">
                          <span>{category}</span>
                          <span className="font-medium">{percentage}% relevance</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full"
                            style={{ 
                              width: `${percentage}%`,
                              background: percentage > 80 
                                ? 'hsl(var(--primary))' 
                                : percentage > 60 
                                ? 'hsl(var(--secondary))' 
                                : 'hsl(var(--muted-foreground))'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 mb-6 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
                    <p><strong>Error:</strong> {error}</p>
                    <p className="mt-2">Try clicking the button again or refresh the page.</p>
                  </div>
                )}
                
                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={handleEnterPlatform}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    isLoading={isLoading}
                    disabled={isLoading}
                  >
                    Enter Your Personalized Platform
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </OnboardingLayout>
  );
};
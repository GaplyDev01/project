import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ChevronRight, Coins, TrendingUp } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

export const OnboardingMarket: React.FC = () => {
  const { setCurrentStep, updateProfile, profile } = useOnboardingStore();
  
  const handleCryptoSelect = () => {
    updateProfile({ marketPreference: 'crypto' });
    setCurrentStep(2);
  };
  
  const handleTraditionalSelect = () => {
    // Join waitlist but continue with crypto onboarding
    updateProfile({ 
      marketPreference: 'crypto',
      waitlistTraditional: true
    });
    setCurrentStep(2);
  };
  
  return (
    <OnboardingLayout 
      title="Select Your Primary Market Focus"
      subtitle="Choose the market sphere where you need the most intelligence"
    >
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard 
              className="h-full"
              hover={true}
              onClick={handleCryptoSelect}
            >
              <div className="flex flex-col items-center h-full">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                
                <div className="bg-success/20 text-success px-3 py-1 rounded-full text-xs font-medium mb-4">
                  Available Now
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-center">Crypto Markets</h3>
                
                <p className="text-muted-foreground text-center mb-6">
                  Focus on blockchain technologies, cryptocurrencies, DeFi platforms, 
                  NFTs, and emerging digital asset ecosystems.
                </p>
                
                <div className="mt-auto">
                  <Button variant="primary">
                    Select Crypto Markets
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard 
              className="h-full relative"
              onClick={handleTraditionalSelect}
              hover={true}
            >
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="bg-warning/20 text-warning px-3 py-1 rounded-full text-xs font-medium mb-2 inline-block">
                    Coming Soon
                  </div>
                  <p className="text-sm mb-3">Join the waitlist and we'll notify you</p>
                  <Button variant="outline" size="sm">
                    Join Waitlist
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col items-center h-full opacity-50">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-secondary" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-center">Traditional Markets</h3>
                
                <p className="text-muted-foreground text-center mb-6">
                  Focus on stocks, bonds, commodities, forex, ETFs, and
                  conventional financial instruments and institutions.
                </p>
                
                <div className="mt-auto">
                  <Button variant="secondary" disabled>
                    Select Traditional Markets
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground mb-8">
            <AlertCircle className="w-4 h-4" />
            <span>Traditional markets integration is coming soon. For now, all users will experience our crypto intelligence features.</span>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep(0)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          </div>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
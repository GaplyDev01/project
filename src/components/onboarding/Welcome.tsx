import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

export const OnboardingWelcome: React.FC = () => {
  const { setCurrentStep } = useOnboardingStore();
  
  return (
    <OnboardingLayout 
      title="Welcome to Your Intelligence Profile"
      subtitle="Create your personalized market intelligence system in under 5 minutes"
    >
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="mb-8 p-8">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary/30 to-accent/30 flex items-center justify-center mb-6 animate-glow-pulse"
            >
              <Sparkles className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-6 text-center">
              Discover Markets Through a Different Lens
            </h2>
            
            <p className="text-muted-foreground text-center max-w-2xl mb-8">
              Your profile isn't just preferences - it's an intelligent market lens calibrated to your unique perspective.
              We'll analyze your professional context, interests, and insights to create a tailored intelligence system.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
              <FeatureCard 
                icon={<Zap className="w-5 h-5 text-primary" />}
                title="Personalized Feed"
                description="Content matched to your specific market interests and professional context"
              />
              
              <FeatureCard 
                icon={<Zap className="w-5 h-5 text-secondary" />}
                title="Insight Calibration"
                description="System learns from your market predictions to refine intelligence delivery"
              />
              
              <FeatureCard 
                icon={<Zap className="w-5 h-5 text-accent" />}
                title="Strategic Monitoring"
                description="Track competitors and entities that matter to your market position"
              />
            </div>
            
            <Button 
              size="lg" 
              onClick={() => setCurrentStep(1)}
              rightIcon={<ChevronRight className="w-5 h-5" />}
            >
              Begin Profile Creation
            </Button>
          </div>
        </GlassCard>
        
        <p className="text-sm text-muted-foreground text-center">
          Estimated time to complete: 5 minutes
        </p>
      </motion.div>
    </OnboardingLayout>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-muted rounded-lg p-4 border border-muted/20">
    <div className="flex items-center mb-3">
      {icon}
      <h3 className="font-medium ml-2">{title}</h3>
    </div>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
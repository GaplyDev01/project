import React from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { Barcode, Zap } from 'lucide-react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showProgress?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  subtitle,
  showProgress = true,
}) => {
  const { step } = useOnboardingStore();
  
  const totalSteps = 7; // Total number of onboarding steps in the flow
  const progressPercentage = (step / totalSteps) * 100;
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-6 px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Zap className="w-8 h-8 text-primary mr-2" />
          <span className="text-xl font-bold tracking-tight">CryptoIntel</span>
        </div>
        {showProgress && (
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-3">Intelligence Profile</span>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="ml-3 text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
        )}
      </header>
      
      <main className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>}
        </motion.div>
        
        {children}
      </main>
      
      <footer className="py-6 px-8 text-sm text-muted-foreground flex items-center justify-between border-t border-muted/20">
        <div className="flex items-center">
          <Barcode className="w-4 h-4 mr-2" />
          <span>Intelligence Profile Creation</span>
        </div>
        <div className="flex items-center">
          <span>© 2025 CryptoIntel</span>
        </div>
      </footer>
    </div>
  );
};
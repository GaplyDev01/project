import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, ChevronRight, Users } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

const scaleOptions = [
  { id: 'startup', label: 'Startup', value: 'Startup', icon: <Users className="w-4 h-4" /> },
  { id: 'small-team', label: 'Small Team', value: 'Small Team', icon: <Users className="w-4 h-4" /> },
  { id: 'growing', label: 'Growing Enterprise', value: 'Growing Enterprise', icon: <Building className="w-4 h-4" /> },
  { id: 'established', label: 'Established Corporation', value: 'Established Corporation', icon: <Building className="w-4 h-4" /> },
  { id: 'global', label: 'Global Organization', value: 'Global Organization', icon: <Building className="w-4 h-4" /> },
];

const industryOptions = [
  { id: 'defi', label: 'DeFi Protocol', value: 'DeFi Protocol' },
  { id: 'nft', label: 'NFT Marketplace', value: 'NFT Marketplace' },
  { id: 'trading', label: 'Crypto Trading', value: 'Crypto Trading' },
  { id: 'investment', label: 'Crypto Investment', value: 'Crypto Investment' },
  { id: 'development', label: 'Blockchain Development', value: 'Blockchain Development' },
  { id: 'infrastructure', label: 'Web3 Infrastructure', value: 'Web3 Infrastructure' },
  { id: 'gaming', label: 'GameFi / Blockchain Gaming', value: 'GameFi / Blockchain Gaming' },
  { id: 'consulting', label: 'Crypto Consulting', value: 'Crypto Consulting' },
  { id: 'education', label: 'Crypto Education', value: 'Crypto Education' },
  { id: 'research', label: 'Blockchain Research', value: 'Blockchain Research' },
  { id: 'other', label: 'Other Blockchain / Crypto', value: 'Other Blockchain / Crypto' },
];

export const OnboardingProfessional: React.FC = () => {
  const { setStep, updateProfile, profile } = useOnboardingStore();
  const [role, setRole] = useState(profile.professionalContext.role);
  const [organization, setOrganization] = useState(profile.professionalContext.organization);
  const [scale, setScale] = useState(profile.professionalContext.scale);
  const [industry, setIndustry] = useState(profile.professionalContext.industry);
  
  const handleContinue = () => {
    updateProfile({
      professionalContext: {
        role,
        organization,
        scale,
        industry,
      },
    });
    setStep(3);
  };
  
  const isFormValid = role.trim() !== '' && (scale !== null);
  
  return (
    <OnboardingLayout 
      title="Your Professional Landscape"
      subtitle="Help us understand the context of your market operations"
    >
      <div className="max-w-2xl mx-auto">
        <GlassCard className="mb-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                How would you describe your professional role?
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Crypto Analyst, DeFi Developer, Trader"
                className="w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Which organization's performance matters to you? <span className="text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g., Your company, protocol, or project name"
                className="w-full bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                What's the scale of your operational environment?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {scaleOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer p-3 rounded-lg border ${
                      scale === option.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-muted/20 bg-muted/50 text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setScale(option.value)}
                  >
                    <div className="flex items-center">
                      <div className="mr-2">{option.icon}</div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Select your industry
              </label>
              <div className="grid grid-cols-2 gap-3">
                {industryOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer p-3 rounded-lg border ${
                      industry === option.value
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-muted/20 bg-muted/50 text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => setIndustry(option.value)}
                  >
                    <div className="flex items-center">
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </form>
        </GlassCard>
        
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setStep(1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={!isFormValid}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
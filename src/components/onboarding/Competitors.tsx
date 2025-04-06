import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Plus, X } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

// Common crypto projects/entities to suggest
const suggestions = [
  { id: 'bitcoin', name: 'Bitcoin' },
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'binance', name: 'Binance' },
  { id: 'coinbase', name: 'Coinbase' },
  { id: 'solana', name: 'Solana' },
  { id: 'avalanche', name: 'Avalanche' },
  { id: 'uniswap', name: 'Uniswap' },
  { id: 'aave', name: 'Aave' },
  { id: 'opensea', name: 'OpenSea' },
  { id: 'metamask', name: 'MetaMask' },
  { id: 'chainlink', name: 'Chainlink' },
  { id: 'polygon', name: 'Polygon' },
  { id: 'arbitrum', name: 'Arbitrum' },
  { id: 'optimism', name: 'Optimism' },
  { id: 'ftx', name: 'FTX' },
  { id: 'ripple', name: 'Ripple' },
  { id: 'cardano', name: 'Cardano' },
  { id: 'tether', name: 'Tether' },
  { id: 'consensys', name: 'ConsenSys' },
  { id: 'galaxy', name: 'Galaxy Digital' },
];

export const OnboardingCompetitors: React.FC = () => {
  const { setCurrentStep, updateProfile, profile } = useOnboardingStore();
  const [competitors, setCompetitors] = useState<string[]>(profile.competitors || []);
  const [customInput, setCustomInput] = useState('');
  
  const addCompetitor = (name: string) => {
    if (name && !competitors.includes(name)) {
      setCompetitors([...competitors, name]);
    }
  };
  
  const removeCompetitor = (name: string) => {
    setCompetitors(competitors.filter(item => item !== name));
  };
  
  const handleAddCustom = () => {
    if (customInput.trim()) {
      addCompetitor(customInput.trim());
      setCustomInput('');
    }
  };
  
  const handleContinue = () => {
    updateProfile({ competitors });
    setCurrentStep(7);
  };
  
  return (
    <OnboardingLayout 
      title="Strategic Monitoring"
      subtitle="Select projects or entities to track for strategic moves and market signals"
    >
      <div className="max-w-3xl mx-auto">
        <GlassCard className="mb-8">
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-lg font-medium mb-3">
                Which projects or entities would you like to monitor?
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                We'll prioritize news and updates about these organizations in your intelligence feed.
              </p>
              
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Add custom entity to track..."
                  className="flex-1 bg-muted border border-muted/20 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustom();
                    }
                  }}
                />
                <Button onClick={handleAddCustom} disabled={!customInput.trim()}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">Your Monitored Entities</h3>
              {competitors.length === 0 ? (
                <p className="text-sm text-muted-foreground">No entities selected yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {competitors.map((name, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/20 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium flex items-center"
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() => removeCompetitor(name)}
                        className="ml-2 text-primary-foreground/70 hover:text-primary-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">Suggested Entities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm px-3 py-2 rounded-lg text-left ${
                      competitors.includes(suggestion.name)
                        ? 'bg-primary/20 text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                    onClick={() => 
                      competitors.includes(suggestion.name) 
                        ? removeCompetitor(suggestion.name) 
                        : addCompetitor(suggestion.name)
                    }
                  >
                    {suggestion.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
        
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(5)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
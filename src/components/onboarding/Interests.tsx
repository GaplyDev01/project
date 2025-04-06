import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, PlusCircle, X } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

// Trending crypto topics with relative popularity (1-10)
const trendingTopics = [
  { id: 'defi', label: 'DeFi', popularity: 9 },
  { id: 'nft', label: 'NFTs', popularity: 8 },
  { id: 'layer2', label: 'Layer 2 Solutions', popularity: 10 },
  { id: 'dao', label: 'DAOs', popularity: 7 },
  { id: 'metaverse', label: 'Metaverse', popularity: 6 },
  { id: 'gamefi', label: 'GameFi', popularity: 8 },
  { id: 'web3', label: 'Web3', popularity: 9 },
  { id: 'staking', label: 'Staking', popularity: 7 },
  { id: 'bitcoin', label: 'Bitcoin', popularity: 10 },
  { id: 'ethereum', label: 'Ethereum', popularity: 10 },
  { id: 'altcoins', label: 'Altcoins', popularity: 8 },
  { id: 'trading', label: 'Trading Strategies', popularity: 7 },
  { id: 'regulation', label: 'Regulations', popularity: 9 },
  { id: 'security', label: 'Security', popularity: 8 },
  { id: 'privacy', label: 'Privacy Coins', popularity: 6 },
  { id: 'mining', label: 'Mining', popularity: 5 },
  { id: 'ico', label: 'ICOs/IDOs', popularity: 6 },
  { id: 'adoption', label: 'Institutional Adoption', popularity: 9 },
  { id: 'centralization', label: 'Centralization Risks', popularity: 7 },
  { id: 'interoperability', label: 'Interoperability', popularity: 8 },
  { id: 'sustainable', label: 'Sustainable Blockchains', popularity: 7 },
  { id: 'identity', label: 'Digital Identity', popularity: 6 },
  { id: 'markets', label: 'Market Analysis', popularity: 9 },
  { id: 'tech', label: 'Blockchain Technology', popularity: 8 },
];

export const OnboardingInterests: React.FC = () => {
  const { setStep, updateProfile, profile } = useOnboardingStore();
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [customInterest, setCustomInterest] = useState('');
  
  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      if (selectedInterests.length < 15) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };
  
  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest) && selectedInterests.length < 15) {
      setSelectedInterests([...selectedInterests, customInterest]);
      setCustomInterest('');
    }
  };
  
  const handleContinue = () => {
    updateProfile({ interests: selectedInterests });
    setStep(4);
  };
  
  // Calculate positions in the "radar" visualization
  const getPositionStyle = (index: number, popularity: number) => {
    // Create a spiral pattern
    const totalItems = trendingTopics.length;
    const angle = (index / totalItems) * Math.PI * 6; // Multiple rotations
    const radius = 150 - popularity * 8; // More popular items closer to center
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // Scale for size based on popularity
    const scale = 0.8 + (popularity / 10) * 0.7;
    
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: `translate(-50%, -50%) scale(${scale})`,
      zIndex: popularity,
    };
  };
  
  return (
    <OnboardingLayout 
      title="Interest Radar"
      subtitle="Select topics that match your intelligence needs. The visualization adapts to your selections."
    >
      <div className="max-w-4xl mx-auto">
        <GlassCard className="mb-8 p-8 overflow-hidden">
          <div className="relative h-[500px] mb-6">
            {/* Radar circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] border border-muted/20 rounded-full"></div>
              <div className="w-[300px] h-[300px] border border-muted/20 rounded-full absolute"></div>
              <div className="w-[200px] h-[200px] border border-muted/20 rounded-full absolute"></div>
              <div className="w-[100px] h-[100px] border border-muted/20 rounded-full absolute"></div>
            </div>
            
            {/* Topic bubbles */}
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                style={getPositionStyle(index, topic.popularity)}
                className={`absolute cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedInterests.includes(topic.label)
                    ? 'bg-primary/50 text-white border border-primary/50'
                    : 'bg-muted/70 text-muted-foreground border border-muted/30 hover:bg-muted'
                }`}
                onClick={() => handleToggleInterest(topic.label)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {topic.label}
              </motion.div>
            ))}
            
            {/* Center glow */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full bg-primary/20 animate-pulse-glow"></div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                What else interests you? ({selectedInterests.length}/15)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Enter a custom interest..."
                  className="flex-1 bg-muted border border-muted/20 rounded-l-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomInterest();
                    }
                  }}
                  disabled={selectedInterests.length >= 15}
                />
                <Button
                  onClick={handleAddCustomInterest}
                  className="rounded-l-none"
                  disabled={!customInterest.trim() || selectedInterests.length >= 15}
                >
                  <PlusCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Selected Interests:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No interests selected yet.</p>
                ) : (
                  selectedInterests.map((interest, index) => (
                    <div
                      key={index}
                      className="bg-primary/20 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleInterest(interest)}
                        className="ml-2 text-primary-foreground/70 hover:text-primary-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </GlassCard>
        
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setStep(2)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={selectedInterests.length === 0}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Zap } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

const successStories = [
  {
    id: 'defi-yield',
    title: 'DeFi Protocol Optimization',
    description: 'How Uniswap optimized yield strategies by analyzing market conditions and competitor behavior.',
    category: 'DeFi',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'nft-marketplace',
    title: 'NFT Market Expansion',
    description: `OpenSea's strategic expansion into new NFT categories and geographic regions.`,
    category: 'NFTs',
    image: 'https://images.unsplash.com/photo-1659136487839-11f3d3a36509?q=80&w=1964&auto=format&fit=crop',
  },
  {
    id: 'trading-bot',
    title: 'Algorithmic Trading Success',
    description: 'How a trading firm leveraged market signals to develop a profitable crypto trading algorithm.',
    category: 'Trading',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'institutional-btc',
    title: 'Institutional Bitcoin Strategy',
    description: `MicroStrategy's approach to building and managing a substantial Bitcoin treasury position.`,
    category: 'Institutional',
    image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?q=80&w=2069&auto=format&fit=crop',
  },
  {
    id: 'dao-governance',
    title: 'DAO Governance Revolution',
    description: 'How MakerDAO restructured governance to improve decision-making and stakeholder alignment.',
    category: 'Governance',
    image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=2146&auto=format&fit=crop',
  },
  {
    id: 'layer2-scaling',
    title: 'Layer 2 Adoption Strategy',
    description: `Polygon's approach to building developer and user adoption for scaling solutions.`,
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2232&auto=format&fit=crop',
  },
];

export const OnboardingStories: React.FC = () => {
  const { setStep, updateProfile, profile } = useOnboardingStore();
  const [selectedStories, setSelectedStories] = useState<string[]>(profile.successStories || []);
  
  const toggleStory = (storyId: string) => {
    if (selectedStories.includes(storyId)) {
      setSelectedStories(selectedStories.filter(id => id !== storyId));
    } else {
      if (selectedStories.length < 3) {
        setSelectedStories([...selectedStories, storyId]);
      }
    }
  };
  
  const handleContinue = () => {
    updateProfile({ 
      successStories: selectedStories
    });
    setStep(6);
  };
  
  return (
    <OnboardingLayout 
      title="Success Stories"
      subtitle="Select up to 3 stories that align with your interests and goals"
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {successStories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard 
                className={`h-full cursor-pointer overflow-hidden ${
                  selectedStories.includes(story.id) 
                    ? 'border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : ''
                }`}
                onClick={() => toggleStory(story.id)}
                hover={true}
              >
                <div className="h-full flex flex-col">
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={story.image} 
                      alt={story.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-card/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded">
                        {story.category}
                      </span>
                    </div>
                    {selectedStories.includes(story.id) && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          Selected
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1">
                      {story.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Selected: {selectedStories.length}/3
          </p>
          <p className="text-sm text-muted-foreground">
            These selections help us understand your strategic priorities
          </p>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setStep(4)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={selectedStories.length === 0}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
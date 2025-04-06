import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, Search, Sparkles } from 'lucide-react';
import { OnboardingLayout } from '../layout/OnboardingLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';

export const OnboardingNarrative: React.FC = () => {
  const { setStep, updateProfile, profile } = useOnboardingStore();
  const [narrative, setNarrative] = useState(profile.marketNarrative || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedKeywords, setAnalyzedKeywords] = useState<string[]>([]);
  const [characterCount, setCharacterCount] = useState(0);
  
  useEffect(() => {
    setCharacterCount(narrative.length);
    
    // Extract keywords when user types
    if (narrative.length > 20) {
      setIsAnalyzing(true);
      
      const analyzeTimeout = setTimeout(() => {
        // Extract keywords from text content - more generous algorithm
        // This simulates NLP extraction - in a real app, this would be an API call
        const words = narrative.toLowerCase().split(/\s+/);
        
        // Common crypto related terms
        const potentialKeywords = [
          "bitcoin", "ethereum", "crypto", "blockchain", "defi", "nft", 
          "token", "exchange", "market", "regulation", "adoption", "protocol",
          "trading", "altcoin", "mining", "staking", "dao", "layer", "wallet",
          "decentralized", "centralized", "security", "privacy", "governance",
          "institutional", "yield", "liquidity", "smart contract", "consensus",
          "metaverse", "web3", "dapp", "hash", "validator", "fork", "chain",
          "halving", "bull", "bear", "volatility", "arbitrage", "airdrop",
          "erc20", "burn", "coin", "cold storage", "custody", "esg", "etf",
          "gas", "ico", "kyc", "lightning", "mainnet", "mempool", "merge",
          "node", "oracle", "pos", "pow", "rollup", "scaling", "sharding",
          "solidity", "testnet", "whale", "yield farming", "zero knowledge"
        ];
        
        // Check for exact matches and partial matches
        let extractedKeywords = [];
        
        // Check for exact word matches
        for (const word of words) {
          if (potentialKeywords.includes(word)) {
            extractedKeywords.push(word);
          }
        }
        
        // Check for phrases in the narrative text
        for (const keyword of potentialKeywords) {
          if (keyword.includes(" ")) {
            if (narrative.toLowerCase().includes(keyword)) {
              extractedKeywords.push(keyword);
            }
          }
        }
        
        // Check for partial matches (more generous)
        for (const word of words) {
          if (word.length > 4) { // Only consider substantial words
            for (const keyword of potentialKeywords) {
              if (keyword.includes(word) && !extractedKeywords.includes(keyword)) {
                extractedKeywords.push(keyword);
              }
            }
          }
        }
        
        // Add generic market analysis terms based on content
        const marketTerms = [
          { term: "Market Volatility", triggers: ["volatil", "fluctuat", "unstable", "uncertain"] },
          { term: "Institutional Investment", triggers: ["institution", "corporate", "company", "adoption", "invest"] },
          { term: "Regulatory Framework", triggers: ["regulat", "law", "compliance", "legal", "government"] },
          { term: "Technological Advancement", triggers: ["tech", "advance", "innovation", "develop", "progress"] },
          { term: "Cross-chain Integration", triggers: ["cross", "chain", "bridge", "interopera", "connect"] },
          { term: "Market Consolidation", triggers: ["consolidat", "merge", "acquisition", "dominant"] },
          { term: "Economic Policy Impact", triggers: ["econom", "policy", "fed", "interest", "inflation"] },
          { term: "Supply Chain Disruption", triggers: ["supply", "chain", "disrupt", "shortage"] },
          { term: "Global Adoption Trends", triggers: ["global", "adopt", "trend", "mainstream", "public"] },
          { term: "Security Concerns", triggers: ["secur", "hack", "exploit", "risk", "vulnerab"] },
          { term: "Privacy Solutions", triggers: ["privacy", "anonym", "confidential", "encrypt"] },
          { term: "Sustainable Development", triggers: ["sustain", "environment", "green", "esg", "carbon"] },
          { term: "Market Sentiment Analysis", triggers: ["sentiment", "feel", "emotion", "psychology", "fear", "greed"] },
          { term: "Tokenization Trends", triggers: ["token", "asset", "represent", "digital"] },
          { term: "Smart Contract Innovation", triggers: ["smart", "contract", "automat", "code"] }
        ];
        
        // Check if any triggers exist in the narrative
        for (const { term, triggers } of marketTerms) {
          if (triggers.some(trigger => narrative.toLowerCase().includes(trigger))) {
            extractedKeywords.push(term);
          }
        }
        
        // Add some longer phrase analysis
        const phrases = extractPhrases(narrative);
        extractedKeywords = [...new Set([...extractedKeywords, ...phrases])];
        
        setAnalyzedKeywords(extractedKeywords);
        setIsAnalyzing(false);
      }, 1000);
      
      return () => clearTimeout(analyzeTimeout);
    } else {
      setAnalyzedKeywords([]);
    }
  }, [narrative]);
  
  // Function to extract potential meaningful phrases
  const extractPhrases = (text: string): string[] => {
    const phrases: string[] = [];
    
    // Common phrase patterns
    const patterns = [
      /\b(increase|decrease|growth|decline|rise|fall|surge|drop)\s+in\s+([a-z\s]+)/gi,
      /\b(bullish|bearish)\s+on\s+([a-z\s]+)/gi,
      /\b(potential|future|upcoming|expected)\s+([a-z\s]+)/gi,
      /\b(market|industry|sector)\s+([a-z\s]+)/gi,
      /\b([a-z\s]+)\s+(adoption|integration|implementation)/gi,
      /\b(impact|effect|influence)\s+of\s+([a-z\s]+)/gi,
    ];
    
    // Extract phrases matching the patterns
    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match && match[0] && match[0].length > 10) {
          phrases.push(match[0].trim());
        }
      }
    });
    
    // Extract 2-4 word phrases that might be significant
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      // 2-word phrases
      if (i < words.length - 1) {
        const twoWordPhrase = `${words[i]} ${words[i+1]}`.toLowerCase();
        if (isSignificantPhrase(twoWordPhrase)) {
          phrases.push(twoWordPhrase);
        }
      }
      
      // 3-word phrases
      if (i < words.length - 2) {
        const threeWordPhrase = `${words[i]} ${words[i+1]} ${words[i+2]}`.toLowerCase();
        if (isSignificantPhrase(threeWordPhrase)) {
          phrases.push(threeWordPhrase);
        }
      }
      
      // 4-word phrases
      if (i < words.length - 3) {
        const fourWordPhrase = `${words[i]} ${words[i+1]} ${words[i+2]} ${words[i+3]}`.toLowerCase();
        if (isSignificantPhrase(fourWordPhrase)) {
          phrases.push(fourWordPhrase);
        }
      }
    }
    
    return [...new Set(phrases)]; // Remove duplicates
  };
  
  // Helper to determine if a phrase is significant
  const isSignificantPhrase = (phrase: string): boolean => {
    // Ignore phrases with common stopwords only
    const stopWords = ['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'to'];
    const phraseWords = phrase.split(' ');
    if (phraseWords.every(word => stopWords.includes(word))) {
      return false;
    }
    
    // Check for phrases with at least one substantive term
    const substantiveTerms = [
      'market', 'price', 'value', 'growth', 'trend', 'adoption', 'technology', 'blockchain',
      'crypto', 'token', 'defi', 'nft', 'exchange', 'regulation', 'investment', 'institutional',
      'retail', 'trader', 'volatility', 'security', 'privacy', 'layer', 'scaling', 'chain',
      'protocol', 'yield', 'staking', 'mining', 'wallet', 'contract', 'governance', 'dao'
    ];
    
    return substantiveTerms.some(term => phrase.includes(term));
  };
  
  const handleContinue = () => {
    updateProfile({ 
      marketNarrative: narrative,
      extractedKeywords: analyzedKeywords 
    });
    setStep(5);
  };
  
  return (
    <OnboardingLayout 
      title="Market Narrative Analysis"
      subtitle="Share your market predictions to calibrate our intelligence system"
    >
      <div className="max-w-3xl mx-auto">
        <GlassCard className="mb-8">
          <div className="p-6">
            <label className="block text-lg font-medium mb-3">
              What market shifts or trends do you anticipate in the next 6 months?
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              Your perspective helps us calibrate predictions and identify relevant signals.
              The more detailed your response, the better we can match content to your perspective.
            </p>
            
            <div className="relative">
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="I believe the crypto market will..."
                className="w-full h-40 bg-muted border border-muted/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{characterCount} characters</span>
                <span className={characterCount >= 30 ? 'text-success' : ''}>
                  {characterCount >= 30 ? 'Sufficient detail' : 'Minimum 30 characters recommended'}
                </span>
              </div>
            </div>
            
            {isAnalyzing && (
              <div className="mt-6 p-4 border border-muted/20 rounded-lg bg-muted/50">
                <div className="flex items-center">
                  <Search className="w-4 h-4 mr-2 text-primary animate-pulse" />
                  <span className="text-sm">Analyzing your narrative...</span>
                </div>
                <div className="mt-3 h-4 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary shimmer"
                    initial={{ width: '20%' }}
                    animate={{ width: '90%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}
            
            {analyzedKeywords.length > 0 && !isAnalyzing && (
              <motion.div 
                className="mt-6 p-4 border border-primary/20 rounded-lg bg-primary/5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center mb-3">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Insights Detected ({analyzedKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analyzedKeywords.map((keyword, index) => (
                    <motion.div
                      key={index}
                      className="bg-primary/20 text-primary-foreground px-2 py-1 rounded-full text-xs"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {keyword}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </GlassCard>
        
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setStep(3)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            disabled={narrative.length < 20}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
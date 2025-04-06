import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookmarkCheck, Calendar, ExternalLink, 
  FolderPlus, MoreHorizontal, Search, Trash, X 
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { getSavedArticles, getFolders, createFolder, trackActivity } from '../../services/newsService';

export const SavedArticles: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  
  useEffect(() => {
    const loadSavedContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load saved articles and folders from Supabase
        const articles = await getSavedArticles();
        const userFolders = await getFolders();
        
        setSavedArticles(articles);
        setFilteredArticles(articles);
        setFolders(userFolders);
        
        // Track this view
        trackActivity('view_saved_articles');
      } catch (err) {
        console.error('Error loading saved content:', err);
        setError('Failed to load your saved articles. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedContent();
  }, []);
  
  // Filter articles based on search and active folder
  useEffect(() => {
    if (savedArticles.length === 0) {
      setFilteredArticles([]);
      return;
    }
    
    let filtered = [...savedArticles];
    
    // Filter by folder if one is selected
    if (activeFolder) {
      filtered = filtered.filter(article => 
        article.folder_id === activeFolder
      );
    }
    
    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => {
        const articleData = article.article || {};
        return (
          articleData.title?.toLowerCase().includes(query) || 
          articleData.summary?.toLowerCase().includes(query) || 
          articleData.tags?.some((tag: string) => tag.toLowerCase().includes(query))
        );
      });
    }
    
    setFilteredArticles(filtered);
  }, [savedArticles, activeFolder, searchQuery]);
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folder = await createFolder(newFolderName.trim());
      setFolders([...folders, folder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
      
      // Track this activity
      trackActivity('create_folder', undefined, { folder_name: newFolderName.trim() });
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Saved Articles</h1>
          <p className="text-muted-foreground">Your library of saved news and insights</p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search saved articles..."
              className="pl-10 pr-4 py-2 bg-muted border border-muted/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          
          {showNewFolderInput ? (
            <div className="flex" style={{ minWidth: '250px' }}>
              <input
                type="text"
                placeholder="Folder name..."
                className="px-3 py-2 bg-muted border border-muted/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <Button
                onClick={handleCreateFolder}
                className="rounded-l-none"
              >
                Create
              </Button>
              <Button
                variant="ghost"
                className="p-2 ml-1"
                onClick={() => setShowNewFolderInput(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              leftIcon={<FolderPlus className="w-4 h-4" />}
              onClick={() => setShowNewFolderInput(true)}
            >
              New Folder
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <GlassCard className="mb-4">
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3">Folders</h3>
              <nav className="space-y-1">
                <FolderItem 
                  name="All Saved" 
                  count={savedArticles.length} 
                  isActive={activeFolder === null}
                  onClick={() => setActiveFolder(null)}
                />
                {folders.map(folder => (
                  <FolderItem 
                    key={folder.id}
                    name={folder.name} 
                    count={savedArticles.filter(a => a.folder_id === folder.id).length} 
                    isActive={activeFolder === folder.id}
                    onClick={() => setActiveFolder(folder.id)}
                  />
                ))}
              </nav>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3">Reading Stats</h3>
              <div className="space-y-3">
                <StatItem label="Total Saved" value={`${savedArticles.length} articles`} />
                <StatItem label="Read" value={`${savedArticles.filter(a => a.is_read).length} articles`} />
                <StatItem label="Unread" value={`${savedArticles.filter(a => !a.is_read).length} articles`} />
                <StatItem label="Folders" value={`${folders.length} folders`} />
              </div>
            </div>
          </GlassCard>
        </div>
        
        <div className="lg:col-span-9 space-y-5">
          {isLoading ? (
            <GlassCard className="p-12 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-slate-200 h-16 w-16 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-slate-200 rounded w-1/4"></div>
              </div>
            </GlassCard>
          ) : error ? (
            <GlassCard className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <X className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium mb-2">Error Loading Articles</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </GlassCard>
          ) : filteredArticles.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <BookmarkCheck className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">{savedArticles.length === 0 ? 'No saved articles yet' : 'No matching articles'}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {savedArticles.length === 0 
                  ? 'Articles you save from your news feed will appear here for easy access later.' 
                  : 'Try adjusting your search or selecting a different folder.'}
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setActiveFolder(null);
              }}>
                {savedArticles.length === 0 ? 'Browse News Feed' : 'Clear Filters'}
              </Button>
            </GlassCard>
          ) : (
            filteredArticles.map((savedItem, index) => {
              const article = savedItem.article || {}; // The joined article data
              return (
                <motion.div
                  key={savedItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <SavedArticleCard 
                    article={{
                      id: savedItem.id,
                      title: article.title || 'Untitled Article',
                      source: article.source || 'Unknown Source',
                      date: new Date(savedItem.saved_at).toLocaleDateString(),
                      summary: article.summary || 'No summary available',
                      image: article.image_url,
                      tags: article.tags || [],
                      folder: folders.find(f => f.id === savedItem.folder_id)?.name,
                      url: article.source_url || '#'
                    }} 
                  />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface FolderItemProps {
  name: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ name, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm ${
      isActive 
        ? 'bg-primary/10 text-primary' 
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
    }`}
  >
    <span>{name}</span>
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      isActive 
        ? 'bg-primary/20' 
        : 'bg-muted'
    }`}>
      {count}
    </span>
  </button>
);

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

interface SavedArticleCardProps {
  article: {
    id: string;
    title: string;
    source: string;
    date: string;
    summary: string;
    image?: string;
    tags: string[];
    folder?: string;
    url: string;
  };
}

const SavedArticleCard: React.FC<SavedArticleCardProps> = ({ article }) => {
  return (
    <GlassCard className="overflow-hidden" hover={true}>
      <div className="p-5">
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <div className="text-sm font-medium text-muted-foreground mr-3">{article.source}</div>
            {article.folder && (
              <div className="text-xs bg-muted/70 px-2 py-0.5 rounded-full">
                {article.folder}
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{article.date}</span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {article.image && (
            <div className="md:w-1/4">
              <div className="rounded-lg overflow-hidden h-40 md:h-32">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          
          <div className={article.image ? "md:w-3/4" : "w-full"}>
            <h2 className="text-lg font-bold mb-2">{article.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{article.summary}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground">
                  <Trash className="w-4 h-4" />
                </button>
                
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                
                <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// Dummy saved articles
const savedArticles = [
  {
    id: '1',
    title: 'Bitcoin ETF Approval Sparks Institutional Investment Surge',
    source: 'CryptoWire',
    date: 'Saved 2 hours ago',
    summary: 'The recent approval of Bitcoin ETFs has led to a significant increase in institutional investments, with over $2 billion flowing into crypto markets within the first week.',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=2069&auto=format&fit=crop',
    tags: ['Bitcoin', 'ETF', 'Institutional'],
    folder: 'Market Analysis',
    url: '#',
  },
  {
    id: '3',
    title: 'Major Upgrade to Ethereum Layer 2 Solution Reduces Fees by 80%',
    source: 'Blockchain Report',
    date: 'Saved 8 hours ago',
    summary: `A significant upgrade to one of Ethereum's leading Layer 2 solutions has resulted in an 80% reduction in transaction fees while maintaining security guarantees.`,
    image: 'https://images.unsplash.com/photo-1639152201720-5e536d254d81?q=80&w=1332&auto=format&fit=crop',
    tags: ['Ethereum', 'Layer 2', 'Scaling'],
    folder: 'Technology',
    url: '#',
  },
  {
    id: '4',
    title: 'SEC Commissioner Suggests New Framework for Crypto Regulation',
    source: 'Regulatory Watch',
    date: 'Saved 12 hours ago',
    summary: `A commissioner from the Securities and Exchange Commission has proposed a new framework for cryptocurrency regulation, potentially signaling a shift in the agency's approach.`,
    tags: ['Regulation', 'SEC', 'Policy'],
    folder: 'Regulation',
    url: '#',
  },
  {
    id: '5',
    title: 'NFT Market Shows Signs of Recovery with Trading Volume Up 40%',
    source: 'NFT Pulse',
    date: 'Saved 1 day ago',
    summary: 'After months of declining activity, the NFT market is showing significant signs of recovery with trading volumes increasing by 40% month-over-month across major marketplaces.',
    image: 'https://images.unsplash.com/photo-1671226366526-6d5ca7f3f3b0?q=80&w=1974&auto=format&fit=crop',
    tags: ['NFT', 'Market Recovery', 'Trading'],
    folder: 'Market Analysis',
    url: '#',
  },
  {
    id: '6',
    title: 'Cross-Chain Bridge Security Protocols Get Major Overhaul',
    source: 'Security Watch',
    date: 'Saved 2 days ago',
    summary: 'Following several high-profile exploits, major cross-chain bridges are implementing enhanced security protocols to protect user funds and improve resilience against attacks.',
    tags: ['Security', 'Cross-Chain', 'Infrastructure'],
    folder: 'Technology',
    url: '#',
  },
  {
    id: '7',
    title: 'New Global Crypto Regulations Expected Following G20 Summit',
    source: 'Global Finance',
    date: 'Saved a week ago',
    summary: 'Leaders at the G20 Summit have agreed on a framework for coordinated cryptocurrency regulation, with implementation expected across major economies within the next six months.',
    tags: ['Regulation', 'Global', 'G20'],
    folder: 'Regulation',
    url: '#',
  },
  {
    id: '8',
    title: 'Decentralized Finance TVL Reaches New All-Time High of $250B',
    source: 'DeFi Metrics',
    date: 'Saved a week ago',
    summary: 'The total value locked in DeFi protocols has reached a new all-time high of $250 billion, marking a significant milestone for the sector and indicating growing adoption.',
    tags: ['DeFi', 'TVL', 'Growth'],
    folder: 'Market Analysis',
    url: '#',
  },
];
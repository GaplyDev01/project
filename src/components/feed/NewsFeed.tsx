import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bitcoin, Bookmark, BookmarkCheck, Calendar, Coffee, ExternalLink, 
  Filter, MoreHorizontal, RefreshCw, Search, Zap 
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  fetchPersonalizedNews, 
  saveArticle, 
  getSavedArticles, 
  trackActivity,
  type NewsArticle
} from '../../services/newsService';

export const NewsFeed: React.FC = () => {
  const { profile: onboardingProfile } = useOnboardingStore();
  const { profile: userProfile } = useAuthStore();
  const [savedArticleIds, setSavedArticleIds] = React.useState<string[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use either the user profile from auth store or the onboarding profile
  const profile = userProfile || onboardingProfile;
  
  // Load articles from Supabase
  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load personalized news from our edge function
        const newsArticles = await fetchPersonalizedNews();
        setArticles(newsArticles);
        setFilteredArticles(newsArticles);
        
        // Track this activity
        trackActivity('view_news_feed');
      } catch (err) {
        console.error('Error loading news:', err);
        setError('Failed to load news articles. Please try again later.');
        
        // If we can't load news, use empty array to avoid errors
        setArticles([]);
        setFilteredArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Load saved articles to know which ones are saved
    const loadSavedArticles = async () => {
      try {
        const saved = await getSavedArticles();
        setSavedArticleIds(saved.map(item => item.article_id));
      } catch (err) {
        console.error('Error loading saved articles:', err);
        // Don't set error state here to avoid disrupting the feed view
      }
    };
    
    loadNews();
    loadSavedArticles();
  }, []);
  
  // Filter articles based on search query
  useEffect(() => {
    if (!articles.length) return;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(query) || 
        article.summary.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
      setFilteredArticles(filtered);
      
      // Track search activity
      trackActivity('search_news', undefined, { query: searchQuery });
    } else {
      // If no search query, use the already personalized articles
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);
  
  const toggleSave = async (id: string) => {
    try {
      if (savedArticleIds.includes(id)) {
        // TODO: Implement unsave functionality
        // For now, just update the UI state
        setSavedArticleIds(savedArticleIds.filter(item => item !== id));
      } else {
        // Save the article to the user's saved articles
        await saveArticle(id);
        setSavedArticleIds([...savedArticleIds, id]);
        
        // Track this activity
        trackActivity('save_article', id);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setError('Failed to save article. Please try again.');
      // The error will clear on the next action
      setTimeout(() => setError(null), 3000);
    }
  };
  
  const refreshFeed = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const freshNews = await fetchPersonalizedNews();
      setArticles(freshNews);
      setFilteredArticles(freshNews);
      
      // Track refresh activity
      trackActivity('refresh_news_feed');
    } catch (err) {
      console.error('Error refreshing news:', err);
      setError('Failed to refresh news. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Your Intelligence Feed</h1>
          <p className="text-muted-foreground">
            Personalized crypto news and insights based on your intelligence profile
          </p>
        </div>
        
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-muted border border-muted/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          
          <Button
            variant="outline"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filter
          </Button>
          
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={refreshFeed}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Feed'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mt-4 mb-2">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6">
        <div className="lg:col-span-7 space-y-6">
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
          ) : filteredArticles.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Coffee className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                No articles matching your criteria were found. Try adjusting your search or check back later.
              </p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </GlassCard>
          ) : (
            filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <NewsCard 
                  article={{
                    id: article.id,
                    title: article.title,
                    source: article.source,
                    date: new Date(article.published_date).toLocaleDateString(),
                    summary: article.summary,
                    image: article.image_url,
                    tags: article.tags,
                    url: article.source_url,
                    score: article.relevance_score
                  }} 
                  isSaved={savedArticleIds.includes(article.id)}
                  onToggleSave={() => toggleSave(article.id)}
                />
              </motion.div>
            ))
          )}
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <GlassCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Your Intelligence Profile</h3>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              
              <div className="space-y-3">
                <ProfileItem 
                  label="Market Focus" 
                  value={profile?.market_preference === 'crypto' || profile?.marketPreference === 'crypto' 
                    ? 'Cryptocurrency' 
                    : 'Markets'} 
                />
                
                <ProfileItem 
                  label="Top Interests" 
                  value={(profile?.interests || []).slice(0, 3).join(', ') || 'None specified'} 
                />
                
                <ProfileItem 
                  label="Monitored Entities" 
                  value={`${(profile?.competitors || []).length} entities`} 
                />
                
                <div className="pt-3 mt-3 border-t border-muted/20">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    leftIcon={<Zap className="w-4 h-4" />}
                  >
                    Recalibrate Intelligence
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-4">
              <h3 className="font-medium mb-4">Market Pulse</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bitcoin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Bitcoin</div>
                    <div className="text-xs text-success">+2.4% ($63,245)</div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-muted/20">
                  <div className="text-sm font-medium mb-2">Trending Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {['ETF Approval', 'Regulation', 'Layer 2'].map((topic, i) => (
                      <div key={i} className="text-xs bg-muted/50 px-2 py-1 rounded-full">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="p-4">
              <h3 className="font-medium mb-4">Daily Briefing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get a daily summary of the most important crypto developments
              </p>
              <Button 
                className="w-full"
                leftIcon={<Coffee className="w-4 h-4" />}
              >
                Generate Briefing
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

interface ProfileItemProps {
  label: string;
  value: string;
}

const ProfileItem: React.FC<ProfileItemProps> = ({ label, value }) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="text-sm">{value}</div>
  </div>
);

interface NewsCardProps {
  article: {
    id: string;
    title: string;
    source: string;
    date: string;
    summary: string;
    image?: string;
    tags: string[];
    url: string;
    score?: number;
  };
  isSaved: boolean;
  onToggleSave: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, isSaved, onToggleSave }) => {
  return (
    <GlassCard className="overflow-hidden" hover={true}>
      <div className="p-5">
        <div className="flex justify-between mb-2">
          <div className="flex items-center">
            <div className="text-sm font-medium text-muted-foreground">{article.source}</div>
            {article.score && article.score > 8 && (
              <div className="ml-2 bg-primary/20 text-primary px-2 py-0.5 text-xs rounded-full">
                High Relevance
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
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden h-40 md:h-28">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          
          <div className={article.image ? "md:w-2/3" : "w-full"}>
            <h2 className="text-lg font-bold mb-2">{article.title}</h2>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.summary}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onToggleSave} 
                  className={`p-1.5 rounded-full hover:bg-muted ${isSaved ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
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

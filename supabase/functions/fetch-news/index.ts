// fetch-news.js - Scheduled function to fetch crypto news from external APIs
// Using ESM import to avoid TypeScript errors locally
// This will still work with Deno which supports both formats
// @ts-ignore: ESM imports are resolved by Deno at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Add TypeScript declaration for Deno namespace in development
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// News API sources (configure with your preferred APIs)
const NEWS_SOURCES = [
  { 
    url: 'https://api.cryptopanic.com/v1/posts/', 
    apiKey: Deno.env.get('CRYPTOPANIC_API_KEY'),
    type: 'cryptopanic'
  },
  { 
    url: 'https://newsapi.org/v2/everything?q=crypto', 
    apiKey: Deno.env.get('NEWSAPI_API_KEY'),
    type: 'newsapi'
  },
  { 
    url: 'https://data-api.coindesk.com/news/v1/article/list?lang=EN&limit=20', 
    apiKey: null,
    type: 'coindesk'
  }
]

export async function handler(): Promise<{ statusCode: number; body: string; }> {
  try {
    for (const source of NEWS_SOURCES) {
      try {
        // Fetch news from the source
        let apiUrl;
        
        switch(source.type) {
          case 'cryptopanic':
            apiUrl = `${source.url}?auth_token=${source.apiKey}`;
            break;
          case 'newsapi':
            // NewsAPI.org - check if URL already has query parameters
            const separator = source.url.includes('?') ? '&' : '?';
            apiUrl = `${source.url}${separator}apiKey=${source.apiKey}`;
            break;
          case 'coindesk':
            // Coindesk API doesn't need an API key
            apiUrl = source.url;
            break;
          default:
            // Generic fallback
            if (source.apiKey) {
              const separator = source.url.includes('?') ? '&' : '?';
              apiUrl = `${source.url}${separator}apiKey=${source.apiKey}`;
            } else {
              apiUrl = source.url;
            }
        }
        
        console.log(`Fetching news from: ${apiUrl}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process and insert the articles
        const articles = processArticles(data, source.type);
      
        for (const article of articles) {
          // Check if article already exists to avoid duplicates
          const { data: existingArticle } = await supabase
            .from('news_articles')
            .select('id')
            .eq('title', article.title)
            .eq('source', article.source);
          
          if (!existingArticle || existingArticle.length === 0) {
            const { error: insertError } = await supabase
              .from('news_articles')
              .insert([article]);
            if (insertError) {
              console.error('Error inserting article:', insertError);
            }
          }
        }
      } catch (sourceError) {
        // Log error but continue with next source
        console.error(`Error fetching news from ${source.type}:`, sourceError);
      }
    }
    
    return { statusCode: 200, body: 'News fetched successfully' };
  } catch (error) {
    console.error('Error fetching news:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}

function processArticles(data: any, sourceType: string): Array<Record<string, any>> {
  // Implementation depends on the specific API response format
  try {
    if (sourceType === 'cryptopanic') {
      if (!data.results || !Array.isArray(data.results)) {
        console.error('Invalid CryptoPanic response format');
        return [];
      }
      
      return data.results.map(item => ({
        title: item.title,
        source: item.source?.title || 'CryptoPanic',
        source_url: item.url,
        published_date: item.published_at,
        summary: item.metadata?.description || 'No description available',
        content: item.metadata?.content || null,
        image_url: item.metadata?.image || null,
        tags: item.currencies?.map(c => c.title) || []
      }));
    } else if (sourceType === 'newsapi') {
      if (!data.articles || !Array.isArray(data.articles)) {
        console.error('Invalid NewsAPI response format');
        return [];
      }
      
      return data.articles.map(item => ({
        title: item.title,
        source: item.source?.name || 'NewsAPI',
        source_url: item.url,
        published_date: item.publishedAt,
        summary: item.description || 'No description available',
        content: item.content || null,
        image_url: item.urlToImage || null,
        tags: extractKeywords(item.title + ' ' + (item.description || ''))
      }));
    } else if (sourceType === 'coindesk') {
      if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid Coindesk response format');
        return [];
      }
      
      return data.data.map(item => ({
        title: item.headline || item.title,
        source: 'CoinDesk',
        source_url: item.url || `https://www.coindesk.com${item.slug}`,
        published_date: item.published || item.createdAt,
        summary: item.description || item.summary || 'No description available',
        content: item.body || null,
        image_url: item.leadImage?.url || item.thumbnail?.url || null,
        tags: item.tags?.map(tag => tag.name || tag) || extractKeywords(item.headline || '')
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error processing articles from ${sourceType}:`, error);
    return [];
  }
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction
  const cryptoKeywords = ['bitcoin', 'ethereum', 'blockchain', 'crypto', 'defi', 'nft', 'token']
  const matches: string[] = []
  
  cryptoKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      matches.push(keyword)
    }
  })
  
  return [...new Set(matches)] // Remove duplicates
}

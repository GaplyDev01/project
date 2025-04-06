// personalize-news.js - Edge function to calculate relevance scores for news articles based on user profiles
// Using ESM import to avoid TypeScript errors locally
// This will still work with Deno which supports both formats
// @ts-ignore: ESM imports are resolved by Deno at runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Add TypeScript declaration for Deno namespace in development
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

export async function handler(req) {
  const headers = { 'Content-Type': 'application/json' };
  let userId;
  
  // Safely parse the request body
  try {
    const body = JSON.parse(req.body);
    userId = body.userId;
  } catch (error) {
    console.error('Error parsing request body:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid JSON in request body'
      })
    };
  }
  
  // Validate userId
  if (!userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Missing required parameter: userId'
      })
    };
  }
  
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Supabase credentials are not properly configured'
      })
    };
  }
  
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError) throw new Error(`Failed to fetch user profile: ${profileError.message}`)
    
    if (!profile) {
      throw new Error(`User profile not found for ID: ${userId}`)
    }
    
    // Get recent news articles
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(100)
    
    if (articlesError) throw new Error(`Failed to fetch news articles: ${articlesError.message}`)
    
    if (!articles || articles.length === 0) {
      console.log('No articles found to personalize')
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          articles: []
        })
      }
    }
    
    // Calculate relevance scores based on user interests and keywords
    const userKeywords = [
      ...(profile.interests || []),
      ...(profile.extracted_keywords || []),
      ...(profile.competitors || [])
    ].map(kw => kw.toLowerCase())
    
    // Score articles based on keyword matches
    const scoredArticles = articles.map(article => {
      try {
        let score = 0
        // Safely access title with fallback
        const title = (article.title || '').toLowerCase()
        // Safely access summary with fallback
        const summary = (article.summary || '').toLowerCase()
        
        userKeywords.forEach(keyword => {
          if (title.includes(keyword)) score += 3
          if (summary.includes(keyword)) score += 2
          // Check if tags exist and is an array before using .some()
          if (article.tags && Array.isArray(article.tags) && 
              article.tags.some(tag => tag && typeof tag === 'string' && tag.toLowerCase() === keyword)) {
            score += 5
          }
        })
        
        return {
          ...article,
          relevance_score: score
        }
      } catch (scoreError) {
        console.error(`Error scoring article ${article.id || 'unknown'}:`, scoreError)
        // Return article with zero score if scoring fails
        return {
          ...article,
          relevance_score: 0
        }
      }
    })
    
    // Sort by relevance score and handle potential undefined scores
    scoredArticles.sort((a, b) => {
      const scoreA = typeof a.relevance_score === 'number' ? a.relevance_score : 0
      const scoreB = typeof b.relevance_score === 'number' ? b.relevance_score : 0
      return scoreB - scoreA
    })
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        articles: scoredArticles
      })
    }
  } catch (error) {
    console.error('Error personalizing news:', error)
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Unknown error occurred when personalizing news',
        timestamp: new Date().toISOString()
      }) 
    }
  }
}

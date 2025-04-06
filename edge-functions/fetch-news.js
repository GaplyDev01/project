// fetch-news.js - Scheduled function to fetch crypto news from external APIs
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// News API sources (configure with your preferred APIs)
const NEWS_SOURCES = [
  { url: 'https://api.cryptopanic.com/v1/posts/', apiKey: 'YOUR_API_KEY' },
  { url: 'https://newsapi.org/v2/everything?q=crypto', apiKey: 'YOUR_API_KEY' }
]

export async function handler() {
  try {
    for (const source of NEWS_SOURCES) {
      // Fetch news from the source
      const response = await fetch(`${source.url}&apiKey=${source.apiKey}`)
      const data = await response.json()
      
      // Process and insert the articles
      const articles = processArticles(data, source.url)
      
      for (const article of articles) {
        // Check if article already exists to avoid duplicates
        const { data: existingArticle } = await supabase
          .from('news_articles')
          .select('id')
          .eq('title', article.title)
          .eq('source', article.source)
        
        if (!existingArticle || existingArticle.length === 0) {
          await supabase
            .from('news_articles')
            .insert([article])
        }
      }
    }
    
    return { statusCode: 200, body: 'News fetched successfully' }
  } catch (error) {
    console.error('Error fetching news:', error)
    return { statusCode: 500, body: error.message }
  }
}

function processArticles(data, sourceUrl) {
  // Implementation depends on the specific API response format
  if (sourceUrl.includes('cryptopanic')) {
    return data.results.map(item => ({
      title: item.title,
      source: item.source.title,
      source_url: item.url,
      published_date: item.published_at,
      summary: item.metadata?.description || 'No description available',
      content: item.metadata?.content || null,
      image_url: item.metadata?.image || null,
      tags: item.currencies?.map(c => c.title) || []
    }))
  } else if (sourceUrl.includes('newsapi')) {
    return data.articles.map(item => ({
      title: item.title,
      source: item.source.name,
      source_url: item.url,
      published_date: item.publishedAt,
      summary: item.description || 'No description available',
      content: item.content || null,
      image_url: item.urlToImage || null,
      tags: extractKeywords(item.title + ' ' + item.description)
    }))
  }
  return []
}

function extractKeywords(text) {
  // Simple keyword extraction
  const cryptoKeywords = ['bitcoin', 'ethereum', 'blockchain', 'crypto', 'defi', 'nft', 'token']
  const matches = []
  
  cryptoKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      matches.push(keyword)
    }
  })
  
  return [...new Set(matches)] // Remove duplicates
}

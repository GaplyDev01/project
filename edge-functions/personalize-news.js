// personalize-news.js - Edge function to calculate relevance scores for news articles based on user profiles
import { createClient } from '@supabase/supabase-js'

export async function handler(req) {
  const { userId } = JSON.parse(req.body)
  
  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (profileError) throw profileError
    
    // Get recent news articles
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_date', { ascending: false })
      .limit(100)
    
    if (articlesError) throw articlesError
    
    // Calculate relevance scores based on user interests and keywords
    const userKeywords = [
      ...(profile.interests || []),
      ...(profile.extracted_keywords || []),
      ...(profile.competitors || [])
    ].map(kw => kw.toLowerCase())
    
    // Score articles based on keyword matches
    const scoredArticles = articles.map(article => {
      let score = 0
      const title = article.title.toLowerCase()
      const summary = article.summary.toLowerCase()
      
      userKeywords.forEach(keyword => {
        if (title.includes(keyword)) score += 3
        if (summary.includes(keyword)) score += 2
        if (article.tags.some(tag => tag.toLowerCase() === keyword)) score += 5
      })
      
      return {
        ...article,
        relevance_score: score
      }
    })
    
    // Sort by relevance score
    scoredArticles.sort((a, b) => b.relevance_score - a.relevance_score)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        articles: scoredArticles
      })
    }
  } catch (error) {
    console.error('Error personalizing news:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

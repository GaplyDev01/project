// extract-keywords.js - Edge function to analyze a user's interests and narrative to extract relevant keywords
import { createClient } from '@supabase/supabase-js'

export async function handler(req) {
  const { userId, narrative } = JSON.parse(req.body)
  
  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Extract keywords from narrative using NLP techniques
    const extractedKeywords = extractKeywordsFromText(narrative)
    
    // Update user profile with extracted keywords
    const { error } = await supabase
      .from('profiles')
      .update({ extracted_keywords: extractedKeywords })
      .eq('id', userId)
    
    if (error) throw error
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        keywords: extractedKeywords
      })
    }
  } catch (error) {
    console.error('Error extracting keywords:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

function extractKeywordsFromText(text) {
  // Simplified keyword extraction algorithm
  const words = text.toLowerCase().split(/\W+/)
  const stopWords = ['the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as']
  const filteredWords = words.filter(word => 
    word.length > 3 && !stopWords.includes(word)
  )
  
  // Count word frequencies
  const wordFreq = {}
  filteredWords.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })
  
  // Get top keywords
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

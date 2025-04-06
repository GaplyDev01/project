// extract-keywords.js - Edge function to extract keywords from user narratives
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

export async function handler(req: { body: string }) {
  // Set response headers for JSON
  const headers = {
    'Content-Type': 'application/json'
  };
  // Parse JSON safely
  let parsedBody;
  try {
    parsedBody = JSON.parse(req.body);
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid JSON in request body',
        details: parseError.message
      })
    };
  }
  // Extract fields with support for both narrative and text fields
  const { userId, narrative, text } = parsedBody;
  const textContent = narrative || text;
  // Validate required parameters
  if (!userId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Missing required parameter',
        details: 'userId is required to update profile with keywords'
      })
    };
  }
  if (!textContent) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Missing required parameter',
        details: 'Either "narrative" or "text" field is required'
      })
    };
  }
  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  try {
    // Extract keywords from narrative using NLP techniques
    const extractedKeywords = extractKeywordsFromText(textContent);
    // Validate keywords before updating database
    const validKeywords = Array.isArray(extractedKeywords) ? extractedKeywords.filter((k)=>typeof k === 'string') : [];
    console.log('Validated keywords:', validKeywords);
    // Update user profile with extracted keywords
    const { error } = await supabase.from('profiles').update({
      extracted_keywords: validKeywords
    }).eq('id', userId);
    if (error) {
      console.error('Database update error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database error',
          details: `Failed to update user profile: ${error.message}`,
          keywords: validKeywords // Still return keywords even if update failed
        })
      };
    }
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        keywords: validKeywords,
        profile_updated: true
      })
    };
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Keyword extraction failed',
        details: error.message || 'Unknown error occurred'
      })
    };
  }
}

function extractKeywordsFromText(text: string): string[] {
  // Validate input
  if (!text || typeof text !== 'string') {
    console.warn('Invalid text provided for keyword extraction');
    return []; // Return empty array for invalid input
  }
  // Simplified keyword extraction algorithm
  // Clean text (remove non-printable characters)
  const cleanText = text.replace(/[^\x20-\x7E]/g, ' ').toLowerCase();
  const words = cleanText.split(/\W+/);
  const stopWords = [
    'the',
    'and',
    'or',
    'a',
    'an',
    'in',
    'on',
    'at',
    'to',
    'for',
    'with',
    'by',
    'about',
    'as',
    'is',
    'was',
    'were',
    'be',
    'been',
    'are',
    'this',
    'that',
    'it'
  ];
  // Filter words
  const filteredWords = words.filter((word)=>word.length > 3 && !stopWords.includes(word) && !/^\d+$/.test(word));
  // Count word frequencies
  const wordFreq: Record<string, number> = {};
  filteredWords.forEach((word)=>{
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  // Get top keywords
  const sortedKeywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word as string);  // Add type assertion for TypeScript
  console.log('Extracted keywords:', sortedKeywords);
  return sortedKeywords;
}

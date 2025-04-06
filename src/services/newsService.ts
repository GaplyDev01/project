import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  source_url: string;
  published_date: string;
  fetch_date: string;
  summary: string;
  content?: string;
  image_url?: string;
  tags: string[];
  relevance_score: number;
}

export interface SavedArticle {
  id: string;
  user_id: string;
  article_id: string;
  folder_id?: string;
  saved_at: string;
  is_read: boolean;
  notes?: string;
  article?: NewsArticle;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

/**
 * Fetches personalized news using the personalize-news edge function
 */
export async function fetchPersonalizedNews() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('personalize-news', {
      body: JSON.stringify({ userId: user.id }),
    });
    
    if (error) throw error;
    return data.articles as NewsArticle[];
  } catch (error) {
    console.error('Error fetching personalized news:', error);
    throw error;
  }
}

/**
 * Extracts keywords from user narrative using extract-keywords edge function
 */
export async function extractKeywords(narrative: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { data, error } = await supabase.functions.invoke('extract-keywords', {
      body: JSON.stringify({ userId: user.id, narrative }),
    });
    
    if (error) throw error;
    return data.keywords as string[];
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw error;
  }
}

/**
 * Saves an article to the user's saved articles
 */
export async function saveArticle(articleId: string, folderId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { data, error } = await supabase
      .from('saved_articles')
      .insert({
        user_id: user.id,
        article_id: articleId,
        folder_id: folderId,
        is_read: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as SavedArticle;
  } catch (error) {
    console.error('Error saving article:', error);
    throw error;
  }
}

/**
 * Gets the user's saved articles
 */
export async function getSavedArticles() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { data, error } = await supabase
      .from('saved_articles')
      .select('*, article:article_id(*)') // Join with the articles table
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data as SavedArticle[];
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    throw error;
  }
}

/**
 * Creates a new folder for organizing saved articles
 */
export async function createFolder(name: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Folder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
}

/**
 * Gets the user's folders
 */
export async function getFolders() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  try {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data as Folder[];
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
}

/**
 * Tracks user activity for analytics
 */
export async function trackActivity(activityType: string, articleId?: string, metadata: any = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return; // Silently fail for non-authenticated users
  
  try {
    await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        article_id: articleId,
        metadata
      });
  } catch (error) {
    console.error('Error tracking activity:', error);
    // Don't throw here to prevent UI disruption
  }
}

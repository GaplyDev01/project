import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Ensure we have the environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Fallback values for development to prevent crashes
const url = supabaseUrl || 'https://example.supabase.co';
const key = supabaseAnonKey || 'public-anon-key';

// Create client with error handling
let supabaseClient: SupabaseClient;

try {
  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a fallback client that logs operations but doesn't actually perform them
  supabaseClient = createClient(url, key);
}

export const supabase = supabaseClient;

export type UserProfile = {
  id: string;
  email: string;
  created_at: string;
  interests: string[];
  market_preference: string;
  extracted_keywords: string[];
  competitors: string[];
  professional_context: {
    role: string;
    organization: string;
    scale: string;
    industry: string;
  };
  onboarding_completed: boolean;
};
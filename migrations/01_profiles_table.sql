-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interests TEXT[] DEFAULT '{}',
  market_preference TEXT DEFAULT 'crypto',
  extracted_keywords TEXT[] DEFAULT '{}',
  competitors TEXT[] DEFAULT '{}',
  professional_context JSONB DEFAULT '{"role": "", "organization": "", "scale": "", "industry": ""}',
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profile access
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL,
  fetch_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  summary TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  relevance_score INTEGER DEFAULT 0
);

-- Set up Row Level Security
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "News articles are publicly viewable"
  ON public.news_articles FOR SELECT
  TO authenticated
  USING (true);

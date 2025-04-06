-- Create saved_articles table
CREATE TABLE IF NOT EXISTS public.saved_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.news_articles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  notes TEXT,
  UNIQUE(user_id, article_id)
);

-- Set up Row Level Security
ALTER TABLE public.saved_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for saved articles
CREATE POLICY "Users can view their saved articles"
  ON public.saved_articles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their saved articles"
  ON public.saved_articles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved articles"
  ON public.saved_articles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved articles"
  ON public.saved_articles FOR DELETE
  USING (auth.uid() = user_id);

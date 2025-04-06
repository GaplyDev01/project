-- Create user_activity table
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  article_id UUID REFERENCES public.news_articles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Set up Row Level Security
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for user activity
CREATE POLICY "Users can view their activity"
  ON public.user_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their activity"
  ON public.user_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

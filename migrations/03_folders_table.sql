-- Create folders table
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Set up Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create policies for folders
CREATE POLICY "Users can view their folders"
  ON public.folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their folders"
  ON public.folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their folders"
  ON public.folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their folders"
  ON public.folders FOR DELETE
  USING (auth.uid() = user_id);

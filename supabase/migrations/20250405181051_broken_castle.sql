/*
  # Update profiles table configuration safely

  This migration creates the profiles table if it doesn't exist yet and sets up policies
  with proper existence checks to prevent errors when reapplying.

  1. Table Structure
    - `profiles` table with fields for user data and preferences
  
  2. Security
    - Enable RLS on profiles table
    - Create policies conditionally to avoid conflicts with existing policies
  
  3. Automation
    - Create trigger to automatically generate user profiles on signup
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  interests TEXT[] DEFAULT '{}',
  market_preference TEXT,
  extracted_keywords TEXT[] DEFAULT '{}',
  competitors TEXT[] DEFAULT '{}',
  professional_context JSONB DEFAULT '{}'::jsonb,
  onboarding_completed BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies conditionally to avoid errors if they already exist
DO $$
BEGIN
  -- Check if "Users can read own profile" policy exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Check if "Users can update own profile" policy exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  -- Check if "Users can insert own profile" policy exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create or replace function for creating user profiles
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'create_profile_on_signup'
  ) THEN
    CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
  END IF;
END $$;
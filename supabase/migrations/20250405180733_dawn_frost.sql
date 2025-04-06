/*
  # Create profiles table and setup RLS

  1. New Tables
    - `profiles` 
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `created_at` (timestamptz)
      - `interests` (text[])
      - `market_preference` (text)
      - `extracted_keywords` (text[])
      - `competitors` (text[])
      - `professional_context` (jsonb)
      - `onboarding_completed` (boolean)
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to read and update their own data
*/

-- Create profiles table
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

-- Create policy for users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create trigger to create profile on signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to execute function on user signup
CREATE TRIGGER create_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();
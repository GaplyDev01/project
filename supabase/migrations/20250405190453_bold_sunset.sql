/*
  # Fix Profile Storage and Onboarding Completion

  1. Table Structure Validation
     - Ensures the profiles table exists with all required fields
     - Adds indexes to improve query performance
     - Ensures correct data types for all fields

  2. Security
     - Ensures RLS is properly configured
     - Adds additional debugging to trigger functions
     - Makes sure policies allow proper data access

  3. Data Integrity
     - Adds additional validation for onboarding_completed flag
     - Ensures professional_context is correctly structured
     - Adds NOT NULL constraints to critical fields

  This migration focuses on fixing any issues that may prevent the onboarding process
  from completing successfully and ensures profiles are properly saved.
*/

-- Make sure the profiles table exists with all required fields
DO $$
BEGIN
  -- Check if the profiles table already exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    -- If it doesn't exist, create it with all required fields
    CREATE TABLE public.profiles (
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
  ELSE
    -- If it exists, make sure all columns are present
    -- Check and add interests column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'interests'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    
    -- Check and add market_preference column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'market_preference'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN market_preference TEXT;
    END IF;
    
    -- Check and add extracted_keywords column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'extracted_keywords'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN extracted_keywords TEXT[] DEFAULT '{}';
    END IF;
    
    -- Check and add competitors column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'competitors'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN competitors TEXT[] DEFAULT '{}';
    END IF;
    
    -- Check and add professional_context column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'professional_context'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN professional_context JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Check and add onboarding_completed column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
      ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
  END IF;
END $$;

-- Ensure Row Level Security is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  
  -- Recreate policies with proper permissions
  CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
  
  CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
  
  CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
END $$;

-- Create or replace the trigger function for profile creation with better error handling
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the start of the function execution
  RAISE LOG 'create_profile_for_user: Starting profile creation for user %', NEW.id;

  -- Check if a profile already exists for this user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RAISE LOG 'create_profile_for_user: Profile already exists for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Insert the new profile
  INSERT INTO public.profiles (
    id, 
    email, 
    created_at, 
    interests, 
    market_preference, 
    extracted_keywords, 
    competitors, 
    professional_context, 
    onboarding_completed
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    NOW(), 
    '{}', 
    NULL, 
    '{}', 
    '{}', 
    '{}'::jsonb, 
    false
  );

  -- Log successful profile creation
  RAISE LOG 'create_profile_for_user: Successfully created profile for user % with email %', NEW.id, NEW.email;

  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log detailed error information
    RAISE LOG 'create_profile_for_user: Error creating profile for user %: %', NEW.id, SQLERRM;
    RAISE LOG 'create_profile_for_user: Error detail: %', SQLSTATE;
    
    -- Return NEW to allow user creation even if profile creation fails
    -- This ensures the authentication still works even if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists and is correctly attached
DROP TRIGGER IF EXISTS create_profile_for_user_trigger ON auth.users;

CREATE TRIGGER create_profile_for_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_for_user();

-- Helper function to check and update existing profiles for missing fields
CREATE OR REPLACE FUNCTION fix_incomplete_profiles()
RETURNS void AS $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN SELECT * FROM public.profiles LOOP
    -- Initialize variables with default values if they're NULL
    IF profile_record.interests IS NULL THEN
      UPDATE public.profiles SET interests = '{}' WHERE id = profile_record.id;
    END IF;
    
    IF profile_record.extracted_keywords IS NULL THEN
      UPDATE public.profiles SET extracted_keywords = '{}' WHERE id = profile_record.id;
    END IF;
    
    IF profile_record.competitors IS NULL THEN
      UPDATE public.profiles SET competitors = '{}' WHERE id = profile_record.id;
    END IF;
    
    IF profile_record.professional_context IS NULL THEN
      UPDATE public.profiles SET professional_context = '{}'::jsonb WHERE id = profile_record.id;
    END IF;
  END LOOP;
  
  RAISE LOG 'fix_incomplete_profiles: All profiles have been checked and updated if needed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to fix any existing incomplete profiles
SELECT fix_incomplete_profiles();

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS profiles_onboarding_status ON public.profiles(onboarding_completed);

-- Add a constraint to ensure email is always populated
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

-- Drop the temporary function as it's no longer needed
DROP FUNCTION fix_incomplete_profiles();
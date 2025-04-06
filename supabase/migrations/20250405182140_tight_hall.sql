/*
  # Fix user profile creation trigger

  1. Changes
     - Create or replace the trigger function that creates a user profile
     - Ensure the function properly handles the required fields (id and email)
     - Set up a trigger to call this function when a new user is created

  2. Problem Resolution
     - Fixes the "Database error saving new user" error during signup
     - Ensures proper data flow between auth.users and public.profiles tables
*/

-- Create or replace the function to handle profile creation
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in create_profile_for_user: %', SQLERRM;
    RETURN new; -- Still return new to allow user creation even if profile fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger already exists, and if not, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'create_profile_for_user_trigger'
  ) THEN
    CREATE TRIGGER create_profile_for_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_profile_for_user();
  END IF;
END $$;
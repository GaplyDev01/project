-- First, explicitly set the search path for this session
SET search_path TO public, '';

-- Then create the function with fixed search path in its body
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_uuid UUID, display_name TEXT, avatar_url TEXT DEFAULT NULL, bio TEXT DEFAULT NULL)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Explicitly set search path within function to mitigate injection risks
    PERFORM set_config('search_path', 'public, ""', false);
    
    -- Insert the new profile
    INSERT INTO profiles (
        user_id,
        display_name,
        avatar_url,
        bio,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        display_name,
        avatar_url,
        bio,
        NOW(),
        NOW()
    )
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Profile already exists for user %', user_uuid;
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION 'User with ID % does not exist', user_uuid;
    WHEN others THEN
        RAISE EXCEPTION 'Error creating profile: %', SQLERRM;
END;
$$;

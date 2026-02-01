-- Fix the trigger to prevent duplicate user creation by email
-- Run this in Supabase SQL Editor for BOTH local and production projects

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a new function that only creates users if email doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user with this email already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE email = NEW.email) THEN
    -- User with this email exists, don't create duplicate
    RAISE NOTICE 'User with email % already exists, skipping profile creation', NEW.email;
    RETURN NEW;
  END IF;
  
  -- Only create user if email doesn't exist in our system
  -- This prevents duplicate accounts when signing in with OAuth
  INSERT INTO public.users (id, email, name, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.app_metadata->>'provider', 'email')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Result
SELECT 'Trigger updated! Users with existing emails will not be auto-created.' as status;

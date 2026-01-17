-- Proper RLS fix using service role bypass for initial profile creation
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create new policies
-- Allow anyone to read profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert (for server-side operations)
CREATE POLICY "Service role can insert profiles" 
  ON profiles FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

-- Fix influencer_details policies
DROP POLICY IF EXISTS "Influencer details viewable by everyone" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can update own details" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can insert own details" ON influencer_details;

CREATE POLICY "Influencer details viewable by everyone" 
  ON influencer_details FOR SELECT 
  USING (true);

CREATE POLICY "Influencers can insert own details" 
  ON influencer_details FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert influencer details" 
  ON influencer_details FOR INSERT 
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Influencers can update own details" 
  ON influencer_details FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix brand_details policies
DROP POLICY IF EXISTS "Brands can view own details" ON brand_details;
DROP POLICY IF EXISTS "Brands can update own details" ON brand_details;
DROP POLICY IF EXISTS "Brands can insert own details" ON brand_details;

CREATE POLICY "Brands can view own details" 
  ON brand_details FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can insert own details" 
  ON brand_details FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert brand details" 
  ON brand_details FOR INSERT 
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Brands can update own details" 
  ON brand_details FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Alternative: Create a function to handle profile creation with elevated privileges
CREATE OR REPLACE FUNCTION public.create_profile_for_user(
  user_id UUID,
  user_role TEXT,
  user_username TEXT,
  user_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, username, name)
  VALUES (user_id, user_role, user_username, user_name);
  
  IF user_role = 'influencer' THEN
    INSERT INTO public.influencer_details (user_id)
    VALUES (user_id);
  ELSE
    INSERT INTO public.brand_details (user_id)
    VALUES (user_id);
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile_for_user TO authenticated;

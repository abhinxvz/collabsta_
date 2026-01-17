-- Fix RLS policies to allow profile creation during signup
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Also fix influencer_details and brand_details policies
DROP POLICY IF EXISTS "Influencer details viewable by everyone" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can update own details" ON influencer_details;
DROP POLICY IF EXISTS "Influencers can insert own details" ON influencer_details;

CREATE POLICY "Influencer details viewable by everyone" 
  ON influencer_details FOR SELECT 
  USING (true);

CREATE POLICY "Influencers can insert own details" 
  ON influencer_details FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Influencers can update own details" 
  ON influencer_details FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Brands can view own details" ON brand_details;
DROP POLICY IF EXISTS "Brands can update own details" ON brand_details;
DROP POLICY IF EXISTS "Brands can insert own details" ON brand_details;

CREATE POLICY "Brands can view own details" 
  ON brand_details FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Brands can insert own details" 
  ON brand_details FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Brands can update own details" 
  ON brand_details FOR UPDATE 
  USING (auth.uid() = user_id);

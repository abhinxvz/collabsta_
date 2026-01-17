-- Temporarily disable RLS for testing
-- Run this in your Supabase SQL Editor

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_details DISABLE ROW LEVEL SECURITY;

-- Note: Re-enable RLS after testing by running:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE influencer_details ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE brand_details ENABLE ROW LEVEL SECURITY;

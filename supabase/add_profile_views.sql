-- Profile views tracking

-- Add views column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Profile views log table
CREATE TABLE IF NOT EXISTS profile_views_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profile_views_log_profile ON profile_views_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_log_created ON profile_views_log(created_at);

-- Enable RLS
ALTER TABLE profile_views_log ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert views
CREATE POLICY IF NOT EXISTS "Anyone can log profile views" ON profile_views_log 
  FOR INSERT WITH CHECK (true);

-- Policy: Profile owners can see their views
CREATE POLICY IF NOT EXISTS "Users can see own profile views" ON profile_views_log 
  FOR SELECT USING (auth.uid() = profile_id);

-- Function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_view(
  p_profile_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_viewer_ip TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Log the view
  INSERT INTO profile_views_log (profile_id, viewer_id, viewer_ip)
  VALUES (p_profile_id, p_viewer_id, p_viewer_ip);
  
  -- Increment counter
  UPDATE profiles 
  SET profile_views = profile_views + 1 
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

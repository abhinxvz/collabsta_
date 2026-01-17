-- Collabsta Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (common for both roles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('influencer', 'brand')),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencer details
CREATE TABLE influencer_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  niche TEXT,
  instagram TEXT,
  youtube TEXT,
  linkedin TEXT,
  website TEXT,
  followers_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  payout_upi TEXT,
  payout_bank JSONB,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0
);

-- Brand details
CREATE TABLE brand_details (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT,
  brand_website TEXT,
  gst_number TEXT,
  industry TEXT
);

-- Services offered by influencers
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  delivery_days INTEGER NOT NULL,
  revisions INTEGER DEFAULT 1,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio items
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'link')),
  title TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES profiles(id),
  influencer_id UUID NOT NULL REFERENCES profiles(id),
  service_id UUID NOT NULL REFERENCES services(id),
  amount NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL,
  influencer_earning NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'in_progress', 'delivered', 'completed', 'cancelled')),
  requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved creators (wishlist)
CREATE TABLE saved_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, influencer_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'creator_pro', 'brand')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'INR',
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  order_id UUID REFERENCES orders(id),
  type TEXT NOT NULL CHECK (type IN ('subscription', 'order', 'payout')),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES profiles(id),
  influencer_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_services_influencer ON services(influencer_id);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_orders_brand ON orders(brand_id);
CREATE INDEX idx_orders_influencer ON orders(influencer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own write
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Influencer details: Public read for influencers, own write
CREATE POLICY "Influencer details viewable by everyone" ON influencer_details FOR SELECT USING (true);
CREATE POLICY "Influencers can update own details" ON influencer_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Influencers can insert own details" ON influencer_details FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Brand details: Own read/write only
CREATE POLICY "Brands can view own details" ON brand_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Brands can update own details" ON brand_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Brands can insert own details" ON brand_details FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Services: Public read active, influencer CRUD own
CREATE POLICY "Active services viewable by everyone" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Influencers can manage own services" ON services FOR ALL USING (auth.uid() = influencer_id);

-- Portfolio: Public read, influencer CRUD own
CREATE POLICY "Portfolio viewable by everyone" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Influencers can manage own portfolio" ON portfolio_items FOR ALL USING (auth.uid() = influencer_id);

-- Orders: Brand and influencer can view their orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = brand_id OR auth.uid() = influencer_id);
CREATE POLICY "Brands can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "Order participants can update" ON orders FOR UPDATE USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- Saved creators: Brand own
CREATE POLICY "Brands can manage saved creators" ON saved_creators FOR ALL USING (auth.uid() = brand_id);

-- Reviews: Public read, brand can create for their orders
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Brands can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = brand_id);

-- Subscriptions: Own read/write
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own subscription" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Payment transactions: Own read
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update influencer rating
CREATE OR REPLACE FUNCTION update_influencer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE influencer_details
  SET 
    rating_avg = (SELECT AVG(rating) FROM reviews WHERE influencer_id = NEW.influencer_id),
    rating_count = (SELECT COUNT(*) FROM reviews WHERE influencer_id = NEW.influencer_id)
  WHERE user_id = NEW.influencer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update ratings
CREATE TRIGGER on_review_created
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION update_influencer_rating();

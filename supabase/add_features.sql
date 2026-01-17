-- Additional features for Collabsta

-- Messages table for direct chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order', 'message', 'review', 'payment', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES profiles(id),
  influencer_id UUID NOT NULL REFERENCES profiles(id),
  terms TEXT NOT NULL,
  deliverables TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  brand_signed BOOLEAN DEFAULT FALSE,
  influencer_signed BOOLEAN DEFAULT FALSE,
  brand_signed_at TIMESTAMPTZ,
  influencer_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign briefs
CREATE TABLE campaign_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min NUMERIC(10,2),
  budget_max NUMERIC(10,2),
  deadline TIMESTAMPTZ,
  requirements JSONB,
  target_audience TEXT,
  platforms TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign applications
CREATE TABLE campaign_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaign_briefs(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  quoted_price NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id)
);

-- Availability calendar
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(influencer_id, date)
);

-- Service packages (bundle deals)
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  service_ids UUID[] NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  package_price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification requests
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('identity', 'social', 'business')),
  documents JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved searches
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_conversations_participants ON conversations(participant_1, participant_2);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_contracts_order ON contracts(order_id);
CREATE INDEX idx_campaign_briefs_brand ON campaign_briefs(brand_id);
CREATE INDEX idx_campaign_briefs_status ON campaign_briefs(status);
CREATE INDEX idx_campaign_applications_campaign ON campaign_applications(campaign_id);
CREATE INDEX idx_campaign_applications_influencer ON campaign_applications(influencer_id);
CREATE INDEX idx_availability_influencer ON availability(influencer_id);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_testimonials_influencer ON testimonials(influencer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- RLS Policies

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Messages: Participants can view and send
CREATE POLICY "Users can view their messages" ON messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their messages" ON messages FOR UPDATE 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Conversations: Participants can view
CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT 
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT 
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Notifications: Own only
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Contracts: Participants can view
CREATE POLICY "Contract participants can view" ON contracts FOR SELECT 
  USING (auth.uid() = brand_id OR auth.uid() = influencer_id);
CREATE POLICY "Contract participants can sign" ON contracts FOR UPDATE 
  USING (auth.uid() = brand_id OR auth.uid() = influencer_id);

-- Campaign briefs: Public read, brand write
CREATE POLICY "Campaign briefs viewable by all" ON campaign_briefs FOR SELECT USING (true);
CREATE POLICY "Brands can manage campaigns" ON campaign_briefs FOR ALL 
  USING (auth.uid() = brand_id);

-- Campaign applications: Influencer and brand can view
CREATE POLICY "Applications viewable by participants" ON campaign_applications FOR SELECT 
  USING (
    auth.uid() = influencer_id OR 
    auth.uid() IN (SELECT brand_id FROM campaign_briefs WHERE id = campaign_id)
  );
CREATE POLICY "Influencers can apply" ON campaign_applications FOR INSERT 
  WITH CHECK (auth.uid() = influencer_id);

-- Availability: Public read, influencer write
CREATE POLICY "Availability viewable by all" ON availability FOR SELECT USING (true);
CREATE POLICY "Influencers can manage availability" ON availability FOR ALL 
  USING (auth.uid() = influencer_id);

-- Service packages: Public read active, influencer write
CREATE POLICY "Active packages viewable by all" ON service_packages FOR SELECT 
  USING (is_active = true);
CREATE POLICY "Influencers can manage packages" ON service_packages FOR ALL 
  USING (auth.uid() = influencer_id);

-- Testimonials: Public read, influencer write
CREATE POLICY "Testimonials viewable by all" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Influencers can manage testimonials" ON testimonials FOR ALL 
  USING (auth.uid() = influencer_id);

-- Verification requests: Own only
CREATE POLICY "Users can view own verification" ON verification_requests FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create verification" ON verification_requests FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Saved searches: Own only
CREATE POLICY "Users can manage saved searches" ON saved_searches FOR ALL 
  USING (auth.uid() = user_id);

-- Referrals: Own only
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can create referrals" ON referrals FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    'message',
    'New Message',
    'You have a new message',
    '/messages'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION notify_new_message();

-- Trigger to notify on new order
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.influencer_id,
    'order',
    'New Order',
    'You have received a new order',
    '/dashboard/influencer/orders'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION notify_new_order();

-- Trigger to notify on new review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.influencer_id,
    'review',
    'New Review',
    'You received a new review',
    '/dashboard/influencer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created_notify
AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION notify_new_review();

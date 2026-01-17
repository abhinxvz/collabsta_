export type UserRole = 'influencer' | 'brand'

export interface Profile {
  id: string
  role: UserRole
  username: string
  name: string
  bio: string | null
  avatar_url: string | null
  city: string | null
  country: string | null
  created_at: string
}

export interface InfluencerDetails {
  user_id: string
  niche: string | null
  instagram: string | null
  youtube: string | null
  linkedin: string | null
  website: string | null
  followers_count: number | null
  verified: boolean
  payout_upi: string | null
  payout_bank: Record<string, string> | null
  rating_avg: number | null
  rating_count: number
}

export interface BrandDetails {
  user_id: string
  brand_name: string | null
  brand_website: string | null
  gst_number: string | null
  industry: string | null
}

export interface Service {
  id: string
  influencer_id: string
  title: string
  description: string | null
  price: number
  currency: string
  delivery_days: number
  revisions: number
  category: string | null
  is_active: boolean
  created_at: string
}

export interface PortfolioItem {
  id: string
  influencer_id: string
  type: 'image' | 'video' | 'link'
  title: string | null
  url: string
  thumbnail_url: string | null
  created_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'in_progress' | 'delivered' | 'completed' | 'cancelled'

export interface Order {
  id: string
  brand_id: string
  influencer_id: string
  service_id: string
  amount: number
  platform_fee: number
  influencer_earning: number
  status: OrderStatus
  requirements: string | null
  created_at: string
  service?: Service
  brand?: Profile
  influencer?: Profile
}

export interface Review {
  id: string
  order_id: string
  brand_id: string
  influencer_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface InfluencerWithDetails extends Profile {
  influencer_details: InfluencerDetails | null
  services?: Service[]
  portfolio_items?: PortfolioItem[]
}

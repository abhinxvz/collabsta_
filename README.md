# Collabsta - Influencer Marketplace Platform

A platform where creators/influencers can create public store pages with services, portfolio, and social links. Brands can explore, book, and pay for services.

## Features

### Influencer Side
- Public store page: `yourapp.bio/<username>`
- Add services with pricing, delivery time, revisions
- Upload portfolio (images/videos/links)
- Social links integration
- Orders dashboard
- Payout settings

### Brand Side
- Marketplace search & filters
- View influencer store pages
- Checkout & pay for services
- Order tracking dashboard
- Save creators to wishlist

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **State**: Zustand

## Setup

### 1. Clone and Install

```bash
cd collabsta
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── [username]/        # Public creator store page
│   ├── auth/              # Login & Signup
│   ├── dashboard/
│   │   ├── brand/         # Brand dashboard
│   │   └── influencer/    # Influencer dashboard
│   └── explore/           # Marketplace
├── components/
│   ├── cards/             # Creator & Service cards
│   ├── dashboard/         # Dashboard tab components
│   ├── layout/            # Navbar, Sidebar
│   ├── providers/         # Auth provider
│   └── ui/                # shadcn components
├── lib/
│   └── supabase/          # Supabase client setup
├── store/                 # Zustand stores
└── types/                 # TypeScript types
```

## Payment Integration (MVP)

Currently uses direct order creation. For production:
1. Integrate Razorpay/Stripe
2. Create order as 'pending'
3. On payment webhook success, update to 'paid'

Platform fee: 10% of service price

## License

MIT

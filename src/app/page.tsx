'use client'

import Link from 'next/link'
import { Star, Users, Lightning, Sparkle, TrendUp, ShieldCheck, Check } from '@phosphor-icons/react'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { TextHoverEffect } from '@/components/ui/text-hover-effect'
import { SubscribeButton } from '@/components/subscription/subscribe-button'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkle className="h-4 w-4 text-purple-400" weight="fill" />
              <span className="text-sm text-zinc-300">The future of creator collaborations</span>
            </div>
            
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              <span className="text-white">Connect with</span>
              <br />
              <span className="gradient-text">Top Creators</span>
            </h1>
            
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The marketplace where brands discover and collaborate with influencers. 
              Book services, track deliverables, and grow together.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ShimmerButton href="/auth/signup" className="text-base">
                Get Started
              </ShimmerButton>
              <ShimmerButton href="/explore" showArrow={false} className="text-base">
                Explore Creators
              </ShimmerButton>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12 mt-16 pt-8 border-t border-zinc-800">
              <div>
                <p className="text-3xl font-bold text-white">AI-Powered</p>
                <p className="text-sm text-zinc-500">Matching</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">Secure</p>
                <p className="text-sm text-zinc-500">Payments</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-sm text-zinc-500">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Collabsta?</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Everything you need to run successful influencer campaigns</p>
          </div>
          
                    <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Verified Creators', desc: 'Browse through our curated list of verified influencers across all niches.' },
              { icon: Lightning, title: 'Instant Booking', desc: 'Book services instantly with secure payments and clear deliverables.' },
              { icon: Star, title: 'Quality Guaranteed', desc: 'Reviews and ratings help you find the perfect creator for your brand.' },
                            { icon: TrendUp, title: 'Analytics Dashboard', desc: 'Track your campaigns, views, and ROI in real-time.' },
              { icon: ShieldCheck, title: 'Secure Payments', desc: 'Escrow-protected payments released only on delivery.' },
              { icon: Sparkle, title: 'AI Matching', desc: 'Get matched with creators that fit your brand perfectly.' },
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-purple-400" weight="duotone" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Choose the plan that works for you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Nano/Micro Influencers */}
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Nano/Micro</h3>
                <p className="text-zinc-400 text-sm mb-4">Perfect for growing creators</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">Free</span>
                  <span className="text-zinc-500">/month</span>
                </div>
                <p className="text-purple-400 text-sm mt-2">1 month free trial</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Up to 100K followers</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Create unlimited services</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Portfolio showcase</span>
                </li>
                                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Basic analytics</span>
                </li>
              </ul>
              <SubscribeButton
                planType="free"
                planName="Nano/Micro"
                price={0}
                className="w-full justify-center"
              />
            </div>

            {/* Established Creators */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-purple-900/30 to-zinc-900/50 border-2 border-purple-500/50 hover:border-purple-500 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-semibold text-white">
                Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Established Creator</h3>
                <p className="text-zinc-400 text-sm mb-4">For influencers with 100K+</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹199</span>
                  <span className="text-zinc-500">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>100K+ followers</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Priority listing</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Verified badge</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Priority support</span>
                </li>
              </ul>
              <SubscribeButton
                planType="creator_pro"
                planName="Established Creator"
                price={199}
                className="w-full justify-center"
              />
            </div>

            {/* Brands */}
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Brand</h3>
                <p className="text-zinc-400 text-sm mb-4">For businesses & agencies</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹299</span>
                  <span className="text-zinc-500">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Access all creators</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>AI-powered matching</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Campaign management</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2 text-zinc-300 text-sm">
                  <Check className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" weight="bold" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <SubscribeButton
                planType="brand"
                planName="Brand"
                price={299}
                className="w-full justify-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="p-12 rounded-3xl glass border border-zinc-800">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to grow your brand?</h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              Join thousands of brands and creators already using Collabsta.
            </p>
                        <ShimmerButton href="/auth/signup" className="text-base">
              Start Free Today
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* Text Hover Effect Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="h-[20rem] flex items-center justify-center">
            <div className="w-full">
              <TextHoverEffect text="COLLABSTA" duration={0.5} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/collabsta24.png" alt="Collabsta" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white">Collabsta</span>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 Collabsta. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

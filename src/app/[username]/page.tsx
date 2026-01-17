'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { startConversation } from '@/lib/messaging'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceCard } from '@/components/cards/service-card'
import { Instagram, Youtube, Linkedin, Globe, MapPin, Star, Heart, CheckCircle, Loader2, MessageCircle } from 'lucide-react'
import { InfluencerWithDetails, Service, PortfolioItem } from '@/types/database'
import { toast } from 'sonner'

export default function CreatorStorePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [creator, setCreator] = useState<InfluencerWithDetails | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [startingChat, setStartingChat] = useState(false)
  const supabase = createClient()

  useEffect(() => { 
    loadCreator()
    checkSaved()
    trackProfileView()
  }, [username])

  const trackProfileView = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (!profile) return

    const { data: { user } } = await supabase.auth.getUser()
    
    // Call the function to increment view
    await supabase.rpc('increment_profile_view', {
      p_profile_id: profile.id,
      p_viewer_id: user?.id || null,
      p_viewer_ip: null
    })
  }

  const loadCreator = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, influencer_details(*)')
      .eq('username', username)
      .eq('role', 'influencer')
      .single()

    if (profile) {
      setCreator({ ...profile, influencer_details: profile.influencer_details?.[0] || null })
      const { data: servicesData } = await supabase.from('services').select('*').eq('influencer_id', profile.id).eq('is_active', true)
      setServices(servicesData || [])
      const { data: portfolioData } = await supabase.from('portfolio_items').select('*').eq('influencer_id', profile.id)
      setPortfolio(portfolioData || [])
      const { data: testimonialsData } = await supabase.from('testimonials').select('*').eq('influencer_id', profile.id).eq('is_featured', true)
      setTestimonials(testimonialsData || [])
    }
    setLoading(false)
  }

  const checkSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'brand') return
    const { data: creatorProfile } = await supabase.from('profiles').select('id').eq('username', username).single()
    if (!creatorProfile) return
    const { data } = await supabase.from('saved_creators').select('id').eq('brand_id', user.id).eq('influencer_id', creatorProfile.id).single()
    setIsSaved(!!data)
  }

  const toggleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !creator) { toast.error('Please login as a brand to save creators'); return }
    if (isSaved) {
      await supabase.from('saved_creators').delete().eq('brand_id', user.id).eq('influencer_id', creator.id)
      setIsSaved(false); toast.success('Removed from saved')
    } else {
      await supabase.from('saved_creators').insert({ brand_id: user.id, influencer_id: creator.id })
      setIsSaved(true); toast.success('Saved to wishlist')
    }
  }

  const handleMessage = async () => {
    if (!creator) return
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to send messages')
      return
    }

    try {
      setStartingChat(true)
      const conversationId = await startConversation(creator.id)
      if (conversationId) {
        router.push('/messages')
      } else {
        toast.error('Failed to start conversation')
      }
    } catch (error) {
      console.error('Error starting chat:', error)
      toast.error('Failed to start conversation')
    } finally {
      setStartingChat(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Creator not found</h1>
          <p className="text-zinc-500">This profile doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const details = creator.influencer_details

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-32 w-32 border-4 border-purple-500/30 glow-purple">
              <AvatarImage src={creator.avatar_url || ''} />
              <AvatarFallback className="bg-purple-500/20 text-purple-300 text-4xl">
                {creator.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{creator.name}</h1>
                {details?.verified && <CheckCircle className="h-6 w-6 text-purple-400 fill-purple-400/20" />}
              </div>
              <p className="text-zinc-500 mb-2">@{creator.username}</p>
              {details?.niche && <Badge className="bg-purple-500/20 text-purple-300 border-0">{details.niche}</Badge>}
              {creator.bio && <p className="mt-4 text-zinc-400 max-w-xl">{creator.bio}</p>}
              
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm">
                {(creator.city || creator.country) && (
                  <span className="flex items-center gap-1 text-zinc-500">
                    <MapPin className="h-4 w-4" />
                    {[creator.city, creator.country].filter(Boolean).join(', ')}
                  </span>
                )}
                {details?.rating_avg && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    {details.rating_avg.toFixed(1)} ({details.rating_count} reviews)
                  </span>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                {details?.instagram && (
                  <a href={`https://instagram.com/${details.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-purple-500/20 transition-colors">
                    <Instagram className="h-5 w-5 text-zinc-400" />
                  </a>
                )}
                {details?.youtube && (
                  <a href={details.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-purple-500/20 transition-colors">
                    <Youtube className="h-5 w-5 text-zinc-400" />
                  </a>
                )}
                {details?.linkedin && (
                  <a href={details.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-purple-500/20 transition-colors">
                    <Linkedin className="h-5 w-5 text-zinc-400" />
                  </a>
                )}
                {details?.website && (
                  <a href={details.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-800 rounded-lg hover:bg-purple-500/20 transition-colors">
                    <Globe className="h-5 w-5 text-zinc-400" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleMessage} 
                className="bg-purple-600 hover:bg-purple-500"
                disabled={startingChat}
              >
                {startingChat ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                Message
              </Button>
              <Button onClick={toggleSave} variant="outline" className={isSaved ? "bg-purple-500/20 border-purple-500/50 text-purple-300" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"}>
                <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="services">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
            <TabsTrigger value="services" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Services ({services.length})</TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Portfolio ({portfolio.length})</TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            {services.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">No services available yet.</p>
            ) : (
              <div className="grid gap-4">
                {services.map(service => <ServiceCard key={service.id} service={service} creatorId={creator.id} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio">
            {portfolio.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">No portfolio items yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                    <Card className="overflow-hidden bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-all">
                      {item.type === 'image' ? (
                        <img src={item.url} alt={item.title || ''} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="w-full h-48 bg-zinc-800 flex items-center justify-center text-zinc-500">
                          {item.type === 'video' ? 'Video' : 'Link'}
                        </div>
                      )}
                      {item.title && <CardContent className="p-3"><p className="text-sm text-zinc-300 truncate">{item.title}</p></CardContent>}
                    </Card>
                  </a>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonials">
            {testimonials.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">No reviews yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {testimonials.map(testimonial => (
                  <Card key={testimonial.id} className="bg-zinc-900/50 border-zinc-800 p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {testimonial.brand_logo ? (
                        <img src={testimonial.brand_logo} alt={testimonial.brand_name} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                          {testimonial.brand_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{testimonial.brand_name}</h3>
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-zinc-600'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-300 italic">"{testimonial.content}"</p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Eye, ShoppingBag, DollarSign, Heart, Loader2, TrendingUp, Users, ExternalLink } from 'lucide-react'
import { Profile, Order } from '@/types/database'
import { ServicesTab } from '@/components/dashboard/services-tab'
import { PortfolioTab } from '@/components/dashboard/portfolio-tab'
import { OrdersTab } from '@/components/dashboard/orders-tab'
import { SettingsTab } from '@/components/dashboard/settings-tab'
import { AIChat } from '@/components/ai/ai-chat'
import Link from 'next/link'

export default function InfluencerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({ views: 0, orders: 0, earnings: 0, pending: 0, savedBy: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profileData)

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, service:services(*), brand:profiles!orders_brand_id_fkey(*)')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(ordersData || [])

    // Get saved count
    const { count: savedCount } = await supabase
      .from('saved_creators')
      .select('*', { count: 'exact', head: true })
      .eq('influencer_id', user.id)

    const completedOrders = ordersData?.filter(o => o.status === 'completed') || []
    const pendingOrders = ordersData?.filter(o => ['paid', 'in_progress'].includes(o.status)) || []
    
    setStats({
      views: profileData?.profile_views || 0,
      orders: ordersData?.length || 0,
      earnings: completedOrders.reduce((sum, o) => sum + o.influencer_earning, 0),
      pending: pendingOrders.length,
      savedBy: savedCount || 0
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const recentOrders = orders.slice(0, 3)

  return (
    <div className="flex min-h-screen">
      <Sidebar role="influencer" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {profile?.name?.split(' ')[0]}!</h1>
            <p className="text-zinc-500">Here's what's happening with your profile</p>
          </div>
          <Link href={`/${profile?.username}`} target="_blank">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              View Public Profile <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20">
                  <Eye className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Profile Views</p>
                  <p className="text-xl font-bold text-white">{stats.views}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20">
                  <ShoppingBag className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Orders</p>
                  <p className="text-xl font-bold text-white">{stats.orders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/20">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Earnings</p>
                  <p className="text-xl font-bold text-white">₹{stats.earnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20">
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Pending Work</p>
                  <p className="text-xl font-bold text-white">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/20">
                  <Heart className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Saved by Brands</p>
                  <p className="text-xl font-bold text-white">{stats.savedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Quick View */}
        {recentOrders.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Recent Client Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-medium">
                        {order.brand?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{order.service?.title}</p>
                        <p className="text-sm text-zinc-500">from {order.brand?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">₹{order.influencer_earning}</p>
                      <p className={`text-xs ${order.status === 'completed' ? 'text-green-500' : order.status === 'in_progress' ? 'text-yellow-500' : 'text-blue-500'}`}>
                        {order.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="services" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Services</TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Portfolio</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">All Orders</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="services"><ServicesTab /></TabsContent>
          <TabsContent value="portfolio"><PortfolioTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab orders={orders} role="influencer" onUpdate={loadData} /></TabsContent>
          <TabsContent value="settings"><SettingsTab profile={profile} onUpdate={loadData} /></TabsContent>
        </Tabs>

        {/* AI Chat Assistant */}
        <AIChat userRole="influencer" />
      </div>
    </div>
  )
}

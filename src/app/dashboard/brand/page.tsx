'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Heart, CheckCircle, Clock, Loader2, Wallet, Users, TrendingUp } from 'lucide-react'
import { Order, Profile } from '@/types/database'
import { OrdersTab } from '@/components/dashboard/orders-tab'
import { SavedCreatorsTab } from '@/components/dashboard/saved-creators-tab'
import { BrandSettingsTab } from '@/components/dashboard/brand-settings-tab'
import { ExploreTab } from '@/components/dashboard/explore-tab'
import { AIChat } from '@/components/ai/ai-chat'
import { AIMatch } from '@/components/ai/ai-match'
import Link from 'next/link'

export default function BrandDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, saved: 0, spent: 0 })
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
      .select('*, service:services(*), influencer:profiles!orders_influencer_id_fkey(*)')
      .eq('brand_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(ordersData || [])

    const { count: savedCount } = await supabase
      .from('saved_creators')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', user.id)

    const completedOrders = ordersData?.filter(o => o.status === 'completed') || []
    const totalSpent = ordersData?.reduce((sum, o) => sum + o.amount, 0) || 0

    setStats({
      total: ordersData?.length || 0,
      active: ordersData?.filter(o => ['paid', 'in_progress'].includes(o.status)).length || 0,
      completed: completedOrders.length,
      saved: savedCount || 0,
      spent: totalSpent
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

  const activeOrders = orders.filter(o => ['paid', 'in_progress', 'delivered'].includes(o.status))

  return (
    <div className="flex min-h-screen">
      <Sidebar role="brand" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back!</h1>
            <p className="text-zinc-500">Manage your influencer campaigns</p>
          </div>
          <div className="flex gap-3">
            <AIMatch />
            <Link href="/explore">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Users className="mr-2 h-4 w-4" /> Browse All
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20">
                  <ShoppingBag className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Orders</p>
                  <p className="text-xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-500/20">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Active Orders</p>
                  <p className="text-xl font-bold text-white">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Completed</p>
                  <p className="text-xl font-bold text-white">{stats.completed}</p>
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
                  <p className="text-xs text-zinc-500">Saved Creators</p>
                  <p className="text-xl font-bold text-white">{stats.saved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Spent</p>
                  <p className="text-xl font-bold text-white">₹{stats.spent.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders Quick View */}
        {activeOrders.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-medium">
                        {order.influencer?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{order.service?.title}</p>
                        <p className="text-sm text-zinc-500">by {order.influencer?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-400 font-medium">₹{order.amount}</p>
                      <p className={`text-xs ${
                        order.status === 'delivered' ? 'text-green-500' : 
                        order.status === 'in_progress' ? 'text-yellow-500' : 'text-blue-500'
                      }`}>
                        {order.status === 'delivered' ? 'Ready for review' : order.status.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="explore" className="space-y-4">
          <TabsList className="bg-zinc-900 border border-zinc-800">
            <TabsTrigger value="explore" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Explore Creators</TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">My Orders</TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Saved Creators</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="explore"><ExploreTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab orders={orders} role="brand" onUpdate={loadData} /></TabsContent>
          <TabsContent value="saved"><SavedCreatorsTab /></TabsContent>
          <TabsContent value="settings"><BrandSettingsTab /></TabsContent>
        </Tabs>

        {/* AI Chat Assistant */}
        <AIChat userRole="brand" />
      </div>
    </div>
  )
}

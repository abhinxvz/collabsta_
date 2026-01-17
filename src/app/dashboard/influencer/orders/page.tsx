'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CircleNotch, Package, Clock, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Order {
  id: string
  service_id: string
  brand_id: string
  status: string
  amount: number
  created_at: string
  services: {
    title: string
    delivery_days: number
  }
  profiles: {
    name: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        services (title, delivery_days),
        profiles!orders_brand_id_fkey (name)
      `)
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Order ${status}`)
      loadOrders()
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      in_progress: 'bg-blue-500/20 text-blue-400',
      completed: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" weight="bold" />
      case 'in_progress':
        return <Package className="h-4 w-4" weight="bold" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" weight="bold" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" weight="bold" />
      default:
        return <Clock className="h-4 w-4" weight="bold" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleNotch className="h-8 w-8 animate-spin text-purple-500" weight="bold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
          <p className="text-zinc-400">Manage your client orders</p>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No orders yet. Your orders will appear here.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {order.services?.title || 'Service'}
                      </h3>
                      <Badge className={getStatusBadge(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-zinc-400 mb-2">
                      Client: {order.profiles?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-zinc-500">
                      Order ID: {order.id.slice(0, 8)}... • 
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{order.amount}</p>
                    <p className="text-sm text-zinc-500">
                      {order.services?.delivery_days || 0} days delivery
                    </p>
                  </div>
                </div>

                {order.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-800">
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-500"
                    >
                      Accept Order
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="border-red-900 text-red-400 hover:bg-red-900/20"
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {order.status === 'in_progress' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-800">
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Order, OrderStatus } from '@/types/database'
import { toast } from 'sonner'
import { Clock, CheckCircle, Package, XCircle } from 'lucide-react'

interface OrdersTabProps {
  orders: Order[]
  role: 'influencer' | 'brand'
  onUpdate: () => void
}

const statusConfig: Record<OrderStatus, { color: string; icon: typeof Clock; label: string }> = {
  pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Pending' },
  paid: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Package, label: 'Paid' },
  in_progress: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Clock, label: 'In Progress' },
  delivered: { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: Package, label: 'Delivered' },
  completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Completed' },
  cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Cancelled' }
}

export function OrdersTab({ orders, role, onUpdate }: OrdersTabProps) {
  const supabase = createClient()

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    toast.success(`Order marked as ${status.replace('_', ' ')}`)
    onUpdate()
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white">Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status]
              const StatusIcon = config.icon
              return (
                <div key={order.id} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-medium">
                        {role === 'influencer' ? order.brand?.name?.charAt(0) : order.influencer?.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{order.service?.title}</h3>
                        <p className="text-sm text-zinc-500">
                          {role === 'influencer' ? `From: ${order.brand?.name}` : `Creator: ${order.influencer?.name}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${config.color} border`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-white font-medium">₹{order.amount.toLocaleString()}</span>
                      {role === 'influencer' && (
                        <span className="text-green-400 ml-2">(You earn: ₹{order.influencer_earning.toLocaleString()})</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {role === 'influencer' && order.status === 'paid' && (
                        <Button size="sm" onClick={() => updateStatus(order.id, 'in_progress')} className="bg-purple-600 hover:bg-purple-500">
                          Start Work
                        </Button>
                      )}
                      {role === 'influencer' && order.status === 'in_progress' && (
                        <Button size="sm" onClick={() => updateStatus(order.id, 'delivered')} className="bg-purple-600 hover:bg-purple-500">
                          Mark Delivered
                        </Button>
                      )}
                      {role === 'brand' && order.status === 'delivered' && (
                        <Button size="sm" onClick={() => updateStatus(order.id, 'completed')} className="bg-green-600 hover:bg-green-500">
                          Approve & Complete
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {order.requirements && (
                    <div className="mt-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-700">
                      <p className="text-xs font-medium text-zinc-400 mb-1">Requirements:</p>
                      <p className="text-sm text-zinc-300">{order.requirements}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

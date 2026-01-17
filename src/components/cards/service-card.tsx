'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Clock, RefreshCw, Loader2, Sparkles } from 'lucide-react'
import { Service } from '@/types/database'
import { toast } from 'sonner'

interface ServiceCardProps {
  service: Service
  creatorId: string
  showBuyButton?: boolean
}

const PLATFORM_FEE_PERCENT = 10

export function ServiceCard({ service, creatorId, showBuyButton = true }: ServiceCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleBuy = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please login to purchase'); router.push('/auth/login'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'brand') { toast.error('Only brands can purchase services'); return }
    setIsOpen(true)
  }

  const generateRequirements = async () => {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'requirements', input: service.title + ' - ' + service.description })
      })
      const data = await res.json()
      if (data.suggestion) {
        setRequirements(data.suggestion)
        toast.success('AI generated requirements template!')
      }
    } catch (error) {
      toast.error('Failed to generate')
    } finally {
      setAiLoading(false)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const platformFee = (service.price * PLATFORM_FEE_PERCENT) / 100
    const influencerEarning = service.price - platformFee

    const { error } = await supabase.from('orders').insert({
      brand_id: user.id, influencer_id: creatorId, service_id: service.id,
      amount: service.price, platform_fee: platformFee, influencer_earning: influencerEarning,
      status: 'paid', requirements
    })

    if (error) { toast.error('Failed to create order'); setLoading(false); return }
    toast.success('Order placed successfully!')
    setIsOpen(false)
    router.push('/dashboard/brand')
  }

  return (
    <>
      <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/30 transition-all">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg text-white">{service.title}</h3>
            {service.category && <Badge className="bg-purple-500/20 text-purple-300 border-0">{service.category}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-zinc-400 text-sm line-clamp-2">{service.description}</p>
          <div className="flex gap-4 mt-4 text-sm text-zinc-500">
            <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{service.delivery_days} days</div>
            <div className="flex items-center gap-1"><RefreshCw className="h-4 w-4" />{service.revisions} revisions</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-3 border-t border-zinc-800">
          <span className="text-2xl font-bold text-purple-400">₹{service.price.toLocaleString()}</span>
          {showBuyButton && (
            <Button onClick={handleBuy} className="bg-purple-600 hover:bg-purple-500">Buy Now</Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white">Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <h4 className="font-semibold text-white">{service.title}</h4>
              <p className="text-sm text-zinc-500">{service.delivery_days} days delivery • {service.revisions} revisions</p>
              <p className="text-xl font-bold text-purple-400 mt-2">₹{service.price.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Requirements / Brief</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateRequirements}
                  disabled={aiLoading}
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                >
                  {aiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  AI Help
                </Button>
              </div>
              <Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Describe what you need, any specific requirements, brand guidelines, etc." rows={4} className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
            <Button onClick={handleCheckout} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ₹${service.price.toLocaleString()}`}
            </Button>
            <p className="text-xs text-zinc-500 text-center">By purchasing, you agree to our terms of service.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

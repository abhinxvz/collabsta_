'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface SubscribeButtonProps {
  planType: string
  planName: string
  price: number
  className?: string
}

export function SubscribeButton({ planType, planName, price, className }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login to subscribe')
        router.push('/auth/login')
        return
      }

      // For free plan
      if (price === 0) {
        const response = await fetch('/api/subscription/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planType }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create subscription')
        }

        toast.success('Free trial activated!')
        router.push('/dashboard/influencer')
        return
      }

      // For paid plans, create Razorpay order
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'Collabsta',
          description: `${planName} Subscription`,
          order_id: data.orderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planType,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok) {
              toast.success('Subscription activated!')
              router.push(planType === 'brand' ? '/dashboard/brand' : '/dashboard/influencer')
            } else {
              toast.error(verifyData.error || 'Payment verification failed')
            }
          },
          prefill: {
            email: user.email,
          },
          theme: {
            color: '#a855f7',
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to process subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ShimmerButton
      onClick={handleSubscribe}
      disabled={loading}
      className={className}
      showArrow={false}
    >
      {loading ? 'Processing...' : 'Get Started'}
    </ShimmerButton>
  )
}

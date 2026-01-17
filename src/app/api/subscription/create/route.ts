import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PLANS } from '@/lib/subscription'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planType } = await request.json()
    const plan = PLANS[planType as keyof typeof PLANS]

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // For free plan, just create subscription record
    if (plan.price === 0) {
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + (plan.trialDays || 30))

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: planType,
          status: 'trial',
          amount: 0,
          trial_ends_at: trialEndsAt.toISOString(),
          current_period_end: trialEndsAt.toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ subscription })
    }

    // For paid plans, create Razorpay order
    // Note: You'll need to add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Create Razorpay order
    const orderAmount = plan.price * 100 // Convert to paise
    const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: orderAmount,
        currency: plan.currency,
        receipt: `sub_${user.id}_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan_type: planType,
        },
      }),
    })

    const orderData = await razorpayOrder.json()

    if (!razorpayOrder.ok) {
      throw new Error(orderData.error?.description || 'Failed to create order')
    }

    return NextResponse.json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: razorpayKeyId,
    })
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export const PLANS = {
  free: {
    id: 'free',
    name: 'Nano/Micro',
    price: 0,
    currency: 'INR',
    interval: 'month',
    features: [
      'Up to 100K followers',
      'Create unlimited services',
      'Portfolio showcase',
      'Basic analytics',
    ] as string[],
    followerLimit: 100000,
    trialDays: 30,
  },
  creator_pro: {
    id: 'creator_pro',
    name: 'Established Creator',
    price: 199,
    currency: 'INR',
    interval: 'month',
    features: [
      '100K+ followers',
      'Priority listing',
      'Advanced analytics',
      'Verified badge',
      'Priority support',
    ] as string[],
    followerLimit: null,
  },
  brand: {
    id: 'brand',
    name: 'Brand',
    price: 299,
    currency: 'INR',
    interval: 'month',
    features: [
      'Access all creators',
      'AI-powered matching',
      'Campaign management',
      'Analytics dashboard',
      'Dedicated support',
    ] as string[],
  },
}

export type PlanType = keyof typeof PLANS

export function getPlanForUser(role: string, followersCount: number = 0): PlanType {
  if (role === 'brand') {
    return 'brand'
  }
  
  if (role === 'influencer') {
    if (followersCount >= 100000) {
      return 'creator_pro'
    }
    return 'free'
  }
  
  return 'free'
}

export function canAccessFeature(
  planType: PlanType,
  feature: string
): boolean {
  const plan = PLANS[planType]
  return (plan.features as readonly string[]).includes(feature)
}

export function isSubscriptionActive(
  status: string,
  currentPeriodEnd?: Date | string
): boolean {
  if (status === 'cancelled' || status === 'expired') {
    return false
  }
  
  if (status === 'trial' || status === 'active') {
    if (currentPeriodEnd) {
      const endDate = new Date(currentPeriodEnd)
      return endDate > new Date()
    }
    return true
  }
  
  return false
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreatorCard } from '@/components/cards/creator-card'
import { InfluencerWithDetails } from '@/types/database'
import { Loader2, Heart } from 'lucide-react'

export function SavedCreatorsTab() {
  const [creators, setCreators] = useState<InfluencerWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadSaved() }, [])

  const loadSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: saved } = await supabase
      .from('saved_creators')
      .select('influencer_id')
      .eq('brand_id', user.id)

    if (saved && saved.length > 0) {
      const ids = saved.map(s => s.influencer_id)
      const { data } = await supabase
        .from('profiles')
        .select('*, influencer_details(*)')
        .in('id', ids)

      setCreators(data?.map(p => ({ ...p, influencer_details: p.influencer_details?.[0] || null })) || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
          <Heart className="h-8 w-8 text-pink-400" />
        </div>
        <p className="text-zinc-400 mb-2">No saved creators yet</p>
        <p className="text-zinc-500 text-sm">Browse and save creators you like!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map(creator => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  )
}

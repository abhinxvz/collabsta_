'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { CreatorCard } from '@/components/cards/creator-card'
import { InfluencerWithDetails } from '@/types/database'
import { Search, Loader2 } from 'lucide-react'

export function ExploreTab() {
  const [creators, setCreators] = useState<InfluencerWithDetails[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadCreators() }, [])

  const loadCreators = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, influencer_details(*)')
      .eq('role', 'influencer')
      .order('created_at', { ascending: false })
    
    setCreators(data?.map(p => ({ ...p, influencer_details: p.influencer_details?.[0] || null })) || [])
    setLoading(false)
  }

  const filtered = creators.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.influencer_details?.niche?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search creators by name or niche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11"
        />
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">No creators found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(creator => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  )
}

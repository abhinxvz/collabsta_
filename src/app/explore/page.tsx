'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreatorCard } from '@/components/cards/creator-card'
import { createClient } from '@/lib/supabase/client'
import { InfluencerWithDetails } from '@/types/database'
import { MagnifyingGlass, Funnel, CircleNotch, BookmarkSimple, X } from '@phosphor-icons/react'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const categories = ['All', 'Fashion', 'Tech', 'Lifestyle', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming', 'Education']
const locations = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad']

export default function ExplorePage() {
  const [creators, setCreators] = useState<InfluencerWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    location: 'All',
    minFollowers: '',
    maxFollowers: '',
    minPrice: '',
    maxPrice: '',
    verified: false,
  })
  const supabase = createClient()

  useEffect(() => { fetchCreators() }, [filters.category, filters.location, filters.verified])

  const fetchCreators = async () => {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('*, influencer_details(*)')
      .eq('role', 'influencer')

    if (filters.category !== 'All') {
      query = query.eq('influencer_details.niche', filters.category)
    }

    if (filters.location !== 'All') {
      query = query.eq('city', filters.location)
    }

    if (filters.verified) {
      query = query.eq('influencer_details.verified', true)
    }

    const { data } = await query
    setCreators((data as InfluencerWithDetails[]) || [])
    setLoading(false)
  }

  const filtered = creators.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.username?.toLowerCase().includes(filters.search.toLowerCase())
    
    const followers = c.influencer_details?.followers_count || 0
    const matchesFollowers = 
      (!filters.minFollowers || followers >= parseInt(filters.minFollowers)) &&
      (!filters.maxFollowers || followers <= parseInt(filters.maxFollowers))

    return matchesSearch && matchesFollowers
  })

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      location: 'All',
      minFollowers: '',
      maxFollowers: '',
      minPrice: '',
      maxPrice: '',
      verified: false,
    })
  }

  const saveSearch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please login to save searches')
      return
    }

    const name = prompt('Name this search:')
    if (!name) return

    const { error } = await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        name,
        filters: filters,
      })

    if (error) {
      toast.error('Failed to save search')
    } else {
      toast.success('Search saved!')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Creators</h1>
          <p className="text-zinc-400">Find the perfect influencer for your brand</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" weight="bold" />
            <Input
              placeholder="Search creators..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-purple-500 h-11"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Funnel className="h-5 w-5 mr-2" weight="bold" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={saveSearch}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <BookmarkSimple className="h-5 w-5" weight="bold" />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-6 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-zinc-400"
              >
                <X className="h-5 w-5" weight="bold" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-zinc-300">Category</Label>
                <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-zinc-300 focus:bg-zinc-800">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Location</Label>
                <Select value={filters.location} onValueChange={(v) => setFilters({ ...filters, location: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc} className="text-zinc-300 focus:bg-zinc-800">
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Min Followers</Label>
                <Input
                  type="number"
                  placeholder="e.g., 10000"
                  value={filters.minFollowers}
                  onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Max Followers</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100000"
                  value={filters.maxFollowers}
                  onChange={(e) => setFilters({ ...filters, maxFollowers: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-zinc-300">Verified Only</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={fetchCreators} className="bg-purple-600 hover:bg-purple-500">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters} className="border-zinc-700 text-zinc-300">
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-zinc-400">
          {filtered.length} creator{filtered.length !== 1 ? 's' : ''} found
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <CircleNotch className="h-8 w-8 animate-spin text-purple-500" weight="bold" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg mb-4">No creators found</p>
            <Button variant="outline" onClick={clearFilters} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

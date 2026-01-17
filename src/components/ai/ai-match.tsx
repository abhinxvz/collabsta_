'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Star, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Match {
  id: string
  score: number
  reason: string
  creator: {
    id: string
    name: string
    username: string
    bio: string
    avatar_url: string
    niche: string
    followers_count: number
    rating_avg: number
  }
}

const budgetRanges = ['Under ₹10,000', '₹10,000 - ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000 - ₹5,00,000', 'Above ₹5,00,000']
const campaignTypes = ['Product Launch', 'Brand Awareness', 'Sales/Conversion', 'Content Creation', 'Event Promotion', 'App Install', 'Other']

export function AIMatch() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [form, setForm] = useState({
    brandDescription: '',
    targetAudience: '',
    campaignType: '',
    budget: ''
  })

  const findMatches = async () => {
    if (!form.brandDescription) return
    setLoading(true)
    setMatches([])

    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (data.matches) {
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Match error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
          <Sparkles className="h-4 w-4 mr-2" /> AI Match
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Creator Matching
          </DialogTitle>
        </DialogHeader>

        {matches.length === 0 ? (
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">Tell us about your campaign and we'll find the perfect creators for you.</p>
            
            <div>
              <Label className="text-zinc-300">Describe your brand/product *</Label>
              <Textarea
                value={form.brandDescription}
                onChange={(e) => setForm({ ...form, brandDescription: e.target.value })}
                placeholder="What does your brand do? What product/service are you promoting?"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-zinc-300">Target Audience</Label>
              <Input
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                placeholder="e.g., Women 18-35, interested in fashion"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300">Campaign Type</Label>
                <Select value={form.campaignType} onValueChange={(v) => setForm({ ...form, campaignType: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {campaignTypes.map(t => (
                      <SelectItem key={t} value={t} className="text-zinc-300 focus:bg-zinc-800">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Budget</Label>
                <Select value={form.budget} onValueChange={(v) => setForm({ ...form, budget: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {budgetRanges.map(b => (
                      <SelectItem key={b} value={b} className="text-zinc-300 focus:bg-zinc-800">{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={findMatches} 
              disabled={loading || !form.brandDescription}
              className="w-full bg-purple-600 hover:bg-purple-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding perfect matches...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Find Matching Creators
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-zinc-400 text-sm">Found {matches.length} matching creators</p>
              <Button variant="ghost" size="sm" onClick={() => setMatches([])} className="text-zinc-400 hover:text-white">
                Search Again
              </Button>
            </div>

            <div className="space-y-3">
              {matches.map((match, i) => (
                <Card key={match.id} className="bg-zinc-800/50 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-purple-500/30">
                          <AvatarImage src={match.creator.avatar_url} />
                          <AvatarFallback className="bg-purple-500/20 text-purple-300">
                            {match.creator.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{match.creator.name}</h4>
                            <p className="text-sm text-zinc-500">@{match.creator.username}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-purple-400">
                              <Sparkles className="h-4 w-4" />
                              <span className="font-bold">{match.score}%</span>
                            </div>
                            <p className="text-xs text-zinc-500">match</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                          {match.creator.niche && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-0">{match.creator.niche}</Badge>
                          )}
                          {match.creator.followers_count && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {(match.creator.followers_count / 1000).toFixed(0)}K
                            </span>
                          )}
                          {match.creator.rating_avg && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <Star className="h-3 w-3 fill-current" />
                              {match.creator.rating_avg.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-zinc-300 mt-2 bg-zinc-900/50 p-2 rounded-lg">
                          {match.reason}
                        </p>

                        <Link href={`/${match.creator.username}`} target="_blank">
                          <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-500">
                            View Profile <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

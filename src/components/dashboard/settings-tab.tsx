'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Profile, InfluencerDetails } from '@/types/database'
import { toast } from 'sonner'
import { Loader2, Instagram, Youtube, Linkedin, Globe, Twitter } from 'lucide-react'

interface SettingsTabProps {
  profile: Profile | null
  onUpdate: () => void
}

export function SettingsTab({ profile, onUpdate }: SettingsTabProps) {
  const [details, setDetails] = useState<InfluencerDetails | null>(null)
  const [form, setForm] = useState({
    name: '', bio: '', city: '', country: '',
    niche: '', instagram: '', twitter: '', youtube: '', linkedin: '', website: '',
    payout_upi: ''
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setForm(f => ({ ...f, name: profile.name, bio: profile.bio || '', city: profile.city || '', country: profile.country || '' }))
      loadDetails()
    }
  }, [profile])

  const loadDetails = async () => {
    if (!profile) return
    const { data } = await supabase.from('influencer_details').select('*').eq('user_id', profile.id).single()
    if (data) {
      setDetails(data)
      setForm(f => ({
        ...f,
        niche: data.niche || '',
        instagram: data.instagram || '',
        youtube: data.youtube || '',
        linkedin: data.linkedin || '',
        website: data.website || '',
        payout_upi: data.payout_upi || ''
      }))
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setLoading(true)

    await supabase.from('profiles').update({
      name: form.name, bio: form.bio, city: form.city, country: form.country
    }).eq('id', profile.id)

    await supabase.from('influencer_details').update({
      niche: form.niche, instagram: form.instagram, youtube: form.youtube,
      linkedin: form.linkedin, website: form.website, payout_upi: form.payout_upi
    }).eq('user_id', profile.id)

    toast.success('Settings saved')
    setLoading(false)
    onUpdate()
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader><CardTitle className="text-white">Profile Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300">Niche</Label>
              <Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} placeholder="Fashion, Tech, Lifestyle..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-300">Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell brands about yourself..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300">Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader><CardTitle className="text-white">Social Links</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@username" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
            <div>
              <Label className="text-zinc-300 flex items-center gap-2"><Youtube className="h-4 w-4" /> YouTube</Label>
              <Input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="Channel URL" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 flex items-center gap-2"><Linkedin className="h-4 w-4" /> LinkedIn</Label>
              <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="Profile URL" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
            <div>
              <Label className="text-zinc-300 flex items-center gap-2"><Globe className="h-4 w-4" /> Website</Label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader><CardTitle className="text-white">Payout Settings</CardTitle></CardHeader>
        <CardContent>
          <div>
            <Label className="text-zinc-300">UPI ID</Label>
            <Input value={form.payout_upi} onChange={(e) => setForm({ ...form, payout_upi: e.target.value })} placeholder="yourname@upi" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-500">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  )
}

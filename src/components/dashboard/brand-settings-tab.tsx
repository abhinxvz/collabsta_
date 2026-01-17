'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Building2, Globe } from 'lucide-react'

export function BrandSettingsTab() {
  const [form, setForm] = useState({
    name: '', brand_name: '', brand_website: '', gst_number: '', industry: '', bio: ''
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: details } = await supabase.from('brand_details').select('*').eq('user_id', user.id).single()

    if (profile) setForm(f => ({ ...f, name: profile.name, bio: profile.bio || '' }))
    if (details) {
      setForm(f => ({
        ...f,
        brand_name: details.brand_name || '',
        brand_website: details.brand_website || '',
        gst_number: details.gst_number || '',
        industry: details.industry || ''
      }))
    }
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setLoading(true)

    await supabase.from('profiles').update({ name: form.name, bio: form.bio }).eq('id', user.id)
    await supabase.from('brand_details').update({
      brand_name: form.brand_name,
      brand_website: form.brand_website,
      gst_number: form.gst_number,
      industry: form.industry
    }).eq('user_id', user.id)

    toast.success('Settings saved')
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader><CardTitle className="text-white">Brand Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300">Your Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 flex items-center gap-2"><Building2 className="h-4 w-4" /> Brand Name</Label>
              <Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-white" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-300">Brand Description</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell creators about your brand..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-300 flex items-center gap-2"><Globe className="h-4 w-4" /> Brand Website</Label>
              <Input value={form.brand_website} onChange={(e) => setForm({ ...form, brand_website: e.target.value })} placeholder="https://..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
            <div>
              <Label className="text-zinc-300">Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="E-commerce, SaaS..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-300">GST Number (optional)</Label>
            <Input value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-white" />
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

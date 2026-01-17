'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, ExternalLink, Image, Video, Link as LinkIcon } from 'lucide-react'
import { PortfolioItem } from '@/types/database'
import { toast } from 'sonner'

export function PortfolioTab() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ type: 'image' as 'image' | 'video' | 'link', title: '', url: '' })
  const supabase = createClient()

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('portfolio_items').select('*').eq('influencer_id', user.id).order('created_at', { ascending: false })
    setItems(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('portfolio_items').insert({
      influencer_id: user.id, type: form.type, title: form.title, url: form.url
    })

    toast.success('Portfolio item added')
    setIsOpen(false)
    setForm({ type: 'image', title: '', url: '' })
    loadItems()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('portfolio_items').delete().eq('id', id)
    toast.success('Item deleted')
    loadItems()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      default: return <LinkIcon className="h-5 w-5" />
    }
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Portfolio</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-500">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Add Portfolio Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'image' | 'video' | 'link' })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="image" className="text-zinc-300 focus:bg-zinc-800">Image</SelectItem>
                    <SelectItem value="video" className="text-zinc-300 focus:bg-zinc-800">Video</SelectItem>
                    <SelectItem value="link" className="text-zinc-300 focus:bg-zinc-800">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-zinc-300">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Campaign for Brand X" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
              </div>
              <div>
                <Label className="text-zinc-300">URL</Label>
                <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" required />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500">Add Item</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">No portfolio items yet. Showcase your work!</p>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-zinc-700">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.title || ''} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-zinc-800 flex items-center justify-center text-zinc-500">
                    {getIcon(item.type)}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="secondary" className="bg-zinc-700 hover:bg-zinc-600">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.title && <p className="p-2 text-sm text-zinc-300 truncate bg-zinc-800/80">{item.title}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

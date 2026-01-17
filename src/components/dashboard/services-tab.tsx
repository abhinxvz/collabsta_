'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Clock, RefreshCw } from 'lucide-react'
import { Service } from '@/types/database'
import { toast } from 'sonner'
import { AISuggestButton } from '@/components/ai/ai-suggest-button'

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState({ title: '', description: '', price: '', delivery_days: '', revisions: '', category: '' })
  const supabase = createClient()

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('services').select('*').eq('influencer_id', user.id).order('created_at', { ascending: false })
    setServices(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const serviceData = {
      influencer_id: user.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      delivery_days: parseInt(form.delivery_days),
      revisions: parseInt(form.revisions),
      category: form.category,
      currency: 'INR',
      is_active: true
    }

    if (editing) {
      await supabase.from('services').update(serviceData).eq('id', editing.id)
      toast.success('Service updated')
    } else {
      await supabase.from('services').insert(serviceData)
      toast.success('Service created')
    }

    setIsOpen(false)
    setEditing(null)
    setForm({ title: '', description: '', price: '', delivery_days: '', revisions: '', category: '' })
    loadServices()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    toast.success('Service deleted')
    loadServices()
  }

  const openEdit = (service: Service) => {
    setEditing(service)
    setForm({
      title: service.title,
      description: service.description || '',
      price: service.price.toString(),
      delivery_days: service.delivery_days.toString(),
      revisions: service.revisions.toString(),
      category: service.category || ''
    })
    setIsOpen(true)
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Your Services</CardTitle>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setEditing(null); setForm({ title: '', description: '', price: '', delivery_days: '', revisions: '', category: '' }) } }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-500">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">{editing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Instagram Reel" className="bg-zinc-800/50 border-zinc-700 text-white" required />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Description</Label>
                  <AISuggestButton 
                    type="service_description" 
                    input={form.title} 
                    onSuggestion={(s) => setForm({ ...form, description: s })} 
                  />
                </div>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What's included..." className="bg-zinc-800/50 border-zinc-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Price (₹)</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="5000" className="bg-zinc-800/50 border-zinc-700 text-white" required />
                </div>
                <div>
                  <Label className="text-zinc-300">Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Content Creation" className="bg-zinc-800/50 border-zinc-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Delivery (days)</Label>
                  <Input type="number" value={form.delivery_days} onChange={(e) => setForm({ ...form, delivery_days: e.target.value })} placeholder="3" className="bg-zinc-800/50 border-zinc-700 text-white" required />
                </div>
                <div>
                  <Label className="text-zinc-300">Revisions</Label>
                  <Input type="number" value={form.revisions} onChange={(e) => setForm({ ...form, revisions: e.target.value })} placeholder="2" className="bg-zinc-800/50 border-zinc-700 text-white" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500">
                {editing ? 'Update Service' : 'Create Service'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">No services yet. Add your first service!</p>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Plus className="h-4 w-4 mr-2" /> Add Service
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{service.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1">{service.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {service.delivery_days} days</span>
                    <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {service.revisions} revisions</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-purple-400">₹{service.price.toLocaleString()}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(service)} className="text-zinc-400 hover:text-white hover:bg-zinc-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-zinc-400 hover:text-red-400 hover:bg-zinc-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

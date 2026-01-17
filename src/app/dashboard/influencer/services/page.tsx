'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Pencil, Trash, CircleNotch } from '@phosphor-icons/react'

interface Service {
  id: string
  title: string
  description: string
  price: number
  delivery_days: number
  revisions: number
  category: string
  is_active: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    delivery_days: '',
    revisions: '2',
    category: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading services:', error)
      toast.error('Failed to load services')
    } else {
      setServices(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update({
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            delivery_days: parseInt(formData.delivery_days),
            revisions: parseInt(formData.revisions),
            category: formData.category,
          })
          .eq('id', editingService.id)

        if (error) throw error
        toast.success('Service updated!')
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            influencer_id: user.id,
            title: formData.title,
            description: formData.description,
            price: parseFloat(formData.price),
            delivery_days: parseInt(formData.delivery_days),
            revisions: parseInt(formData.revisions),
            category: formData.category,
            currency: 'INR',
            is_active: true,
          })

        if (error) throw error
        toast.success('Service created!')
      }

      setShowForm(false)
      setEditingService(null)
      setFormData({ title: '', description: '', price: '', delivery_days: '', revisions: '2', category: '' })
      loadServices()
    } catch (error: any) {
      console.error('Error saving service:', error)
      toast.error(error.message || 'Failed to save service')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      delivery_days: service.delivery_days.toString(),
      revisions: service.revisions.toString(),
      category: service.category || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete service')
    } else {
      toast.success('Service deleted')
      loadServices()
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(currentStatus ? 'Service deactivated' : 'Service activated')
      loadServices()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleNotch className="h-8 w-8 animate-spin text-purple-500" weight="bold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Services</h1>
            <p className="text-zinc-400">Manage your service offerings</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingService(null)
              setFormData({ title: '', description: '', price: '', delivery_days: '', revisions: '2', category: '' })
            }}
            className="bg-purple-600 hover:bg-purple-500"
          >
            <Plus className="h-5 w-5 mr-2" weight="bold" />
            Add Service
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingService ? 'Edit Service' : 'New Service'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Service Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Instagram Reel"
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what's included..."
                  rows={4}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Social Media"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Price (₹)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="5000"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Delivery Days</Label>
                  <Input
                    type="number"
                    value={formData.delivery_days}
                    onChange={(e) => setFormData({ ...formData, delivery_days: e.target.value })}
                    placeholder="3"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Revisions</Label>
                  <Input
                    type="number"
                    value={formData.revisions}
                    onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                    placeholder="2"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-500">
                  {editingService ? 'Update' : 'Create'} Service
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingService(null)
                  }}
                  className="border-zinc-700 text-zinc-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {services.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No services yet. Create your first service to get started!
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{service.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          service.is_active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-zinc-400 mb-4">{service.description}</p>
                    <div className="flex gap-6 text-sm">
                      <span className="text-zinc-500">
                        Price: <span className="text-white font-semibold">₹{service.price}</span>
                      </span>
                      <span className="text-zinc-500">
                        Delivery: <span className="text-white">{service.delivery_days} days</span>
                      </span>
                      <span className="text-zinc-500">
                        Revisions: <span className="text-white">{service.revisions}</span>
                      </span>
                      {service.category && (
                        <span className="text-zinc-500">
                          Category: <span className="text-white">{service.category}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(service.id, service.is_active)}
                      className="border-zinc-700 text-zinc-300"
                    >
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                      className="border-zinc-700 text-zinc-300"
                    >
                      <Pencil className="h-4 w-4" weight="bold" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(service.id)}
                      className="border-red-900 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash className="h-4 w-4" weight="bold" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

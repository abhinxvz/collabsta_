'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Trash, CircleNotch, Image as ImageIcon } from '@phosphor-icons/react'

interface PortfolioItem {
  id: string
  title: string
  url: string
  type: string
  created_at: string
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading portfolio:', error)
      toast.error('Failed to load portfolio')
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !imageFile) {
      toast.error('Please select an image')
      return
    }

    try {
      setUploading(true)

      // Upload image
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName)

      // Create portfolio item
      const { error } = await supabase
        .from('portfolio_items')
        .insert({
          type: 'image',
          influencer_id: user.id,
          title: formData.title,
          url: publicUrl,
        })

      if (error) throw error

      toast.success('Portfolio item added!')
      setShowForm(false)
      setFormData({ title: '' })
      setImageFile(null)
      loadPortfolio()
    } catch (error: any) {
      console.error('Error adding portfolio item:', error)
      toast.error(error.message || 'Failed to add item')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      // Delete from storage
      const path = imageUrl.split('/portfolio/')[1]
      if (path) {
        await supabase.storage.from('portfolio').remove([path])
      }

      // Delete from database
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Item deleted')
      loadPortfolio()
    } catch (error: any) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
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
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
            <p className="text-zinc-400">Showcase your best work</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-500"
          >
            <Plus className="h-5 w-5 mr-2" weight="bold" />
            Add Item
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">New Portfolio Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Project name"
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-zinc-300">Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-500"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <CircleNotch className="h-4 w-4 mr-2 animate-spin" weight="bold" />
                      Uploading...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setImageFile(null)
                  }}
                  className="border-zinc-700 text-zinc-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-500">
              No portfolio items yet. Showcase your work!
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all"
              >
                <div className="aspect-video relative overflow-hidden bg-zinc-800">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item.id, item.url)}
                  className="absolute top-2 right-2 border-red-900 text-red-400 hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-4 w-4" weight="bold" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Trash, CircleNotch, Star, Quotes } from '@phosphor-icons/react'

interface Testimonial {
  id: string
  brand_name: string
  brand_logo: string | null
  content: string
  rating: number
  is_featured: boolean
  created_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    brand_name: '',
    brand_logo: '',
    content: '',
    rating: 5,
  })
  const supabase = createClient()

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading testimonials:', error)
      toast.error('Failed to load testimonials')
    } else {
      setTestimonials(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          influencer_id: user.id,
          brand_name: formData.brand_name,
          brand_logo: formData.brand_logo || null,
          content: formData.content,
          rating: formData.rating,
          is_featured: false,
        })

      if (error) throw error

      toast.success('Testimonial added!')
      setShowForm(false)
      setFormData({ brand_name: '', brand_logo: '', content: '', rating: 5 })
      loadTestimonials()
    } catch (error: any) {
      console.error('Error adding testimonial:', error)
      toast.error(error.message || 'Failed to add testimonial')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete testimonial')
    } else {
      toast.success('Testimonial deleted')
      loadTestimonials()
    }
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_featured: !currentStatus })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(currentStatus ? 'Removed from featured' : 'Added to featured')
      loadTestimonials()
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
            <h1 className="text-3xl font-bold text-white mb-2">Testimonials</h1>
            <p className="text-zinc-400">Showcase client feedback and reviews</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-500"
          >
            <Plus className="h-5 w-5 mr-2" weight="bold" />
            Add Testimonial
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">New Testimonial</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Brand Name</Label>
                <Input
                  value={formData.brand_name}
                  onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  placeholder="e.g., Nike"
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300">Brand Logo URL (optional)</Label>
                <Input
                  value={formData.brand_logo}
                  onChange={(e) => setFormData({ ...formData, brand_logo: e.target.value })}
                  placeholder="https://..."
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Testimonial</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="What did they say about working with you..."
                  rows={4}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300">Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating <= formData.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-zinc-600'
                        }`}
                        weight="fill"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-500">
                  Add Testimonial
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-zinc-700 text-zinc-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-zinc-500">
              No testimonials yet. Add your first client review!
            </div>
          ) : (
            testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all relative"
              >
                <Quotes className="absolute top-4 right-4 h-12 w-12 text-purple-500/20" weight="fill" />
                
                <div className="flex items-start gap-4 mb-4">
                  {testimonial.brand_logo ? (
                    <img
                      src={testimonial.brand_logo}
                      alt={testimonial.brand_name}
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                      {testimonial.brand_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{testimonial.brand_name}</h3>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-zinc-600'
                          }`}
                          weight="fill"
                        />
                      ))}
                    </div>
                  </div>
                  {testimonial.is_featured && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-zinc-300 mb-4 italic">"{testimonial.content}"</p>

                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                    className="border-zinc-700 text-zinc-300"
                  >
                    {testimonial.is_featured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(testimonial.id)}
                    className="border-red-900 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash className="h-4 w-4" weight="bold" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

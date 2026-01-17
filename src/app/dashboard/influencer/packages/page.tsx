'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Pencil, Trash, CircleNotch, Package } from '@phosphor-icons/react'

interface Service {
  id: string
  title: string
  price: number
}

interface ServicePackage {
  id: string
  title: string
  description: string
  service_ids: string[]
  original_price: number
  package_price: number
  is_active: boolean
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    selectedServices: [] as string[],
    package_price: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load services
    const { data: servicesData } = await supabase
      .from('services')
      .select('id, title, price')
      .eq('influencer_id', user.id)
      .eq('is_active', true)

    setServices(servicesData || [])

    // Load packages
    const { data: packagesData } = await supabase
      .from('service_packages')
      .select('*')
      .eq('influencer_id', user.id)
      .order('created_at', { ascending: false })

    setPackages(packagesData || [])
    setLoading(false)
  }

  const calculateOriginalPrice = (serviceIds: string[]) => {
    return services
      .filter(s => serviceIds.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (formData.selectedServices.length < 2) {
      toast.error('Select at least 2 services')
      return
    }

    const originalPrice = calculateOriginalPrice(formData.selectedServices)

    try {
      if (editingPackage) {
        const { error } = await supabase
          .from('service_packages')
          .update({
            title: formData.title,
            description: formData.description,
            service_ids: formData.selectedServices,
            original_price: originalPrice,
            package_price: parseFloat(formData.package_price),
          })
          .eq('id', editingPackage.id)

        if (error) throw error
        toast.success('Package updated!')
      } else {
        const { error } = await supabase
          .from('service_packages')
          .insert({
            influencer_id: user.id,
            title: formData.title,
            description: formData.description,
            service_ids: formData.selectedServices,
            original_price: originalPrice,
            package_price: parseFloat(formData.package_price),
            is_active: true,
          })

        if (error) throw error
        toast.success('Package created!')
      }

      setShowForm(false)
      setEditingPackage(null)
      setFormData({ title: '', description: '', selectedServices: [], package_price: '' })
      loadData()
    } catch (error: any) {
      console.error('Error saving package:', error)
      toast.error(error.message || 'Failed to save package')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package?')) return

    const { error } = await supabase
      .from('service_packages')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete package')
    } else {
      toast.success('Package deleted')
      loadData()
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('service_packages')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(currentStatus ? 'Package deactivated' : 'Package activated')
      loadData()
    }
  }

  const getServiceNames = (serviceIds: string[]) => {
    return services
      .filter(s => serviceIds.includes(s.id))
      .map(s => s.title)
      .join(', ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleNotch className="h-8 w-8 animate-spin text-purple-500" weight="bold" />
      </div>
    )
  }

  const originalPrice = calculateOriginalPrice(formData.selectedServices)
  const discount = originalPrice && formData.package_price 
    ? Math.round(((originalPrice - parseFloat(formData.package_price)) / originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Package Deals</h1>
            <p className="text-zinc-400">Bundle services and offer discounts</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true)
              setEditingPackage(null)
              setFormData({ title: '', description: '', selectedServices: [], package_price: '' })
            }}
            className="bg-purple-600 hover:bg-purple-500"
          >
            <Plus className="h-5 w-5 mr-2" weight="bold" />
            Create Package
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPackage ? 'Edit Package' : 'New Package'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Package Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Social Media Bundle"
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's included in this package..."
                  rows={3}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300 mb-3 block">Select Services (min 2)</Label>
                <div className="space-y-2">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, selectedServices: [...formData.selectedServices, service.id] })
                          } else {
                            setFormData({ ...formData, selectedServices: formData.selectedServices.filter(id => id !== service.id) })
                          }
                        }}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-600"
                      />
                      <span className="flex-1 text-white">{service.title}</span>
                      <span className="text-zinc-400">₹{service.price}</span>
                    </label>
                  ))}
                </div>
              </div>
              {originalPrice > 0 && (
                <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700">
                  <p className="text-zinc-400 mb-2">
                    Original Price: <span className="text-white font-semibold">₹{originalPrice}</span>
                  </p>
                  <div>
                    <Label className="text-zinc-300">Package Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData.package_price}
                      onChange={(e) => setFormData({ ...formData, package_price: e.target.value })}
                      placeholder={originalPrice.toString()}
                      className="bg-zinc-800/50 border-zinc-700 text-white"
                      required
                    />
                  </div>
                  {discount > 0 && (
                    <p className="text-green-400 mt-2">
                      {discount}% discount • Save ₹{originalPrice - parseFloat(formData.package_price)}
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-500">
                  {editingPackage ? 'Update' : 'Create'} Package
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingPackage(null)
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
          {packages.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No packages yet. Create your first bundle deal!
            </div>
          ) : (
            packages.map((pkg) => {
              const savings = pkg.original_price - pkg.package_price
              const discountPercent = Math.round((savings / pkg.original_price) * 100)

              return (
                <div
                  key={pkg.id}
                  className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="h-6 w-6 text-purple-500" weight="duotone" />
                        <h3 className="text-xl font-bold text-white">{pkg.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            pkg.is_active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                          {discountPercent}% OFF
                        </span>
                      </div>
                      <p className="text-zinc-400 mb-4">{pkg.description}</p>
                      <div className="mb-4">
                        <p className="text-sm text-zinc-500 mb-2">Includes:</p>
                        <p className="text-white">{getServiceNames(pkg.service_ids)}</p>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <span className="text-zinc-500">
                          Original: <span className="line-through text-zinc-400">₹{pkg.original_price}</span>
                        </span>
                        <span className="text-zinc-500">
                          Package Price: <span className="text-white font-semibold text-lg">₹{pkg.package_price}</span>
                        </span>
                        <span className="text-green-400">
                          Save ₹{savings}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleActive(pkg.id, pkg.is_active)}
                        className="border-zinc-700 text-zinc-300"
                      >
                        {pkg.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(pkg.id)}
                        className="border-red-900 text-red-400 hover:bg-red-900/20"
                      >
                        <Trash className="h-4 w-4" weight="bold" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { ArrowRight, ArrowLeft, Check, CircleNotch, Upload, Plus, X, InstagramLogo, TwitterLogo, YoutubeLogo, LinkedinLogo, Globe } from '@phosphor-icons/react'

const niches = ['Fashion', 'Tech', 'Lifestyle', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming', 'Education', 'Finance', 'Entertainment', 'Other']

export default function InfluencerOnboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [services, setServices] = useState([{ title: '', description: '', price: '', deliveryDays: '', revisions: '2', deliverables: '' }])
  const [form, setForm] = useState({
    bio: '', city: '', country: '', niche: '', followers_count: '',
    instagram: '', twitter: '', youtube: '', linkedin: '', website: '',
    avatar_url: ''
  })
  const router = useRouter()
  const supabase = createClient()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatarPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const addPortfolioImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && portfolioImages.length < 6) {
      const reader = new FileReader()
      reader.onloadend = () => setPortfolioImages([...portfolioImages, reader.result as string])
      reader.readAsDataURL(file)
    }
  }

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== index))
  }

  const addService = () => {
    if (services.length < 5) {
      setServices([...services, { title: '', description: '', price: '', deliveryDays: '', revisions: '2', deliverables: '' }])
    }
  }

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index))
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        toast.error('Please verify your email and login to continue')
        router.push('/auth/login')
        return
      }

      // Upload avatar if exists
      let avatarUrl = form.avatar_url
      if (avatarPreview && avatarPreview.startsWith('data:')) {
        const file = await fetch(avatarPreview).then(r => r.blob())
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/avatar.jpg`, file, { upsert: true })
        
        if (uploadError) {
          console.error('Avatar upload error:', uploadError)
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
          avatarUrl = publicUrl
        }
      }

      // Update profile
      const { error: profileError } = await supabase.from('profiles').update({
        bio: form.bio, 
        city: form.city, 
        country: form.country, 
        avatar_url: avatarUrl
      }).eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        toast.error('Failed to update profile')
        return
      }

      // Update influencer details
      const { error: detailsError } = await supabase.from('influencer_details').update({
        niche: form.niche,
        instagram: form.instagram,
        youtube: form.youtube,
        linkedin: form.linkedin,
        website: form.website,
        followers_count: parseInt(form.followers_count) || 0
      }).eq('user_id', user.id)

      if (detailsError) {
        console.error('Details update error:', detailsError)
      }

      // Upload portfolio images
      for (let i = 0; i < portfolioImages.length; i++) {
        if (portfolioImages[i].startsWith('data:')) {
          try {
            const file = await fetch(portfolioImages[i]).then(r => r.blob())
            const { data: uploadData } = await supabase.storage
              .from('portfolio')
              .upload(`${user.id}/portfolio_${i}.jpg`, file, { upsert: true })
            
            if (uploadData) {
              const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(uploadData.path)
              await supabase.from('portfolio_items').insert({
                influencer_id: user.id, 
                type: 'image', 
                url: publicUrl, 
                title: `Portfolio ${i + 1}`
              })
            }
          } catch (err) {
            console.error('Portfolio upload error:', err)
          }
        }
      }

      // Create services
      for (const service of services) {
        if (service.title && service.price) {
          try {
            await supabase.from('services').insert({
              influencer_id: user.id,
              title: service.title,
              description: `${service.description}\n\nDeliverables: ${service.deliverables}`,
              price: parseFloat(service.price),
              delivery_days: parseInt(service.deliveryDays) || 3,
              revisions: parseInt(service.revisions) || 2,
              category: form.niche,
              currency: 'INR',
              is_active: true
            })
          } catch (err) {
            console.error('Service creation error:', err)
          }
        }
      }

      toast.success('Profile setup complete!')
      router.push('/dashboard/influencer')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      
      <div className="w-full max-w-2xl relative">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/collabsta24.png" alt="Collabsta" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-2xl text-white">Collabsta</span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-12 h-1 rounded-full transition-colors ${step >= i ? 'bg-purple-500' : 'bg-zinc-700'}`} />
            ))}
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-purple-400 mb-2">Step {step} of {totalSteps}</p>
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 && 'Profile & Photo'}
              {step === 2 && 'Social Accounts'}
              {step === 3 && 'Portfolio'}
              {step === 4 && 'Your Services & Pricing'}
            </h1>
            <p className="text-zinc-400">
              {step === 1 && 'Add your photo and basic info'}
              {step === 2 && 'Connect your social media accounts'}
              {step === 3 && 'Showcase your best work'}
              {step === 4 && 'Set up what you offer and pricing'}
            </p>
          </div>

          {/* Step 1: Profile & Photo */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <label className="cursor-pointer group">
                  <div className="w-28 h-28 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-600 group-hover:border-purple-500 flex items-center justify-center overflow-hidden transition-colors">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 text-zinc-500 mx-auto mb-1" />
                        <span className="text-xs text-zinc-500">Upload</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <div>
                <Label className="text-zinc-300">Bio *</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell brands what makes you unique, your content style, audience demographics..." rows={3} className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Niche *</Label>
                  <Select value={form.niche} onValueChange={(v) => setForm({ ...form, niche: v })}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white h-11"><SelectValue placeholder="Select niche" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {niches.map(n => <SelectItem key={n} value={n} className="text-zinc-300 focus:bg-zinc-800">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-zinc-300">Total Followers</Label>
                  <Input type="number" value={form.followers_count} onChange={(e) => setForm({ ...form, followers_count: e.target.value })} placeholder="50000" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
                </div>
                <div>
                  <Label className="text-zinc-300">Country</Label>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
                </div>
              </div>

                            <ShimmerButton onClick={() => setStep(2)} disabled={!form.bio || !form.niche} className="w-full justify-center">
                Continue
              </ShimmerButton>
            </div>
          )}

                    {/* Step 2: Social Accounts */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-zinc-300 flex items-center gap-2"><InstagramLogo className="h-4 w-4" weight="duotone" /> Instagram</Label>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@yourusername" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2"><TwitterLogo className="h-4 w-4" weight="duotone" /> Twitter / X</Label>
                <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} placeholder="@yourusername" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2"><YoutubeLogo className="h-4 w-4" weight="duotone" /> YouTube</Label>
                <Input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/@channel" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2"><LinkedinLogo className="h-4 w-4" weight="duotone" /> LinkedIn</Label>
                <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/username" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2"><Globe className="h-4 w-4" weight="duotone" /> Website</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourwebsite.com" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>

                            <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <ShimmerButton onClick={() => setStep(3)} className="flex-1 justify-center">
                  Continue
                </ShimmerButton>
              </div>
            </div>
          )}

          {/* Step 3: Portfolio */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Upload up to 6 images showcasing your best work</p>
              
              <div className="grid grid-cols-3 gap-3">
                {portfolioImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => removePortfolioImage(i)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
                {portfolioImages.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-purple-500 flex items-center justify-center cursor-pointer transition-colors">
                    <div className="text-center">
                      <Plus className="h-6 w-6 text-zinc-500 mx-auto mb-1" />
                      <span className="text-xs text-zinc-500">Add Image</span>
                    </div>
                    <input type="file" accept="image/*" onChange={addPortfolioImage} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <ShimmerButton onClick={() => setStep(4)} className="flex-1 justify-center">
                  Continue
                </ShimmerButton>
              </div>
            </div>
          )}

          {/* Step 4: Services & Pricing */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">Add services you offer with pricing. You can add more later.</p>
              
              {services.map((service, index) => (
                <div key={index} className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-400">Service {index + 1}</span>
                    {services.length > 1 && (
                      <button onClick={() => removeService(index)} className="text-zinc-500 hover:text-red-400">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Input value={service.title} onChange={(e) => updateService(index, 'title', e.target.value)} placeholder="Service name (e.g., Instagram Reel)" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
                  <Textarea value={service.description} onChange={(e) => updateService(index, 'description', e.target.value)} placeholder="What's included in this service..." rows={2} className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
                  <Input value={service.deliverables} onChange={(e) => updateService(index, 'deliverables', e.target.value)} placeholder="Deliverables (e.g., 1 Reel + 2 Stories)" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" value={service.price} onChange={(e) => updateService(index, 'price', e.target.value)} placeholder="Price ₹" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
                    <Input type="number" value={service.deliveryDays} onChange={(e) => updateService(index, 'deliveryDays', e.target.value)} placeholder="Days" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
                    <Input type="number" value={service.revisions} onChange={(e) => updateService(index, 'revisions', e.target.value)} placeholder="Revisions" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
                  </div>
                </div>
              ))}

              {services.length < 5 && (
                <button onClick={addService} className="w-full p-3 rounded-lg border border-dashed border-zinc-700 text-zinc-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Add Another Service
                </button>
              )}

                            <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)} className="flex-1 h-11 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                                                <ShimmerButton onClick={handleComplete} disabled={loading} showArrow={false} className="flex-1 justify-center">
                  {loading ? (
                    <CircleNotch className="h-4 w-4 animate-spin" weight="bold" />
                  ) : (
                    <>
                      <span>Complete</span>
                      <Check className="h-4 w-4" weight="bold" />
                    </>
                  )}
                </ShimmerButton>
              </div>
              <button onClick={handleComplete} className="w-full text-sm text-zinc-500 hover:text-zinc-300">Skip for now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

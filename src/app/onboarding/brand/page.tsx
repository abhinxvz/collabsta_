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
import { ArrowRight, ArrowLeft, Check, CircleNotch, Upload, Buildings, Target, Wallet } from '@phosphor-icons/react'

const industries = ['E-commerce', 'SaaS', 'Fashion', 'Food & Beverage', 'Health & Wellness', 'Finance', 'Education', 'Entertainment', 'Travel', 'Real Estate', 'Agency', 'Startup', 'Other']
const budgetRanges = ['Under ₹10,000', '₹10,000 - ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000 - ₹5,00,000', 'Above ₹5,00,000']
const campaignTypes = ['Product Launch', 'Brand Awareness', 'Sales/Conversion', 'Content Creation', 'Event Promotion', 'App Install', 'Other']

export default function BrandOnboarding() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    brand_name: '', brand_website: '', industry: '', gst_number: '',
    description: '', target_audience: '', monthly_budget: '', campaign_type: '',
    logo_url: ''
  })
  const router = useRouter()
  const supabase = createClient()

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setLogoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleComplete = async () => {
    if (!form.brand_name) { 
      toast.error('Please enter your brand name')
      return 
    }
    
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { 
        toast.error('Please login first')
        router.push('/auth/login')
        return 
      }

      // Upload logo if exists
      let logoUrl = form.logo_url
      if (logoPreview && logoPreview.startsWith('data:')) {
        const file = await fetch(logoPreview).then(r => r.blob())
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}/logo.jpg`, file, { upsert: true })
        
        if (uploadError) {
          console.error('Logo upload error:', uploadError)
        } else if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(uploadData.path)
          logoUrl = publicUrl
        }
      }

      // Update profile with logo
      const { error: profileError } = await supabase.from('profiles').update({
        avatar_url: logoUrl,
        bio: form.description
      }).eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        toast.error('Failed to update profile')
        return
      }

      // Update brand details
      const { error: detailsError } = await supabase.from('brand_details').update({
        brand_name: form.brand_name,
        brand_website: form.brand_website,
        industry: form.industry,
        gst_number: form.gst_number
      }).eq('user_id', user.id)

      if (detailsError) {
        console.error('Details update error:', detailsError)
      }

      toast.success('Brand profile setup complete!')
      router.push('/dashboard/brand')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      
      <div className="w-full max-w-lg relative">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/collabsta24.png" alt="Collabsta" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-2xl text-white">Collabsta</span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          {/* Progress */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-16 h-1 rounded-full transition-colors ${step >= i ? 'bg-purple-500' : 'bg-zinc-700'}`} />
            ))}
          </div>

          <div className="text-center mb-8">
            <p className="text-sm text-purple-400 mb-2">Step {step} of {totalSteps}</p>
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 && 'Brand Details'}
              {step === 2 && 'Campaign Goals'}
              {step === 3 && 'Budget & Preferences'}
            </h1>
            <p className="text-zinc-400">
              {step === 1 && 'Tell us about your brand'}
              {step === 2 && 'What are you looking to achieve?'}
              {step === 3 && 'Set your budget and preferences'}
            </p>
          </div>

          {/* Step 1: Brand Details */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Logo Upload */}
              <div className="flex justify-center">
                <label className="cursor-pointer group">
                  <div className="w-24 h-24 rounded-xl bg-zinc-800 border-2 border-dashed border-zinc-600 group-hover:border-purple-500 flex items-center justify-center overflow-hidden transition-colors">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                      <div className="text-center">
                        <Buildings className="h-6 w-6 text-zinc-500 mx-auto mb-1" weight="duotone" />
                        <span className="text-xs text-zinc-500">Logo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              </div>

              <div>
                <Label className="text-zinc-300">Brand Name *</Label>
                <Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} placeholder="Your Brand Name" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>

              <div>
                <Label className="text-zinc-300">Brand Website</Label>
                <Input value={form.brand_website} onChange={(e) => setForm({ ...form, brand_website: e.target.value })} placeholder="https://yourbrand.com" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>

              <div>
                <Label className="text-zinc-300">Industry *</Label>
                <Select value={form.industry} onValueChange={(v) => setForm({ ...form, industry: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white h-11"><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {industries.map(i => <SelectItem key={i} value={i} className="text-zinc-300 focus:bg-zinc-800">{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-zinc-300">GST Number (optional)</Label>
                <Input value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="For invoicing" className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 h-11" />
              </div>

                            <ShimmerButton onClick={() => setStep(2)} disabled={!form.brand_name || !form.industry} className="w-full justify-center">
                Continue
              </ShimmerButton>
            </div>
          )}

          {/* Step 2: Campaign Goals */}
          {step === 2 && (
            <div className="space-y-5">
                            <div>
                <Label className="text-zinc-300 flex items-center gap-2"><Target className="h-4 w-4" weight="duotone" /> Brand Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell creators about your brand, products, and what makes you unique..." rows={3} className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
              </div>

              <div>
                <Label className="text-zinc-300">Target Audience</Label>
                <Textarea value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} placeholder="Describe your ideal customer (age, interests, location...)" rows={2} className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500" />
              </div>

              <div>
                <Label className="text-zinc-300">Campaign Type</Label>
                <Select value={form.campaign_type} onValueChange={(v) => setForm({ ...form, campaign_type: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white h-11"><SelectValue placeholder="What are you looking for?" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {campaignTypes.map(t => <SelectItem key={t} value={t} className="text-zinc-300 focus:bg-zinc-800">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
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

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="space-y-5">
                            <div>
                <Label className="text-zinc-300 flex items-center gap-2"><Wallet className="h-4 w-4" weight="duotone" /> Monthly Budget for Influencer Marketing</Label>
                <Select value={form.monthly_budget} onValueChange={(v) => setForm({ ...form, monthly_budget: v })}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white h-11"><SelectValue placeholder="Select budget range" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {budgetRanges.map(b => <SelectItem key={b} value={b} className="text-zinc-300 focus:bg-zinc-800">{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <h3 className="font-medium text-purple-300 mb-2">What you'll get:</h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Access to verified creators across all niches</li>
                  <li>• Direct messaging with creators</li>
                  <li>• Secure payment protection</li>
                  <li>• Campaign tracking dashboard</li>
                  <li>• Save & organize favorite creators</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center gap-2">
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

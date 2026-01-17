'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { UserRole } from '@/types/database'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { CircleNotch, Sparkle, Buildings, ArrowLeft } from '@phosphor-icons/react'

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setLoading(true)

    try {
      // Check username availability
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      if (existing) {
        toast.error('Username already taken')
        return
      }

      // Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, name, username: username.toLowerCase() }
        }
      })

      if (error) {
        console.error('Auth signup error:', error)
        toast.error(error.message)
        return
      }

      if (!data.user) {
        toast.error('Failed to create account')
        return
      }

      console.log('User created:', data.user.id)

      // Create profile using database function (bypasses RLS)
      const { error: profileError } = await supabase.rpc('create_profile_for_user', {
        user_id: data.user.id,
        user_role: role,
        user_username: username.toLowerCase(),
        user_name: name,
      })

      console.log('Profile creation result:', { profileError })

      if (profileError && profileError.message) {
        console.error('Profile creation error:', profileError)
        toast.error(`Profile error: ${profileError.message}`)
        return
      }

      console.log('Profile created successfully')

      toast.success('Account created!')
      router.push(role === 'influencer' ? '/onboarding/influencer' : '/onboarding/brand')
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
        
        <div className="w-full max-w-md relative">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <img src="/collabsta24.png" alt="Collabsta" className="w-10 h-10 rounded-xl" />
              <span className="font-bold text-2xl text-white">Collabsta</span>
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Join Collabsta</h1>
              <p className="text-zinc-400">Choose how you want to use the platform</p>
            </div>

            <div className="space-y-4">
                            <button
                onClick={() => { setRole('influencer'); setStep('details') }}
                className="w-full p-5 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Sparkle className="h-6 w-6 text-purple-400" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">I'm a Creator</h3>
                    <p className="text-zinc-500 text-sm">Offer services, showcase portfolio, get paid</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setRole('brand'); setStep('details') }}
                className="w-full p-5 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Buildings className="h-6 w-6 text-purple-400" weight="duotone" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">I'm a Brand</h3>
                    <p className="text-zinc-500 text-sm">Find creators, book services, grow your brand</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-zinc-500 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      
      <div className="w-full max-w-md relative">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <img src="/collabsta24.png" alt="Collabsta" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-2xl text-white">Collabsta</span>
          </Link>
        </div>

        <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-zinc-400">
              Signing up as {role === 'influencer' ? 'a Creator' : 'a Brand'}
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Full Name</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Username</Label>
              <Input
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 h-11"
                required
              />
              <p className="text-xs text-zinc-500">collabsta.bio/{username || 'username'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-purple-500 h-11"
                minLength={6}
                required
              />
            </div>
                                    <ShimmerButton type="submit" disabled={loading} showArrow={false} className="w-full justify-center">
              {loading ? <CircleNotch className="h-4 w-4 animate-spin" weight="bold" /> : 'Create Account'}
            </ShimmerButton>
          </form>

          <button
            onClick={() => setStep('role')}
            className="w-full flex items-center justify-center gap-2 text-sm text-zinc-500 mt-4 hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" weight="bold" /> Choose different role
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CircleNotch, User, Lock, Bell } from '@phosphor-icons/react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    instagram: '',
    youtube: '',
    twitter: '',
    tiktok: '',
    email: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error loading profile:', error)
    } else if (data) {
      setProfile({
        full_name: data.full_name || '',
        bio: data.bio || '',
        instagram: data.instagram || '',
        youtube: data.youtube || '',
        twitter: data.twitter || '',
        tiktok: data.tiktok || '',
        email: user.email || '',
      })
    }
    setLoading(false)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          instagram: profile.instagram,
          youtube: profile.youtube,
          twitter: profile.twitter,
          tiktok: profile.tiktok,
        })
        .eq('id', user.id)

      if (error) throw error
      toast.success('Profile updated!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      toast.success('Password updated!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setSaving(false)
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400">Manage your account settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-purple-500" weight="duotone" />
              <h2 className="text-xl font-bold text-white">Profile Information</h2>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <Label className="text-zinc-300">Full Name</Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300">Email</Label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-zinc-800/50 border-zinc-700 text-zinc-500"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-300">Instagram</Label>
                  <Input
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="@username"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">YouTube</Label>
                  <Input
                    value={profile.youtube}
                    onChange={(e) => setProfile({ ...profile, youtube: e.target.value })}
                    placeholder="@channel"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">Twitter</Label>
                  <Input
                    value={profile.twitter}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    placeholder="@username"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-zinc-300">TikTok</Label>
                  <Input
                    value={profile.tiktok}
                    onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                    placeholder="@username"
                    className="bg-zinc-800/50 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-500"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <CircleNotch className="h-4 w-4 mr-2 animate-spin" weight="bold" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </div>

          {/* Password Settings */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="h-6 w-6 text-purple-500" weight="duotone" />
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label className="text-zinc-300">New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-zinc-300">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-500"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <CircleNotch className="h-4 w-4 mr-2 animate-spin" weight="bold" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

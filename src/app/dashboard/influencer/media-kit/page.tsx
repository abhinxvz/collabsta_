'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CircleNotch, Download, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function MediaKitPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    instagram_followers: '',
    instagram_engagement: '',
    youtube_subscribers: '',
    youtube_views: '',
    tiktok_followers: '',
    tiktok_engagement: '',
  })
  const mediaKitRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*, influencer_details(*)')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setStats({
        instagram_followers: data.influencer_details?.followers_count?.toString() || '',
        instagram_engagement: '3.5',
        youtube_subscribers: '',
        youtube_views: '',
        tiktok_followers: '',
        tiktok_engagement: '',
      })
    }
    setLoading(false)
  }

  const generatePDF = async () => {
    if (!mediaKitRef.current) return

    try {
      setGenerating(true)
      const canvas = await html2canvas(mediaKitRef.current, {
        scale: 2,
        backgroundColor: '#09090b',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${profile?.username}-media-kit.pdf`)
      toast.success('Media kit downloaded!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setGenerating(false)
    }
  }

  const saveStats = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('influencer_details')
      .update({
        followers_count: parseInt(stats.instagram_followers) || 0,
      })
      .eq('user_id', user.id)

    if (error) {
      toast.error('Failed to save stats')
    } else {
      toast.success('Stats updated!')
      loadProfile()
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
            <h1 className="text-3xl font-bold text-white mb-2">Media Kit</h1>
            <p className="text-zinc-400">Generate your professional media kit</p>
          </div>
          <Button
            onClick={generatePDF}
            className="bg-purple-600 hover:bg-purple-500"
            disabled={generating}
          >
            {generating ? (
              <>
                <CircleNotch className="h-5 w-5 mr-2 animate-spin" weight="bold" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" weight="bold" />
                Download PDF
              </>
            )}
          </Button>
        </div>

        {/* Stats Input */}
        <div className="mb-8 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <h2 className="text-xl font-bold text-white mb-4">Update Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-zinc-300">Instagram Followers</Label>
              <Input
                type="number"
                value={stats.instagram_followers}
                onChange={(e) => setStats({ ...stats, instagram_followers: e.target.value })}
                placeholder="100000"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Instagram Engagement %</Label>
              <Input
                type="number"
                step="0.1"
                value={stats.instagram_engagement}
                onChange={(e) => setStats({ ...stats, instagram_engagement: e.target.value })}
                placeholder="3.5"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300">YouTube Subscribers</Label>
              <Input
                type="number"
                value={stats.youtube_subscribers}
                onChange={(e) => setStats({ ...stats, youtube_subscribers: e.target.value })}
                placeholder="50000"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300">YouTube Avg Views</Label>
              <Input
                type="number"
                value={stats.youtube_views}
                onChange={(e) => setStats({ ...stats, youtube_views: e.target.value })}
                placeholder="10000"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300">TikTok Followers</Label>
              <Input
                type="number"
                value={stats.tiktok_followers}
                onChange={(e) => setStats({ ...stats, tiktok_followers: e.target.value })}
                placeholder="200000"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300">TikTok Engagement %</Label>
              <Input
                type="number"
                step="0.1"
                value={stats.tiktok_engagement}
                onChange={(e) => setStats({ ...stats, tiktok_engagement: e.target.value })}
                placeholder="5.2"
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
          </div>
          <Button onClick={saveStats} className="mt-4 bg-purple-600 hover:bg-purple-500">
            Save Stats
          </Button>
        </div>

        {/* Media Kit Preview */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-purple-500" weight="bold" />
            <h2 className="text-xl font-bold text-white">Preview</h2>
          </div>
          
          <div ref={mediaKitRef} className="bg-gradient-to-br from-zinc-900 to-black p-12 rounded-xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{profile?.name}</h1>
              <p className="text-xl text-purple-400">@{profile?.username}</p>
              {profile?.influencer_details?.niche && (
                <p className="text-zinc-400 mt-2">{profile.influencer_details.niche} Creator</p>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <div className="mb-12 text-center max-w-2xl mx-auto">
                <p className="text-zinc-300 text-lg">{profile.bio}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 mb-12">
              {stats.instagram_followers && (
                <div className="text-center p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <p className="text-sm text-zinc-400 mb-2">Instagram</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {parseInt(stats.instagram_followers).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-400">{stats.instagram_engagement}% engagement</p>
                </div>
              )}
              {stats.youtube_subscribers && (
                <div className="text-center p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <p className="text-sm text-zinc-400 mb-2">YouTube</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {parseInt(stats.youtube_subscribers).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-400">{stats.youtube_views} avg views</p>
                </div>
              )}
              {stats.tiktok_followers && (
                <div className="text-center p-6 rounded-xl bg-zinc-800/50 border border-zinc-700">
                  <p className="text-sm text-zinc-400 mb-2">TikTok</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {parseInt(stats.tiktok_followers).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-400">{stats.tiktok_engagement}% engagement</p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="text-center pt-8 border-t border-zinc-800">
              <p className="text-zinc-400 mb-2">Let's Collaborate</p>
              <p className="text-white text-lg">collabsta.com/{profile?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

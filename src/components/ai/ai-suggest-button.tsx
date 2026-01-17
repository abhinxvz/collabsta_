'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AISuggestButtonProps {
  type: 'bio' | 'service_description' | 'service_price' | 'campaign_brief' | 'requirements'
  input: string
  onSuggestion: (suggestion: string) => void
  className?: string
}

export function AISuggestButton({ type, input, onSuggestion, className }: AISuggestButtonProps) {
  const [loading, setLoading] = useState(false)

  const getSuggestion = async () => {
    if (!input.trim()) {
      toast.error('Please enter some text first')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input })
      })

      const data = await res.json()
      if (data.suggestion) {
        onSuggestion(data.suggestion)
        toast.success('AI suggestion generated!')
      } else {
        toast.error('Failed to generate suggestion')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={getSuggestion}
      disabled={loading}
      className={`text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Sparkles className="h-3 w-3 mr-1" />
      )}
      AI Suggest
    </Button>
  )
}

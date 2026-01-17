'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CircleNotch, Check, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const supabase = createClient()

  useEffect(() => {
    loadAvailability()
  }, [currentMonth])

  const loadAvailability = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('influencer_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    const availMap: Record<string, boolean> = {}
    data?.forEach(item => {
      availMap[item.date] = item.is_available
    })
    setAvailability(availMap)
    setLoading(false)
  }

  const toggleAvailability = async (date: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isAvailable = !availability[date]

    const { error } = await supabase
      .from('availability')
      .upsert({
        influencer_id: user.id,
        date,
        is_available: isAvailable,
      }, {
        onConflict: 'influencer_id,date'
      })

    if (error) {
      toast.error('Failed to update availability')
    } else {
      setAvailability({ ...availability, [date]: isAvailable })
      toast.success(isAvailable ? 'Marked as available' : 'Marked as unavailable')
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleNotch className="h-8 w-8 animate-spin text-purple-500" weight="bold" />
      </div>
    )
  }

  const days = getDaysInMonth()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Availability Calendar</h1>
          <p className="text-zinc-400">Manage when you're available for collaborations</p>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={previousMonth}
              className="border-zinc-700 text-zinc-300"
            >
              ← Previous
            </Button>
            <h2 className="text-xl font-bold text-white">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="outline"
              onClick={nextMonth}
              className="border-zinc-700 text-zinc-300"
            >
              Next →
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-zinc-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const dateStr = formatDate(date)
              const isAvailable = availability[dateStr] !== false
              const past = isPast(date)
              const today = isToday(date)

              return (
                <button
                  key={dateStr}
                  onClick={() => !past && toggleAvailability(dateStr)}
                  disabled={past}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center
                    transition-all relative
                    ${past ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    ${today ? 'ring-2 ring-purple-500' : ''}
                    ${isAvailable 
                      ? 'bg-green-500/20 border-2 border-green-500/50 hover:bg-green-500/30' 
                      : 'bg-red-500/20 border-2 border-red-500/50 hover:bg-red-500/30'
                    }
                  `}
                >
                  <span className="text-white font-semibold">{date.getDate()}</span>
                  {!past && (
                    <div className="absolute bottom-1">
                      {isAvailable ? (
                        <Check className="h-3 w-3 text-green-400" weight="bold" />
                      ) : (
                        <X className="h-3 w-3 text-red-400" weight="bold" />
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-zinc-800 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border-2 border-green-500/50" />
              <span className="text-sm text-zinc-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border-2 border-red-500/50" />
              <span className="text-sm text-zinc-400">Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

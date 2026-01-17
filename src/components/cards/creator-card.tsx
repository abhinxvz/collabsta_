import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, MapPin, CheckCircle } from 'lucide-react'
import { InfluencerWithDetails } from '@/types/database'

interface CreatorCardProps {
  creator: InfluencerWithDetails
}

export function CreatorCard({ creator }: CreatorCardProps) {
  const details = creator.influencer_details

  return (
    <Link href={`/${creator.username}`}>
      <Card className="bg-zinc-900/50 border-zinc-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-zinc-700 group-hover:border-purple-500/50 transition-colors">
              <AvatarImage src={creator.avatar_url || ''} alt={creator.name} />
              <AvatarFallback className="bg-purple-500/20 text-purple-300 text-xl">
                {creator.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white truncate">{creator.name}</h3>
                {details?.verified && (
                  <CheckCircle className="h-4 w-4 text-purple-400 fill-purple-400/20" />
                )}
              </div>
              <p className="text-sm text-zinc-500">@{creator.username}</p>
              {details?.niche && (
                <Badge className="mt-2 bg-purple-500/20 text-purple-300 border-0 hover:bg-purple-500/30">
                  {details.niche}
                </Badge>
              )}
            </div>
          </div>
          
          {creator.bio && (
            <p className="text-sm text-zinc-400 mt-4 line-clamp-2">{creator.bio}</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800 text-sm">
            {(creator.city || creator.country) && (
              <div className="flex items-center gap-1 text-zinc-500">
                <MapPin className="h-4 w-4" />
                {[creator.city, creator.country].filter(Boolean).join(', ')}
              </div>
            )}
            {details?.rating_avg ? (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                {details.rating_avg.toFixed(1)} ({details.rating_count})
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

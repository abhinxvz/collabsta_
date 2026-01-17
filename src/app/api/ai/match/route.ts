import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { brandDescription, targetAudience, campaignType, budget } = await req.json()
    const supabase = await createClient()

    // Fetch all creators with their details
    const { data: creators } = await supabase
      .from('profiles')
      .select('*, influencer_details(*), services(*)')
      .eq('role', 'influencer')

    if (!creators || creators.length === 0) {
      return NextResponse.json({ matches: [], message: 'No creators found' })
    }

    // Prepare creator data for AI
    const creatorSummaries = creators.map(c => ({
      id: c.id,
      name: c.name,
      username: c.username,
      bio: c.bio,
      niche: c.influencer_details?.[0]?.niche,
      followers: c.influencer_details?.[0]?.followers_count,
      rating: c.influencer_details?.[0]?.rating_avg,
      services: c.services?.map((s: any) => ({ title: s.title, price: s.price, description: s.description })),
      location: `${c.city || ''} ${c.country || ''}`.trim()
    }))

    const prompt = `You are an AI matchmaker for an influencer marketing platform. 

Brand Requirements:
- Description: ${brandDescription}
- Target Audience: ${targetAudience}
- Campaign Type: ${campaignType}
- Budget: ${budget}

Available Creators:
${JSON.stringify(creatorSummaries, null, 2)}

Analyze the brand requirements and rank the top 5 most suitable creators. For each match, provide:
1. Creator ID
2. Match score (0-100)
3. Brief reason why they're a good fit (2-3 sentences)

Return ONLY a JSON array in this exact format:
[
  {"id": "creator-id", "score": 85, "reason": "Why they match..."},
  ...
]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const responseText = completion.choices[0].message.content || '[]'
    
    // Parse AI response
    let matches = []
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
    }

    // Enrich matches with full creator data
    const enrichedMatches = matches.map((match: any) => {
      const creator = creators.find(c => c.id === match.id)
      return {
        ...match,
        creator: creator ? {
          id: creator.id,
          name: creator.name,
          username: creator.username,
          bio: creator.bio,
          avatar_url: creator.avatar_url,
          niche: creator.influencer_details?.[0]?.niche,
          followers_count: creator.influencer_details?.[0]?.followers_count,
          rating_avg: creator.influencer_details?.[0]?.rating_avg,
        } : null
      }
    }).filter((m: any) => m.creator)

    return NextResponse.json({ matches: enrichedMatches })
  } catch (error: any) {
    console.error('AI Match Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

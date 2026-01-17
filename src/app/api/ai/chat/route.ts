import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { message, context, role } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: "AI is currently unavailable. Please configure the API key." 
      })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let userContext = ''
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        userContext = `User: ${profile.name}, Role: ${profile.role}, Username: @${profile.username}`
      }
    }

    const systemPrompt = role === 'influencer' 
      ? `You are Collabsta AI, a helpful assistant for content creators on an influencer marketplace platform.

Your role is to help creators:
- Optimize their profile and bio for better visibility
- Price their services competitively
- Write compelling service descriptions
- Understand brand requirements
- Improve their portfolio presentation
- Give tips on growing their audience
- Help with campaign deliverables

Be friendly, encouraging, and give actionable advice. Keep responses concise but helpful.
${userContext ? `\nContext: ${userContext}` : ''}`
      : `You are Collabsta AI, a helpful assistant for brands on an influencer marketplace platform.

Your role is to help brands:
- Find the right creators for their campaigns
- Write effective campaign briefs
- Understand influencer pricing
- Set realistic budgets
- Define target audiences
- Create successful collaboration strategies
- Measure campaign ROI

Be professional, insightful, and give actionable advice. Keep responses concise but helpful.
${userContext ? `\nContext: ${userContext}` : ''}`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context || []),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://collabsta.com',
        'X-Title': 'Collabsta'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenRouter Error:', errorData)
      throw new Error(errorData.error?.message || 'API request failed')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return NextResponse.json({ 
      response: `Sorry, I encountered an error: ${error.message || 'Please try again.'}` 
    })
  }
}

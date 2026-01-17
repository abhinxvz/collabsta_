import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { type, input } = await req.json()

    let prompt = ''

    switch (type) {
      case 'bio':
        prompt = `Write a compelling, professional bio for an influencer/content creator based on this info: "${input}". 
        Make it engaging, highlight unique value, and keep it under 150 words. Return only the bio text.`
        break
      
      case 'service_description':
        prompt = `Write a professional service description for an influencer offering: "${input}". 
        Include what's delivered, the value for brands, and make it compelling. Keep it under 100 words. Return only the description.`
        break
      
      case 'service_price':
        prompt = `Suggest a fair price range in INR for this influencer service: "${input}". 
        Consider Indian market rates. Return in format: "₹X,XXX - ₹X,XXX" with a brief 1-line explanation.`
        break
      
      case 'campaign_brief':
        prompt = `Write a clear campaign brief for brands looking for: "${input}". 
        Include objectives, deliverables expected, and key requirements. Keep it under 150 words. Return only the brief.`
        break
      
      case 'requirements':
        prompt = `Write clear requirements/brief for ordering this influencer service: "${input}". 
        Include what info the creator needs, brand guidelines to share, and timeline expectations. Keep it under 100 words.`
        break

      default:
        return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    })

    const suggestion = completion.choices[0].message.content

    return NextResponse.json({ suggestion })
  } catch (error: any) {
    console.error('AI Suggest Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Next.js App Router API route — replaces the old api/chat.js
// POST /api/chat
//   body: { message: string }
//   returns: { reply: string }
//
// If the caller is signed in, the exchange is automatically saved to Supabase.

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req) {
  const { message } = await req.json()

  if (!message?.trim()) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 })
  }

  // Call OpenAI (same model and format as the old api/chat.js)
  let reply
  try {
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: 'You are a helpful, concise AI assistant. Be clear and direct.' },
        { role: 'user',   content: message },
      ],
    })
    reply = response.output_text
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ reply: 'Error getting AI response' }, { status: 500 })
  }

  // Save to Supabase only when the user is signed in
  // auth() reads the Clerk session cookie — it returns null userId when logged out
  const { userId } = await auth()
  if (userId) {
    const { error } = await supabase.from('results').insert({
      user_id:  userId,
      title:    message.slice(0, 80),  // first 80 chars of the question
      score:    null,                  // no score for chat history
      feedback: reply,
    })
    if (error) console.error('Supabase insert error:', error.message)
  }

  return NextResponse.json({ reply })
}

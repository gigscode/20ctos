import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const categories = ['business', 'idea', 'career', 'creator', 'mentorship', 'other'] as const
const willingnessOptions = ['Yes', 'Maybe, depending on the solution', 'Not at the moment'] as const
const maxAnswerLength = 2000
const maxBodyLength = 10_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'This request could not be accepted.' }, { status: 403 })
  }

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return NextResponse.json({ error: 'Send your answers as a form submission.' }, { status: 415 })
  }

  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBodyLength) {
    return NextResponse.json({ error: 'Your answers are too long. Please shorten them and try again.' }, { status: 413 })
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'We could not read your answers. Please try again.' }, { status: 400 })
  }

  if (Buffer.byteLength(rawBody, 'utf8') > maxBodyLength) {
    return NextResponse.json({ error: 'Your answers are too long. Please shorten them and try again.' }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'We could not read your answers. Please try again.' }, { status: 400 })
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: 'Please check your answers and try again.' }, { status: 400 })
  }

  const category = body.category
  const biggestChallenge = typeof body.biggestChallenge === 'string' ? body.biggestChallenge.trim() : ''
  const desiredOutcome = typeof body.desiredOutcome === 'string' ? body.desiredOutcome.trim() : ''
  const previousAttempts = typeof body.previousAttempts === 'string' ? body.previousAttempts.trim() : ''
  const willingness = body.willingness

  if (!categories.some((option) => option === category)) {
    return NextResponse.json({ error: 'Please choose the option that feels closest to your situation.' }, { status: 400 })
  }
  if (!biggestChallenge || biggestChallenge.length > maxAnswerLength || !desiredOutcome || desiredOutcome.length > maxAnswerLength) {
    return NextResponse.json({ error: 'Please answer both questions and keep each answer under 2,000 characters.' }, { status: 400 })
  }
  if (previousAttempts.length > maxAnswerLength) {
    return NextResponse.json({ error: 'Please keep the optional answer under 2,000 characters.' }, { status: 400 })
  }
  if (willingness !== '' && !willingnessOptions.some((option) => option === willingness)) {
    return NextResponse.json({ error: 'Please check your optional answer and try again.' }, { status: 400 })
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: 'Please agree before saving your answers.' }, { status: 400 })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Conversation answers could not be saved because Supabase is not configured.')
    return NextResponse.json({ error: 'Saving answers is not available right now. You can still book a conversation.' }, { status: 503 })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    })
    const { error } = await supabase.from('conversation_submissions').insert({
      category,
      biggest_challenge: biggestChallenge,
      desired_outcome: desiredOutcome,
      previous_attempts: previousAttempts || null,
      willingness: willingness || null,
    })

    if (error) {
      console.error('Supabase could not save conversation answers:', error.message)
      return NextResponse.json({ error: 'We could not save your answers. Please try again or book a conversation directly.' }, { status: 503 })
    }
  } catch (error) {
    console.error('Supabase conversation submission failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'We could not save your answers. Please try again or book a conversation directly.' }, { status: 503 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

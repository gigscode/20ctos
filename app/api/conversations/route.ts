import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const categories = ['business', 'idea', 'career', 'creator', 'mentorship', 'other'] as const
const challenges: Record<(typeof categories)[number], string[]> = {
  business: ['steady_enquiries', 'converting_customers', 'growing_sales', 'day_to_day_work', 'using_technology', 'something_else'],
  idea: ['choosing_what_to_build', 'testing_an_idea', 'shaping_an_offer', 'building_first_version', 'finding_first_customers', 'something_else'],
  career: ['choosing_direction', 'learning_a_skill', 'finding_opportunities', 'changing_careers', 'building_confidence', 'something_else'],
  creator: ['finding_clients', 'pricing_work', 'promoting_work', 'managing_workload', 'growing_income', 'something_else'],
  mentorship: ['difficult_decision', 'choosing_next_step', 'building_confidence', 'staying_accountable', 'talking_it_through', 'something_else'],
  other: ['finding_direction', 'solving_a_problem', 'building_a_skill', 'getting_unstuck', 'something_else'],
}
const triedOptions = ['not_yet', 'on_my_own', 'advice_or_information', 'course_tool_or_service', 'professional_help']
const outcomeOptions = ['clear_next_step', 'practical_plan', 'feedback_on_idea', 'tools_or_skills', 'fresh_perspective']
const willingnessOptions = ['yes', 'maybe', 'not_now']
const maxBodyLength = 2000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isCategory(value: unknown): value is (typeof categories)[number] {
  return typeof value === 'string' && categories.some((option) => option === value)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) {
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
  const biggestChallenge = body.biggestChallenge
  const desiredOutcome = body.desiredOutcome
  const previousAttempts = body.previousAttempts
  const willingness = body.willingness

  if (!isCategory(category)) {
    return NextResponse.json({ error: 'Please choose the option that feels closest to your situation.' }, { status: 400 })
  }
  if (typeof biggestChallenge !== 'string' || !challenges[category].includes(biggestChallenge)) {
    return NextResponse.json({ error: 'Please choose the option that best describes your main challenge.' }, { status: 400 })
  }
  if (typeof previousAttempts !== 'string' || !triedOptions.includes(previousAttempts)) {
    return NextResponse.json({ error: 'Please choose what you have tried so far.' }, { status: 400 })
  }
  if (typeof desiredOutcome !== 'string' || !outcomeOptions.includes(desiredOutcome)) {
    return NextResponse.json({ error: 'Please choose the outcome that would be most useful.' }, { status: 400 })
  }
  if (typeof willingness !== 'string' || !willingnessOptions.includes(willingness)) {
    return NextResponse.json({ error: 'Please choose an answer about paid support.' }, { status: 400 })
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
      previous_attempts: previousAttempts,
      willingness,
      consent: true,
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

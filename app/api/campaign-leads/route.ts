import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Please check your answers and try again.' }, { status: 400 })
  }

  const { fullName, email, category, biggestChallenge, desiredOutcome, willingness, consent, honeypot } = payload as Record<string, unknown>
  if (typeof honeypot === 'string' && honeypot.length > 0) {
    return NextResponse.json({ received: true })
  }
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 160) {
    return NextResponse.json({ error: 'Please add your name.' }, { status: 400 })
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please add a valid email address.' }, { status: 400 })
  }
  if (typeof category !== 'string' || !['business', 'idea', 'career', 'creator', 'mentorship', 'other'].includes(category)) {
    return NextResponse.json({ error: 'Please choose the option that fits you best.' }, { status: 400 })
  }
  if (typeof biggestChallenge !== 'string' || biggestChallenge.trim().length < 2 || biggestChallenge.length > 4000 || typeof desiredOutcome !== 'string' || desiredOutcome.trim().length < 2 || desiredOutcome.length > 4000) {
    return NextResponse.json({ error: 'Please answer the two required questions.' }, { status: 400 })
  }
  if (!['Yes', 'Maybe, depending on the solution', 'Not at the moment'].includes(String(willingness)) || consent !== true) {
    return NextResponse.json({ error: 'Please choose an option and agree to the privacy note.' }, { status: 400 })
  }

  return NextResponse.json({ error: 'This form is not receiving answers just yet. Your details have not been saved. Please reach out on LinkedIn instead.' }, { status: 503 })
}

import { NextResponse } from 'next/server'
import {
  adminSessionCookie,
  adminSessionMaxAge,
  createAdminSession,
  isAdminAuthConfigured,
  verifyAdminPassword,
} from '@/lib/admin-auth'

function hasSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return Boolean(origin && origin === new URL(request.url).origin)
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  }
}

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: 'This request could not be accepted.' }, { status: 403 })
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: 'Admin sign-in is not configured yet. Add the required server settings and try again.' },
      { status: 503 },
    )
  }

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return NextResponse.json({ error: 'Send your password as a form submission.' }, { status: 415 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'We could not read the sign-in request.' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('password' in body) ||
    typeof body.password !== 'string' ||
    body.password.length > 1024
  ) {
    return NextResponse.json({ error: 'Enter your admin password and try again.' }, { status: 400 })
  }

  if (!verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: 'That password did not match. Please try again.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminSessionCookie, createAdminSession(), {
    ...cookieOptions(),
    maxAge: adminSessionMaxAge,
  })
  return response
}

export async function DELETE(request: Request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: 'This request could not be accepted.' }, { status: 403 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminSessionCookie, '', {
    ...cookieOptions(),
    maxAge: 0,
  })
  return response
}

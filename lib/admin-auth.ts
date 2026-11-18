import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

export const adminSessionCookie = '20ctos-admin-session'
export const adminSessionMaxAge = 60 * 60 * 8

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET &&
    process.env.ADMIN_SESSION_SECRET.length >= 32,
  )
}

export function verifyAdminPassword(password: string) {
  const expectedPassword = process.env.ADMIN_PASSWORD
  if (!expectedPassword || !isAdminAuthConfigured()) return false

  const providedHash = createHash('sha256').update(password).digest()
  const expectedHash = createHash('sha256').update(expectedPassword).digest()
  return timingSafeEqual(providedHash, expectedHash)
}

export function createAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters long.')
  }

  const expiresAt = Math.floor(Date.now() / 1000) + adminSessionMaxAge
  const payload = String(expiresAt)
  const signature = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function isValidAdminSession(token: string | undefined) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32 || !token) return false

  const [payload, signature, ...extra] = token.split('.')
  if (!payload || !signature || extra.length > 0 || !/^\d+$/.test(payload)) return false

  const expiresAt = Number(payload)
  const now = Math.floor(Date.now() / 1000)
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + adminSessionMaxAge) {
    return false
  }

  const expected = createHmac('sha256', secret).update(payload).digest()
  const received = Buffer.from(signature, 'base64url')
  return received.length === expected.length && timingSafeEqual(received, expected)
}

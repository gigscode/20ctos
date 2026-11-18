'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'

export default function AdminLoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result: unknown = await response.json()

      if (!response.ok) {
        const message = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'We could not sign you in. Please try again.'
        setError(message)
        return
      }

      window.location.assign('/admin')
    } catch {
      setError('We could not sign you in. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label htmlFor="admin-password">Admin password</label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        maxLength={1024}
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error && <p className="admin-form-error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting || !password}>
        {submitting ? 'Signing in…' : 'Open dashboard'} <ArrowRight size={16} aria-hidden="true" />
      </button>
    </form>
  )
}

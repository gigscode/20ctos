import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LockKeyhole } from 'lucide-react'
import { adminSessionCookie, isValidAdminSession } from '@/lib/admin-auth'
import AdminLoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Admin sign in | 20 Conversations',
  robots: { index: false, follow: false },
}

export default async function AdminLoginPage() {
  const token = (await cookies()).get(adminSessionCookie)?.value
  if (isValidAdminSession(token)) redirect('/admin')

  return (
    <main className="admin-login-page">
      <a className="admin-back-link" href="/">20 CONVERSATIONS <span>/</span> HOME</a>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-mark"><LockKeyhole size={19} aria-hidden="true" /></div>
        <p className="admin-eyebrow">PRIVATE WORKSPACE</p>
        <h1 id="admin-login-title">Welcome back.</h1>
        <p className="admin-login-copy">Sign in to review conversation responses and look for useful patterns.</p>
        <AdminLoginForm />
      </section>
      <p className="admin-login-footnote">Responses are private and only available to the administrator.</p>
    </main>
  )
}

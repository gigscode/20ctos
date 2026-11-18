import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { adminSessionCookie, isAdminAuthConfigured, isValidAdminSession } from '@/lib/admin-auth'
import AdminDashboard, { type AdminResponse } from './response-dashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Response dashboard | 20 Conversations',
  robots: { index: false, follow: false },
}

const pageSize = 1000
const categories = ['business', 'idea', 'career', 'creator', 'mentorship', 'other'] as const
type Category = (typeof categories)[number]

type SearchParams = Promise<{
  category?: string
  from?: string
  to?: string
}>

function validDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)))
}

function nextDay(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString()
}

async function loadResponses(filters: { category?: Category; from?: string; to?: string }) {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return { responses: [], error: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the server environment to load private responses.' }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  })
  const responses: AdminResponse[] = []

  for (let offset = 0; ; offset += pageSize) {
    let query = supabase
      .from('conversation_submissions')
      .select('id, created_at, email, category, biggest_challenge, desired_outcome, previous_attempts, willingness, email_updates_consent')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (filters.category) query = query.eq('category', filters.category)
    if (filters.from) query = query.gte('created_at', `${filters.from}T00:00:00.000Z`)
    if (filters.to) query = query.lt('created_at', nextDay(filters.to))

    const { data, error } = await query
    if (error) {
      console.error('Admin dashboard could not load responses:', error.message)
      return { responses: [], error: 'We could not load the responses. Check the database setup and try again.' }
    }

    const page = (data ?? []) as AdminResponse[]
    responses.push(...page)
    if (page.length < pageSize) break
  }

  return { responses, error: '' }
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const token = (await cookies()).get(adminSessionCookie)?.value
  if (!isAdminAuthConfigured() || !isValidAdminSession(token)) redirect('/admin/login')

  const params = await searchParams
  const category = categories.find((item) => item === params.category)
  const from = validDate(params.from) ? params.from : undefined
  const to = validDate(params.to) ? params.to : undefined
  const filters = {
    category,
    from,
    to,
  }
  const { responses, error } = await loadResponses(filters)

  return <AdminDashboard responses={responses} error={error} filters={filters} />
}

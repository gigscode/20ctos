import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
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

// Reuse the client across requests in the same function instance.
// In serverless the module is re-evaluated on each cold start, so this only
// helps warm invocations, but it eliminates the extra allocation on every hit.
let _supabase: SupabaseClient | null = null
function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return null
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    })
  }
  return _supabase
}

function validDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)))
}

function nextDay(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString()
}

async function loadResponses(filters: { category?: Category; from?: string; to?: string }) {
  const supabase = getSupabase()
  if (!supabase) {
    return { responses: [], error: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the server environment to load private responses.' }
  }

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
  const filters = { category, from, to }
  const { responses, error } = await loadResponses(filters)

  // Compute weekly counts on the server so the client gets a stable snapshot
  // and avoids a hydration mismatch from Date.now() differing between renders.
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setUTCHours(0, 0, 0, 0)
  weekStart.setUTCDate(weekStart.getUTCDate() - 6 * 7 - ((weekStart.getUTCDay() + 6) % 7))
  const weekCounts = Array.from({ length: 7 }, () => 0)
  for (const response of responses) {
    const date = new Date(response.created_at)
    const week = Math.floor((date.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
    if (week >= 0 && week < weekCounts.length) weekCounts[week] += 1
  }

  return <AdminDashboard responses={responses} error={error} filters={filters} weekCounts={weekCounts} />
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, LogOut, Users } from 'lucide-react'

export type AdminResponse = {
  id: string
  created_at: string
  email: string | null
  category: string
  biggest_challenge: string
  desired_outcome: string
  previous_attempts: string
  willingness: string
  email_updates_consent: boolean
}

type Filters = {
  category?: string
  from?: string
  to?: string
}

type Choice = { value: string; label: string }

const categoryOptions: Choice[] = [
  { value: 'business', label: 'Business owner' },
  { value: 'idea', label: 'Idea or skill' },
  { value: 'career', label: 'Career growth' },
  { value: 'creator', label: 'Independent creator' },
  { value: 'mentorship', label: 'Looking for direction' },
  { value: 'other', label: 'Other' },
]

const answerLabels: Record<string, string> = {
  steady_enquiries: 'Getting steady enquiries',
  converting_customers: 'Turning enquiries into customers',
  growing_sales: 'Growing sales or revenue',
  day_to_day_work: 'Managing day-to-day work',
  using_technology: 'Using technology or AI',
  choosing_what_to_build: 'Choosing what to build',
  testing_an_idea: 'Testing whether people want it',
  shaping_an_offer: 'Planning a clear offer',
  building_first_version: 'Building the first version',
  finding_first_customers: 'Finding first customers',
  choosing_direction: 'Choosing a direction',
  learning_a_skill: 'Learning a useful skill',
  finding_opportunities: 'Finding better opportunities',
  changing_careers: 'Changing careers',
  building_confidence: 'Building confidence',
  finding_clients: 'Finding steady clients',
  pricing_work: 'Pricing my work',
  promoting_work: 'Promoting my work',
  managing_workload: 'Managing my workload',
  growing_income: 'Growing my income',
  difficult_decision: 'Making a difficult decision',
  choosing_next_step: 'Choosing a next step',
  staying_accountable: 'Staying accountable',
  talking_it_through: 'Talking it through',
  finding_direction: 'Finding direction',
  solving_a_problem: 'Solving a practical problem',
  building_a_skill: 'Building a skill',
  getting_unstuck: 'Getting unstuck',
  something_else: 'Something else',
  clear_next_step: 'A clearer next step',
  practical_plan: 'A practical plan',
  feedback_on_idea: 'Feedback on an idea',
  tools_or_skills: 'Tools or skills',
  fresh_perspective: 'A fresh point of view',
  not_yet: 'Not tried anything yet',
  on_my_own: 'Tried on my own',
  advice_or_information: 'Looked for advice',
  course_tool_or_service: 'Tried a course, tool, or service',
  professional_help: 'Paid for professional help',
  yes: 'Yes, if it feels like a good fit',
  maybe: 'Maybe, depending on the support',
  not_now: 'Not right now',
}

const categoryLabels = Object.fromEntries(categoryOptions.map((item) => [item.value, item.label]))

function label(value: string) {
  return answerLabels[value] ?? value.replaceAll('_', ' ')
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en', options).format(new Date(value))
}

function summarize(responses: AdminResponse[], key: keyof AdminResponse) {
  const counts = new Map<string, number>()
  for (const response of responses) {
    const value = response[key]
    if (typeof value === 'string' && value) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count, label: key === 'category' ? categoryLabels[value] ?? value : label(value) }))
    .sort((a, b) => b.count - a.count)
}

function DonutChart({ items, title }: { items: { label: string; count: number }[]; title: string }) {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const colors = ['#9b4b2d', '#315d71', '#d2a35f', '#778d6c', '#9d7b91', '#53617c']
  let offset = 0

  return (
    <div className="admin-donut-wrap">
      <div className="admin-donut" role="img" aria-label={`${title}: ${items.map((item) => `${item.label} ${item.count}`).join(', ') || 'no responses'}`}>
        <svg viewBox="0 0 42 42" aria-hidden="true">
          <circle className="admin-donut-track" cx="21" cy="21" r="15.9155" />
          {items.map((item, index) => {
            const percentage = total ? (item.count / total) * 100 : 0
            const circle = (
              <circle
                key={item.label}
                className="admin-donut-segment"
                cx="21"
                cy="21"
                r="15.9155"
                pathLength="100"
                stroke={colors[index % colors.length]}
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset={-offset}
              />
            )
            offset += percentage
            return circle
          })}
        </svg>
        <div className="admin-donut-total"><strong>{total}</strong><span>responses</span></div>
      </div>
      <ul className="admin-chart-legend">
        {items.length ? items.map((item, index) => (
          <li key={item.label}>
            <span className="admin-legend-dot" style={{ backgroundColor: colors[index % colors.length] }} />
            <span>{item.label}</span>
            <strong>{item.count}</strong>
            <small>{total ? Math.round((item.count / total) * 100) : 0}%</small>
          </li>
        )) : <li className="admin-empty-legend">No responses in this period</li>}
      </ul>
    </div>
  )
}

function BarList({ items, total }: { items: { label: string; count: number }[]; total: number }) {
  if (!items.length) return <p className="admin-chart-empty">No responses in this period.</p>
  return (
    <ul className="admin-bars">
      {items.map((item) => (
        <li key={item.label}>
          <div className="admin-bar-heading"><span>{item.label}</span><strong>{item.count}</strong></div>
          <div className="admin-bar-track"><span style={{ width: `${total ? (item.count / total) * 100 : 0}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}

function WeeklyTrend({ responses }: { responses: AdminResponse[] }) {
  const now = new Date()
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - 6 * 7 - ((start.getUTCDay() + 6) % 7))
  const counts = Array.from({ length: 7 }, () => 0)

  for (const response of responses) {
    const date = new Date(response.created_at)
    const week = Math.floor((date.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
    if (week >= 0 && week < counts.length) counts[week] += 1
  }

  const max = Math.max(1, ...counts)
  const points = counts.map((count, index) => `${22 + index * 43},${91 - (count / max) * 68}`).join(' ')
  const weeklyTotal = counts.reduce((sum, count) => sum + count, 0)

  return (
    <div className="admin-trend">
      <div className="admin-trend-summary"><strong>{weeklyTotal}</strong><span>in the last 7 weeks</span></div>
      <svg viewBox="0 0 280 112" role="img" aria-label={`Weekly submissions over the last seven weeks: ${counts.join(', ')}`}>
        <line x1="20" y1="92" x2="263" y2="92" />
        <line x1="20" y1="57" x2="263" y2="57" />
        <line x1="20" y1="22" x2="263" y2="22" />
        <polyline points={points} />
        {counts.map((count, index) => <circle key={index} cx={22 + index * 43} cy={91 - (count / max) * 68} r="3.5"><title>{count} responses</title></circle>)}
      </svg>
      <div className="admin-trend-labels"><span>7 weeks ago</span><span>This week</span></div>
    </div>
  )
}

export default function AdminDashboard({ responses, error, filters }: { responses: AdminResponse[]; error: string; filters: Filters }) {
  const router = useRouter()
  const [logoutError, setLogoutError] = useState('')
  const categorySummary = summarize(responses, 'category')
  const challengeSummary = summarize(responses, 'biggest_challenge')
  const outcomeSummary = summarize(responses, 'desired_outcome')
  const attemptsSummary = summarize(responses, 'previous_attempts')
  const willingnessSummary = summarize(responses, 'willingness')
  const updatesCount = responses.filter((response) => response.email_updates_consent).length
  const positiveWillingnessCount = responses.filter((response) => ['yes', 'maybe'].includes(response.willingness)).length
  const newestDate = responses[0]?.created_at

  async function logout() {
    setLogoutError('')
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' })
      if (!response.ok) throw new Error('We could not sign you out. Please try again.')
      window.location.assign('/admin/login')
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'We could not sign you out. Please try again.')
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="admin-wordmark" href="/admin"><span>20</span> / RESPONSES</a>
        <div className="admin-account"><span><i /> PRIVATE DASHBOARD</span><button type="button" onClick={logout}><LogOut size={15} /> Sign out</button></div>
      </header>
      <div className="admin-content">
        <section className="admin-intro">
          <div>
            <p className="admin-eyebrow">LISTENING FOR WHAT COMES NEXT</p>
            <h1>Patterns worth<br /><em>building around.</em></h1>
            <p className="admin-intro-copy">A closer look at what people are working through, and where a useful product might begin.</p>
          </div>
          <div className="admin-intro-aside"><span>THE CONVERSATION PROJECT</span><strong>20</strong><small>thoughtful conversations<br />can point to better questions.</small></div>
        </section>

        <form className="admin-filters" action="/admin" method="get">
          <div className="admin-filter-title"><span>EXPLORE THE RESPONSES</span><small>{responses.length} matching {responses.length === 1 ? 'response' : 'responses'}</small></div>
          <label>From<input type="date" name="from" defaultValue={filters.from} /></label>
          <label>To<input type="date" name="to" defaultValue={filters.to} /></label>
          <label>Audience
            <span className="admin-select-wrap"><select name="category" defaultValue={filters.category ?? ''}><option value="">All audiences</option>{categoryOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></span>
          </label>
          <button type="submit">Apply filters <ArrowUpRight size={15} /></button>
          {(filters.from || filters.to || filters.category) && <a className="admin-clear-filter" href="/admin">Clear</a>}
        </form>

        {logoutError && <p className="admin-form-error" role="alert">{logoutError}</p>}
        {error ? <section className="admin-error-panel" role="alert"><strong>Dashboard unavailable</strong><p>{error}</p></section> : (
          <>
            <section className="admin-metrics" aria-label="Response summary">
              <article className="admin-metric admin-metric-primary"><span>RESPONSES IN VIEW</span><strong>{responses.length}</strong><small><Users size={14} /> Private submissions</small></article>
              <article className="admin-metric"><span>OPEN TO PAID SUPPORT</span><strong>{responses.length ? `${Math.round((positiveWillingnessCount / responses.length) * 100)}%` : '—'}</strong><small>{positiveWillingnessCount} said yes or maybe</small></article>
              <article className="admin-metric"><span>EMAIL UPDATES</span><strong>{responses.length ? `${Math.round((updatesCount / responses.length) * 100)}%` : '—'}</strong><small>{updatesCount} opted in</small></article>
              <article className="admin-metric"><span>MOST RECENT</span><strong className="admin-metric-date">{newestDate ? formatDate(newestDate, { day: 'numeric', month: 'short' }) : '—'}</strong><small>{newestDate ? formatDate(newestDate, { year: 'numeric' }) : 'No submissions yet'}</small></article>
            </section>

            {responses.length === 0 ? (
              <section className="admin-empty-state"><span><Users size={22} /></span><h2>No responses in this view.</h2><p>Try clearing a filter or check back after someone submits the questionnaire.</p></section>
            ) : (
              <>
                <section className="admin-analysis-grid">
                  <article className="admin-panel admin-audience-panel">
                    <div className="admin-panel-heading"><div><p className="admin-eyebrow">01 / WHO IS HERE</p><h2>Who is reaching out?</h2></div><span className="admin-panel-icon"><Users size={17} /></span></div>
                    <DonutChart items={categorySummary} title="Audience categories" />
                  </article>
                  <article className="admin-panel admin-trend-panel">
                    <div className="admin-panel-heading"><div><p className="admin-eyebrow">02 / MOMENTUM</p><h2>When they arrived</h2></div><span className="admin-trend-mark"><ArrowUpRight size={17} /></span></div>
                    <WeeklyTrend responses={responses} />
                    <p className="admin-panel-note">A rolling view of the last seven weeks, based on every saved response.</p>
                  </article>
                </section>

                <section className="admin-analysis-grid admin-analysis-grid-three">
                  <article className="admin-panel">
                    <div className="admin-panel-heading"><div><p className="admin-eyebrow">03 / THE FRICTION</p><h2>What needs attention?</h2></div><span className="admin-insight-number">{challengeSummary.length.toString().padStart(2, '0')}</span></div>
                    <BarList items={challengeSummary} total={responses.length} />
                  </article>
                  <article className="admin-panel">
                    <div className="admin-panel-heading"><div><p className="admin-eyebrow">04 / THE HOPE</p><h2>What would help?</h2></div><span className="admin-insight-number">{outcomeSummary.length.toString().padStart(2, '0')}</span></div>
                    <BarList items={outcomeSummary} total={responses.length} />
                  </article>
                  <article className="admin-panel">
                    <div className="admin-panel-heading"><div><p className="admin-eyebrow">05 / WHAT THEY TRIED</p><h2>Where they started</h2></div><span className="admin-insight-number">{attemptsSummary.length.toString().padStart(2, '0')}</span></div>
                    <BarList items={attemptsSummary} total={responses.length} />
                  </article>
                </section>

                <section className="admin-panel admin-willingness-panel">
                  <div className="admin-willingness-copy"><p className="admin-eyebrow">06 / ROOM TO GROW</p><h2>How ready are people<br />for more support?</h2><p>This is a signal of openness, not a promise to buy. Pair it with what people say they need.</p></div>
                  <div className="admin-willingness-bars"><BarList items={willingnessSummary} total={responses.length} /></div>
                  <div className="admin-willingness-callout"><span>YES OR MAYBE</span><strong>{responses.length ? `${Math.round((positiveWillingnessCount / responses.length) * 100)}%` : '—'}</strong><small>{positiveWillingnessCount} of {responses.length} responses</small>{positiveWillingnessCount ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}</div>
                </section>

                <section className="admin-responses-section">
                  <div className="admin-responses-heading"><div><p className="admin-eyebrow">THE DETAIL</p><h2>Every response, in context.</h2><p>Use these answers to spot repeated needs and follow up where someone has asked to hear from you.</p></div><span><Check size={14} /> Emails are not sent to analytics</span></div>
                  <div className="admin-table-wrap">
                    <table className="admin-response-table">
                      <thead><tr><th>Date</th><th>Audience</th><th>Challenge</th><th>Useful outcome</th><th>Already tried</th><th>Paid support</th><th>Email</th></tr></thead>
                      <tbody>{responses.map((response) => (
                        <tr key={response.id}>
                          <td>{formatDate(response.created_at)}</td>
                          <td><span className="admin-audience-tag">{categoryLabels[response.category] ?? response.category}</span></td>
                          <td>{label(response.biggest_challenge)}</td>
                          <td>{label(response.desired_outcome)}</td>
                          <td>{label(response.previous_attempts)}</td>
                          <td>{label(response.willingness)}</td>
                          <td>{response.email ? <a href={`mailto:${encodeURIComponent(response.email)}`}>{response.email}</a> : <span className="admin-no-email">Not provided</span>}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </>
        )}
        <footer className="admin-footer"><span>20 CONVERSATIONS / PRIVATE RESPONSE DATA</span><span>{responses.length} {responses.length === 1 ? 'response' : 'responses'} in this view</span></footer>
      </div>
    </main>
  )
}

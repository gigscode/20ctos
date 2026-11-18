'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CircleCheck, LockKeyhole, X } from 'lucide-react'
import CaseStudySection from './case-study-section'

type Category = 'business' | 'idea' | 'career' | 'creator' | 'mentorship' | 'other'
type Choice = { value: string; label: string }
type FormState = {
  email: string
  category: Category | ''
  biggestChallenge: string
  desiredOutcome: string
  previousAttempts: string
  willingness: string
}

const initialState: FormState = { email: '', category: '', biggestChallenge: '', desiredOutcome: '', previousAttempts: '', willingness: '' }
const calendlyUrl = 'https://calendly.com/gigsdev007/30min'

function isValidEmail(email: string) {
  const normalizedEmail = email.trim()
  return normalizedEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
}

const categories: { id: Category; title: string; description: string; number: string }[] = [
  { id: 'business', title: 'I run a business', description: 'I need help with growth, technology, or day-to-day work.', number: '01' },
  { id: 'idea', title: 'I have an idea or skill to build on', description: 'I want to explore a business or product alongside my current work.', number: '02' },
  { id: 'career', title: 'I am growing my skills', description: 'I am thinking about my work or what to learn next.', number: '03' },
  { id: 'creator', title: 'I work for myself', description: 'I want to grow my work, clients, or income.', number: '04' },
  { id: 'mentorship', title: 'I want some direction', description: 'I could use a fresh point of view or a mentor.', number: '05' },
  { id: 'other', title: 'Something else', description: 'My situation is a little different.', number: '06' },
]

const projects = [
  ['Remosus', 'A place to find remote work.'],
  ['eehu!', 'A simpler way to keep up with customer conversations.'],
  ['Ship Fast With AI', 'Practical lessons for making products with AI.'],
  ['ituwaAfrica', 'A place to learn digital skills.'],
  ['Secquiz', 'Cybersecurity learning and practice.'],
]

const challengeOptions: Record<Category, Choice[]> = {
  business: [
    { value: 'steady_enquiries', label: 'Getting steady enquiries' },
    { value: 'converting_customers', label: 'Turning enquiries into customers' },
    { value: 'growing_sales', label: 'Growing sales or revenue' },
    { value: 'day_to_day_work', label: 'Managing day-to-day work' },
    { value: 'using_technology', label: 'Using technology or AI' },
    { value: 'something_else', label: 'Something else' },
  ],
  idea: [
    { value: 'choosing_what_to_build', label: 'Choosing what to build' },
    { value: 'testing_an_idea', label: 'Testing whether people want it' },
    { value: 'shaping_an_offer', label: 'Planning a clear offer' },
    { value: 'building_first_version', label: 'Building the first version' },
    { value: 'finding_first_customers', label: 'Finding first customers' },
    { value: 'something_else', label: 'Something else' },
  ],
  career: [
    { value: 'choosing_direction', label: 'Choosing my next direction' },
    { value: 'learning_a_skill', label: 'Learning a useful skill' },
    { value: 'finding_opportunities', label: 'Finding better opportunities' },
    { value: 'changing_careers', label: 'Changing careers' },
    { value: 'building_confidence', label: 'Building confidence or a portfolio' },
    { value: 'something_else', label: 'Something else' },
  ],
  creator: [
    { value: 'finding_clients', label: 'Finding steady clients' },
    { value: 'pricing_work', label: 'Pricing my work' },
    { value: 'promoting_work', label: 'Promoting my work' },
    { value: 'managing_workload', label: 'Managing my workload' },
    { value: 'growing_income', label: 'Growing my income' },
    { value: 'something_else', label: 'Something else' },
  ],
  mentorship: [
    { value: 'difficult_decision', label: 'Making a difficult decision' },
    { value: 'choosing_next_step', label: 'Choosing a next step' },
    { value: 'building_confidence', label: 'Building confidence' },
    { value: 'staying_accountable', label: 'Staying accountable' },
    { value: 'talking_it_through', label: 'Finding someone to talk it through with' },
    { value: 'something_else', label: 'Something else' },
  ],
  other: [
    { value: 'finding_direction', label: 'Finding a clear direction' },
    { value: 'solving_a_problem', label: 'Solving a practical problem' },
    { value: 'building_a_skill', label: 'Building a skill' },
    { value: 'getting_unstuck', label: 'Getting unstuck' },
    { value: 'something_else', label: 'Something else' },
  ],
}

const triedOptions: Choice[] = [
  { value: 'not_yet', label: 'I have not tried anything yet' },
  { value: 'on_my_own', label: 'I have tried on my own' },
  { value: 'advice_or_information', label: 'I have looked for advice or information' },
  { value: 'course_tool_or_service', label: 'I have tried a course, tool, or service' },
  { value: 'professional_help', label: 'I have paid for professional help' },
]

const outcomeOptions: Choice[] = [
  { value: 'clear_next_step', label: 'A clearer next step' },
  { value: 'practical_plan', label: 'A practical plan' },
  { value: 'feedback_on_idea', label: 'Feedback on an idea' },
  { value: 'tools_or_skills', label: 'A recommendation for tools or skills' },
  { value: 'fresh_perspective', label: 'A fresh point of view' },
]

const willingnessOptions: Choice[] = [
  { value: 'yes', label: 'Yes, if it feels like a good fit' },
  { value: 'maybe', label: 'Maybe, depending on the support' },
  { value: 'not_now', label: 'No, not right now' },
]

function track(event: string, detail?: string) {
  window.dispatchEvent(new CustomEvent('campaign-event', { detail: { event, ...(detail ? { detail } : {}) } }))
}

export default function CampaignPage() {
  const [form, setForm] = useState<FormState>(initialState)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [emailUpdatesConsent, setEmailUpdatesConsent] = useState(false)
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (questionnaireOpen && !dialog.open) dialog.showModal()
    if (!questionnaireOpen && dialog.open) dialog.close()
  }, [questionnaireOpen])

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function next() {
    setError('')
    if (step === 0 && !form.category) return
    setStep((current) => Math.min(current + 1, 2))
  }

  function chooseCategory(category: Category) {
    setForm((current) => ({ ...current, category, biggestChallenge: '' }))
    setError('')
  }

  // Any "book a time" action goes here. If already submitted, go straight to
  // Calendly. Otherwise open the questionnaire so they fill it in first.
  function requestBooking(source: string) {
    track('CTA clicked', source)
    if (submitted) {
      window.open(calendlyUrl, '_blank', 'noreferrer')
    } else {
      openQuestionnaire()
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, emailUpdatesConsent }),
      })

      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null)
        const message = typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string'
          ? result.error
          : 'We could not save your answers. Please try again or book a conversation directly.'
        throw new Error(message)
      }

      setSubmitted(true)
      setQuestionnaireOpen(false)
      window.open(calendlyUrl, '_blank', 'noreferrer')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'We could not save your answers. Please try again or book a conversation directly.')
    } finally {
      setSaving(false)
    }
  }

  function dismissQuestionnaire() {
    setForm(initialState)
    setEmailUpdatesConsent(false)
    setQuestionnaireOpen(false)
    setError('')
  }

  function openQuestionnaire() {
    setStep(0)
    setQuestionnaireOpen(true)
  }

  return (
    <>
      <dialog ref={dialogRef} className="questionnaire-dialog" aria-labelledby="questionnaire-title" onCancel={(event) => { event.preventDefault(); dismissQuestionnaire() }}>
        <div className="questionnaire-header">
          <div className="small-label">20 CONVERSATIONS. ONE PURPOSE: PROGRESS.</div>
          <button className="questionnaire-close" type="button" onClick={dismissQuestionnaire} aria-label="Close and go back to the page"><X size={19} /></button>
        </div>
        <h1 id="questionnaire-title">Book a free call</h1>
        <p className="questionnaire-intro">Two minutes, no typing. Your answers help me prepare and make the most of our time together.</p>
        <form onSubmit={submit}>
          <div className="form-progress"><div><span>QUICK QUESTIONS</span><b>STEP {step + 1} OF 3</b></div><div className="progress-track"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div></div>
          {step === 0 && <div className="form-step"><h2>Which best describes you?</h2><div className="category-options">{categories.map((item) => <button type="button" key={item.id} aria-pressed={form.category === item.id} className={form.category === item.id ? 'category-option is-selected' : 'category-option'} onClick={() => chooseCategory(item.id)}><span className="category-number">{item.number}</span><span className="category-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="radio-dot" /></button>)}</div></div>}
          {step === 1 && form.category && <div className="form-step"><h2>What is the main thing you need help with?</h2><div className="quick-choice-grid">{challengeOptions[form.category].map((option) => <button type="button" key={option.value} aria-pressed={form.biggestChallenge === option.value} className={form.biggestChallenge === option.value ? 'quick-choice is-selected' : 'quick-choice'} onClick={() => update('biggestChallenge', option.value)}>{option.label}</button>)}</div><h2 className="quick-subheading">What have you tried so far?</h2><div className="quick-choice-grid">{triedOptions.map((option) => <button type="button" key={option.value} aria-pressed={form.previousAttempts === option.value} className={form.previousAttempts === option.value ? 'quick-choice is-selected' : 'quick-choice'} onClick={() => update('previousAttempts', option.value)}>{option.label}</button>)}</div></div>}
          {step === 2 && <div className="form-step"><label className="questionnaire-email-field" htmlFor="conversation-email">Your email address <span>I will send the calendar invite here</span><input id="conversation-email" name="email" type="email" autoComplete="email" maxLength={254} required value={form.email} onChange={(event) => update('email', event.target.value)} /></label><h2>What would be most useful to you?</h2><div className="quick-choice-grid">{outcomeOptions.map((option) => <button type="button" key={option.value} aria-pressed={form.desiredOutcome === option.value} className={form.desiredOutcome === option.value ? 'quick-choice is-selected' : 'quick-choice'} onClick={() => update('desiredOutcome', option.value)}>{option.label}</button>)}</div><h2 className="quick-subheading">Would you consider paid support if it felt right?</h2><div className="quick-choice-grid">{willingnessOptions.map((option) => <button type="button" key={option.value} aria-pressed={form.willingness === option.value} className={form.willingness === option.value ? 'quick-choice is-selected' : 'quick-choice'} onClick={() => update('willingness', option.value)}>{option.label}</button>)}</div><label className="consent-field email-updates-consent"><input type="checkbox" checked={emailUpdatesConsent} onChange={(event) => setEmailUpdatesConsent(event.target.checked)} /><span>I agree to receive email updates related to conversations and products.</span></label></div>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="form-actions"><button className="back-button" type="button" onClick={() => step === 0 ? dismissQuestionnaire() : setStep((current) => current - 1)}>{step === 0 ? 'Skip for now' : <><ArrowLeft size={16} /> Back</>}</button>{step < 2 ? <button className="button button-dark" type="button" disabled={(step === 0 && !form.category) || (step === 1 && (!form.biggestChallenge || !form.previousAttempts))} onClick={next}>Continue <ArrowRight size={16} /></button> : <button className="button button-dark" type="submit" disabled={saving || !isValidEmail(form.email) || !form.desiredOutcome || !form.willingness}>{saving ? 'Saving...' : 'Save and choose a time'} <ArrowRight size={16} /></button>}</div>
        </form>
        <p className="questionnaire-footnote"><LockKeyhole size={14} /> Your answers are private and only used to prepare for our call.</p>
      </dialog>

      <main>
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Olajide Igbalaye, home">OI<span>.</span></a>
        <button className={menuOpen ? 'menu-toggle is-open' : 'menu-toggle'} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
          <span className="menu-toggle-label">{menuOpen ? 'CLOSE' : 'MENU'}</span>
        </button>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>My story</a>
          <a href="#work" onClick={() => setMenuOpen(false)}>Things I have made</a>
          <a href="#case-study" onClick={() => setMenuOpen(false)}>Case study</a>
          <button className="nav-cta" type="button" onClick={() => { setMenuOpen(false); requestBooking('navigation') }}>
            Let&apos;s talk <ArrowUpRight size={15} />
          </button>
        </nav>
      </header>

      <section className="hero page-pad" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> OLAJIDE IGBALAYE <span className="eyebrow-divider">/</span> AN OPEN INVITATION</div>
          <h1>You have an idea, a skill, or a challenge. <span>Let&apos;s find the next step.</span></h1>
          <p className="hero-intro">I help people turn experience and ideas into practical next steps through business thinking, digital products, AI, teaching, and mentorship. I&apos;m making room for 20 free, 30-minute conversations.</p>
          <div className="hero-actions">
            <button className="button button-dark" type="button" onClick={() => requestBooking('hero booking')}>
              Choose a time <ArrowUpRight size={17} />
            </button>
            <button className="text-link" type="button" onClick={openQuestionnaire}>
              Book a free call <ArrowDown size={15} />
            </button>
          </div>
          {submitted && <p className="saved-notice" role="status">Your answers were saved. You can explore the page or choose a time to talk.</p>}
          <div className="availability"><span className="availability-mark"><CircleCheck size={16} /></span><span><strong>20 free conversations</strong><small>30 minutes, one useful next step</small></span></div>
        </div>
        <figure className="hero-portrait">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cinematic%20Creator%20Portrait%20with%20Warm%20Rim%20Light-YD6jISnSpNz4i4WuHmEQ7h5hmChwLd.png" alt="Olajide Igbalaye smiling in a black shirt" />
          <figcaption>OLAJIDE IGBALAYE <span>·</span> BUILDER, TEACHER, MENTOR</figcaption>
        </figure>
        <div className="hero-footnote">A LITTLE TIME. A REAL CONVERSATION. ROOM TO MAKE PROGRESS.</div>
      </section>

      <section className="about section-pad" id="about">
        <div className="section-kicker">A LITTLE ABOUT ME <span>01 / 05</span></div>
        <div className="about-grid">
          <h2>I like helping people move from <em>&quot;what if&quot;</em> to &quot;what next.&quot;</h2>
          <div className="about-copy"><p>I&apos;m Olajide. I build with technology, teach what I learn, and work with people to make hard things feel more possible.</p><p>Over the years, my work has taken me through software, AI, business, creative work, teaching, and mentoring. The common thread is simple: listen well, understand the real problem, then find a useful next step.</p><a href="https://www.linkedin.com/in/olajide-igbalaye/" target="_blank" rel="noreferrer" className="under-link">A little more about me <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="experience-grid">
          {[
            ['01', 'Starting a business', 'Shape your experience or idea into a practical offer.'],
            ['02', 'Building digital products', 'Turn a useful idea into a website, app, or platform.'],
            ['03', 'AI & automation', 'Find practical ways to make everyday work easier.'],
            ['04', 'Positioning & marketing', 'Clarify your offer and find better ways to reach people.'],
            ['05', 'Mentorship & direction', 'Think through decisions and choose a useful next step.']
          ].map(([number, title, description]) => <article className="experience-card" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="work section-pad" id="work">
        <div className="section-kicker">A FEW THINGS I HAVE WORKED ON <span>02 / 05</span></div>
        <div className="work-heading"><h2>Made to help with<br /><em>real things.</em></h2><p>These projects reflect a few of the problems I&apos;ve enjoyed working on. There&apos;s more where these came from.</p></div>
        <div className="project-grid">{projects.map(([name, description], index) => <article className="project-card" key={name}><div className="project-top"><span className={`project-number shade-${index % 4}`}>{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={16} aria-hidden="true" /></div><h3>{name}</h3><p>{description}</p></article>)}</div>
        <a className="under-link work-link" href="https://jdev-live.vercel.app/" target="_blank" rel="noreferrer">Explore my work <ArrowUpRight size={15} /></a>
      </section>

      <CaseStudySection />

      <section className="who section-pad">
        <div className="section-kicker">WHO THIS IS FOR <span>04 / 05</span></div>
        <div className="who-grid"><h2>This might be useful if...</h2><div className="who-list">{[
          ['You run a business', 'You want help with growth, technology, AI, or the work that keeps piling up.'],
          ['You have an idea or skill', 'You want to turn it into something real, even alongside your current work.'],
          ['You are finding your path', 'You are thinking about your next role, skill, or opportunity.'],
          ['You work for yourself', 'You want better tools, more steady work, or room to grow.'],
          ['You could use a sounding board', 'You want a little clarity, perspective, or someone in your corner.'],
        ].map(([title, description], index) => <div className="who-row" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={16} /></div>)}</div></div>
      </section>

      <section className="conversation section-pad" id="conversation">
        <div className="section-kicker">YOUR TURN <span>05 / 05</span></div>
        <div className="conversation-grid">
          <div className="conversation-intro">
            <h2>Tell me a little about <em>you.</em></h2>
            <p>Bring whatever is on your mind. We will spend 30 minutes finding a useful next step together.</p>
            <div className="privacy-note"><LockKeyhole size={17} /><span>Your answers are private. Email updates only if you opt in.</span></div>
            <button className="under-link questionnaire-reopen" type="button" onClick={openQuestionnaire}>Book a free call <ArrowDown size={15} /></button>
          </div>
          <div className="conversation-note">
            <span className="small-label">FREE · 30 MINUTES · ONE USEFUL NEXT STEP</span>
            <p>You do not need to have everything figured out. Bring what is on your mind, and we will look for a useful next step together.</p>
            <button className="button button-dark" type="button" onClick={() => requestBooking('conversation section')}>
              Book a free call <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="closing page-pad">
        <div className="closing-mark">ONE HONEST CONVERSATION <span>→</span></div>
        <h2>One honest conversation can make the next step <em>feel clearer.</em></h2>
        <p>If there is something you are building, facing, or figuring out, I would love to hear about it.</p>
        <button className="button button-light" type="button" onClick={() => requestBooking('final')}>
          Book a free call <ArrowRight size={16} />
        </button>
      </section>

      <footer className="footer">
        <a className="wordmark" href="#home">OI<span>.</span></a>
        <div className="footer-name"><strong>Olajide Igbalaye</strong><span>Personal brand and professional portfolio</span></div>
        <div className="footer-links">
          <a href="https://www.linkedin.com/in/olajide-igbalaye/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} /></a>
          <a href="https://jdev-live.vercel.app/" target="_blank" rel="noreferrer">My work <ArrowUpRight size={13} /></a>
        </div>
        <span className="copyright">© {new Date().getFullYear()} OLAJIDE IGBALAYE</span>
      </footer>
      </main>
    </>
  )
}

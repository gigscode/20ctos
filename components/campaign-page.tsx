'use client'

import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleCheck, LockKeyhole } from 'lucide-react'

type Category = 'business' | 'idea' | 'career' | 'creator' | 'mentorship' | 'other'
type Answer = 'Yes' | 'No'
type FormState = {
  fullName: string
  email: string
  whatsapp: string
  linkedin: string
  website: string
  category: Category | ''
  branch: Record<string, string>
  biggestChallenge: string
  desiredOutcome: string
  previousAttempts: string
  willingness: string
  consent: boolean
  honeypot: string
}

const initialState: FormState = { fullName: '', email: '', whatsapp: '', linkedin: '', website: '', category: '', branch: {}, biggestChallenge: '', desiredOutcome: '', previousAttempts: '', willingness: '', consent: false, honeypot: '' }

const categories: { id: Category; title: string; description: string; number: string }[] = [
  { id: 'business', title: 'I run a business', description: 'I need help with growth, technology, or day-to-day work.', number: '01' },
  { id: 'idea', title: 'I have an idea', description: 'I want to turn an idea into something real.', number: '02' },
  { id: 'career', title: 'I am growing my skills', description: 'I am thinking about my work or what to learn next.', number: '03' },
  { id: 'creator', title: 'I work for myself', description: 'I want to grow my work, clients, or income.', number: '04' },
  { id: 'mentorship', title: 'I want some direction', description: 'I could use a fresh point of view or a mentor.', number: '05' },
  { id: 'other', title: 'Something else', description: 'My situation is a little different.', number: '06' },
]

const prompts: Record<Category, { questions: string[]; open: string }> = {
  business: { questions: ['Are you running a business right now?', 'Do you get enquiries that do not turn into customers?', 'Do you use AI or automation in your business?', 'Would you pay for a solution to an important business problem?'], open: 'What is the biggest challenge your business is facing?' },
  idea: { questions: ['Do you have a business or product idea?', 'Have you tried to build or launch it?', 'Do you have the technical skills you need?', 'Would expert help be useful to you?'], open: 'What are you hoping to build?' },
  career: { questions: ['Are you happy with your work direction right now?', 'Are you learning a skill to open new doors?', 'Have you thought about freelance or remote work?', 'Would a mentor or practical training help?'], open: 'What feels hardest about your career or skills right now?' },
  creator: { questions: ['Do you earn money from your creative or digital skills?', 'Do you get clients or work on a steady basis?', 'Do you use AI in your work?', 'Would you invest in tools or training to improve your results?'], open: 'What is getting in the way of the work you want?' },
  mentorship: { questions: ['Are you facing an important personal or work decision?', 'Would another point of view help you choose your next step?', 'Are you taking steps to work through this?', 'Would a mentor or someone to check in with help?'], open: 'What would you like to feel clearer about?' },
  other: { questions: [], open: 'Tell me what is going on and what kind of help you are looking for.' },
}

const projects = [
  ['Remosus', 'A place to find remote work.'],
  ['eehu!', 'A simpler way to keep up with customer conversations.'],
  ['Ship Fast With AI', 'Practical lessons for making products with AI.'],
  ['ituwaAfrica', 'A place to learn digital skills.'],
  ['Secquiz', 'Cybersecurity learning and practice.'],
]

const answerGroups = [
  ['business', 'Running a business'], ['idea', 'Building an idea'], ['career', 'Growing my career'],
  ['creator', 'Creative or freelance work'], ['mentorship', 'Personal direction'], ['other', 'Something else'],
] as const

function track(event: string, detail?: string) {
  window.dispatchEvent(new CustomEvent('campaign-event', { detail: { event, ...(detail ? { detail } : {}) } }))
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '', required = false }: { label: string; name: string; value: string; onChange: (name: string, value: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return <label className="field"><span>{label}{required && <b aria-hidden="true"> *</b>}</span><input name={name} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} required={required} autoComplete={name === 'fullName' ? 'name' : name === 'email' ? 'email' : 'on'} /></label>
}

export default function CampaignPage() {
  const [form, setForm] = useState<FormState>(initialState)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function updateBranch(question: string, answer: string) {
    setForm((current) => ({ ...current, branch: { ...current.branch, [question]: answer } }))
  }

  function next() {
    setError('')
    if (step === 0 && (!form.fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))) {
      setError('Please add your name and a valid email so I know how to reach you.')
      return
    }
    if (step === 1 && !form.category) {
      setError('Please choose the option that feels closest to your situation.')
      return
    }
    if (step === 3 && (!form.biggestChallenge.trim() || !form.desiredOutcome.trim())) {
      setError('Please answer the first two questions. You can leave the last one blank.')
      return
    }
    setStep((current) => Math.min(current + 1, 4))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!form.willingness || !form.consent) {
      setError('Please choose an option and agree to the privacy note before sending.')
      return
    }
    setSending(true)
    try {
      const response = await fetch('/api/campaign-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Your answers could not be sent just yet. Please try again later.')
      track('form submitted')
      setDone(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Your answers could not be sent just yet. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  const categoryLabel = answerGroups.find(([id]) => id === form.category)?.[1]

  return (
    <main>
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="Olajide Igbalaye, home">OI<span>.</span></a>
        <button className={menuOpen ? 'menu-toggle is-open' : 'menu-toggle'} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span className="menu-icon" aria-hidden="true"><span /><span /><span /></span>
          <span className="menu-toggle-label">{menuOpen ? 'CLOSE' : 'MENU'}</span>
        </button>
        <nav className={menuOpen ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation">
          <a href="#about" onClick={() => setMenuOpen(false)}>My story</a><a href="#work" onClick={() => setMenuOpen(false)}>Things I have made</a><a className="nav-cta" href="#conversation" onClick={() => { setMenuOpen(false); track('CTA clicked', 'navigation') }}>Let&apos;s talk <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <section className="hero page-pad" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> OL AJIDE IGBALAYE <span className="eyebrow-divider">/</span> AN OPEN INVITATION</div>
          <h1>Let&apos;s talk about what you&apos;re <span>building, facing, or figuring out.</span></h1>
          <p className="hero-intro">I&apos;ve spent years making digital products, helping people solve problems, and finding better ways to do things. Now I&apos;m making room for 20 thoughtful conversations.</p>
          <div className="hero-actions"><a className="button button-dark" href="#conversation" onClick={() => track('CTA clicked', 'hero')}>Book a conversation <ArrowRight size={17} /></a><a className="text-link" href="#about">Get to know me <ArrowDown size={15} /></a></div>
          <div className="availability"><span className="availability-mark"><CircleCheck size={16} /></span><span><strong>20 conversations</strong><small>An open invitation to start with a chat</small></span></div>
        </div>
        <figure className="hero-portrait">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cinematic%20Creator%20Portrait%20with%20Warm%20Rim%20Light-YD6jISnSpNz4i4WuHmEQ7h5hmChwLd.png" alt="Olajide Igbalaye smiling in a black shirt" />
          <figcaption>OLAJIDE IGBALAYE <span>·</span> BUILDER, TEACHER, MENTOR</figcaption>
        </figure>
        <div className="hero-footnote">A LITTLE TIME. A REAL CONVERSATION. ROOM TO MAKE PROGRESS.</div>
      </section>

      <section className="about section-pad" id="about">
        <div className="section-kicker">A LITTLE ABOUT ME <span>01 / 04</span></div>
        <div className="about-grid">
          <h2>I like helping people move from <em>“what if”</em> to “what next.”</h2>
          <div className="about-copy"><p>I&apos;m Olajide. I build with technology, teach what I learn, and work with people to make hard things feel more possible.</p><p>Over the years, my work has taken me through software, AI, business, creative work, teaching, and mentoring. The common thread is simple: listen well, understand the real problem, then find a useful next step.</p><a href="https://www.linkedin.com/in/olajide-igbalaye/" target="_blank" rel="noreferrer" className="under-link">A little more about me <ArrowUpRight size={15} /></a></div>
        </div>
        <div className="experience-grid">
          {[
            ['01', 'Technology', 'Websites, apps, and digital products that make work easier.'],
            ['02', 'AI & helpful tools', 'Practical ways to use AI and automation in everyday work.'],
            ['03', 'Business & creative work', 'Clearer brands, better content, and ways to reach customers.'],
            ['04', 'Teaching & mentoring', 'Patient help with technology, cybersecurity, and career skills.'],
            ['05', 'Personal growth', 'Space to think clearly, make choices, and take the next step.'],
          ].map(([number, title, description]) => <article className="experience-card" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="work section-pad" id="work">
        <div className="section-kicker">A FEW THINGS I HAVE WORKED ON <span>02 / 04</span></div>
        <div className="work-heading"><h2>Made to help with<br /><em>real things.</em></h2><p>These projects reflect a few of the problems I&apos;ve enjoyed working on. There&apos;s more where these came from.</p></div>
        <div className="project-grid">{projects.map(([name, description], index) => <article className="project-card" key={name}><div className="project-top"><span className={`project-number shade-${index % 4}`}>{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={16} aria-hidden="true" /></div><h3>{name}</h3><p>{description}</p></article>)}</div>
        <a className="under-link work-link" href="https://jdev-live.vercel.app/" target="_blank" rel="noreferrer">Explore my work <ArrowUpRight size={15} /></a>
      </section>

      <section className="who section-pad">
        <div className="section-kicker">WHO THIS IS FOR <span>03 / 04</span></div>
        <div className="who-grid"><h2>This might be useful if...</h2><div className="who-list">{[
          ['You run a business', 'You want help with growth, technology, AI, or the work that keeps piling up.'],
          ['You have an idea', 'You need a way to plan it, build it, or take that first step.'],
          ['You are finding your path', 'You are thinking about your next role, skill, or opportunity.'],
          ['You work for yourself', 'You want better tools, more steady work, or room to grow.'],
          ['You could use a sounding board', 'You want a little clarity, perspective, or someone in your corner.'],
        ].map(([title, description], index) => <div className="who-row" key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={16} /></div>)}</div></div>
      </section>

      <section className="conversation section-pad" id="conversation">
        <div className="section-kicker">YOUR TURN <span>04 / 04</span></div>
        <div className="conversation-grid">
          <div className="conversation-intro"><div className="small-label">20 CONVERSATIONS. ONE PURPOSE: PROGRESS.</div><h2>Tell me a little about <em>you.</em></h2><p>A few simple questions will help me understand what matters to you before we talk.</p><div className="privacy-note"><LockKeyhole size={17} /><span>Your answers are for arranging this conversation and following up about what you share. They are not used for marketing.</span></div></div>
          <div className="form-panel">
            {done ? <div className="success-state"><div className="success-icon"><Check size={22} /></div><div className="small-label">THANK YOU</div><h3>Let&apos;s make this conversation count.</h3><p>Your answers are in. We can now find a time to talk.</p>{process.env.NEXT_PUBLIC_BOOKING_URL ? <a className="button button-dark" href={process.env.NEXT_PUBLIC_BOOKING_URL} target="_blank" rel="noreferrer" onClick={() => track('booking link clicked')}>Choose a time <ArrowUpRight size={16} /></a> : <p className="booking-note">Thanks for reaching out. Olajide will be in touch to arrange a time.</p>}</div> : <form onSubmit={submit}>
              <div className="form-progress"><div><span>YOUR DETAILS</span><b>STEP {step + 1} OF 5</b></div><div className="progress-track"><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div></div>
              {step === 0 && <div className="form-step"><h3>First, how can I reach you?</h3><p>Just the basics to get us started.</p><Field label="Your name" name="fullName" value={form.fullName} onChange={update} placeholder="The name you go by" required /><Field label="Email address" name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required /><div className="optional-fields"><Field label="WhatsApp number" name="whatsapp" value={form.whatsapp} onChange={update} placeholder="Optional" /><Field label="LinkedIn or website" name="linkedin" value={form.linkedin} onChange={update} placeholder="Optional" /></div><label className="honeypot" aria-hidden="true">Leave this empty<input tabIndex={-1} autoComplete="off" value={form.honeypot} onChange={(event) => update('honeypot', event.target.value)} /></label></div>}
              {step === 1 && <div className="form-step"><h3>What brings you here?</h3><p>Choose the one that feels closest. There is no wrong answer.</p><div className="category-options">{categories.map((item) => <button type="button" key={item.id} className={form.category === item.id ? 'category-option is-selected' : 'category-option'} onClick={() => { update('category', item.id); track('audience category selected', item.id) }}><span className="category-number">{item.number}</span><span className="category-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="radio-dot" /></button>)}</div></div>}
              {step === 2 && form.category && <div className="form-step"><h3>{form.category === 'other' ? 'Help me understand your situation.' : 'A little more about your situation.'}</h3><p>Answer what you can. It is okay if you are still figuring things out.</p>{prompts[form.category].questions.map((question) => <fieldset className="answer-field" key={question}><legend>{question}</legend><div className="answer-options">{(['Yes', 'No'] as Answer[]).map((answer) => <button key={answer} type="button" className={form.branch[question] === answer ? 'answer-choice answer-active' : 'answer-choice'} onClick={() => updateBranch(question, answer)}>{answer}</button>)}</div></fieldset>)}<label className="field"><span>{prompts[form.category].open}</span><textarea value={form.branch.open || ''} onChange={(event) => updateBranch('open', event.target.value)} rows={3} placeholder="Take your time..." /></label></div>}
              {step === 3 && <div className="form-step"><h3>What would make this time useful?</h3><p>There is no need to have it all worked out before you answer.</p><label className="field"><span>What is the biggest challenge you are trying to get past? *</span><textarea value={form.biggestChallenge} onChange={(event) => update('biggestChallenge', event.target.value)} rows={3} placeholder="Share what feels important" required /></label><label className="field"><span>If we talk, what is one useful thing you would like to leave with? *</span><textarea value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} rows={3} placeholder="A clearer next step? A new idea?" required /></label><label className="field"><span>Have you tried anything so far? What happened?</span><textarea value={form.previousAttempts} onChange={(event) => update('previousAttempts', event.target.value)} rows={2} placeholder="Optional" /></label></div>}
              {step === 4 && <div className="form-step"><h3>One last thing.</h3><p>This helps me understand what kind of support may be useful. No pressure.</p><fieldset className="answer-field"><legend>Would you be open to a paid solution if we find one that truly helps?</legend><div className="willing-options">{['Yes', 'Maybe, depending on the solution', 'Not at the moment'].map((choice) => <button type="button" key={choice} className={form.willingness === choice ? 'answer-choice answer-active' : 'answer-choice'} onClick={() => update('willingness', choice)}>{choice}</button>)}</div></fieldset><label className="consent-check"><input type="checkbox" checked={form.consent} onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))} /><span>I agree that my details can be stored to arrange this conversation and follow up about what I shared.</span></label><p className="no-marketing">This does not sign you up for marketing messages.</p></div>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions">{step > 0 ? <button className="back-button" type="button" onClick={() => { setStep((current) => current - 1); setError('') }}><ArrowLeft size={16} /> Back</button> : <span />}{step < 4 ? <button className="button button-dark" type="button" onClick={() => { if (step === 0) track('form started'); next() }}>Continue <ArrowRight size={16} /></button> : <button className="button button-dark" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send my answers'} {!sending && <ArrowRight size={16} />}</button>}</div>
              <p className="form-footnote">{categoryLabel ? `Here for: ${categoryLabel}` : 'A few minutes, and you are done.'}</p>
            </form>}
          </div>
        </div>
      </section>

      <section className="closing page-pad"><div className="closing-mark">A GOOD PLACE TO START <span>→</span></div><h2>One honest conversation can make the next step <em>feel clearer.</em></h2><p>If there is something you are building, facing, or figuring out, I would love to hear about it.</p><a className="button button-light" href="#conversation" onClick={() => track('CTA clicked', 'final')}>Start the conversation <ArrowRight size={16} /></a></section>

      <footer className="footer"><a className="wordmark" href="#home">OI<span>.</span></a><div className="footer-name"><strong>Olajide Igbalaye</strong><span>Personal brand and professional portfolio</span></div><div className="footer-links"><a href="https://www.linkedin.com/in/olajide-igbalaye/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} /></a><a href="https://jdev-live.vercel.app/" target="_blank" rel="noreferrer">My work <ArrowUpRight size={13} /></a></div><span className="copyright">© {new Date().getFullYear()} OLAJIDE IGBALAYE</span></footer>
    </main>
  )
}

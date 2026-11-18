'use client'

import { useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, CircleCheck, LockKeyhole } from 'lucide-react'
import CaseStudySection from './case-study-section'

type Category = 'business' | 'idea' | 'career' | 'creator' | 'mentorship' | 'other'
type Answer = 'Yes' | 'No'
type FormState = {
  category: Category | ''
  branch: Record<string, string>
  biggestChallenge: string
  desiredOutcome: string
  previousAttempts: string
  willingness: string
}

const initialState: FormState = { category: '', branch: {}, biggestChallenge: '', desiredOutcome: '', previousAttempts: '', willingness: '' }

const categories: { id: Category; title: string; description: string; number: string }[] = [
  { id: 'business', title: 'I run a business', description: 'I need help with growth, technology, or day-to-day work.', number: '01' },
  { id: 'idea', title: 'I have an idea or skill to build on', description: 'I want to explore a business or product alongside my current work.', number: '02' },
  { id: 'career', title: 'I am growing my skills', description: 'I am thinking about my work or what to learn next.', number: '03' },
  { id: 'creator', title: 'I work for myself', description: 'I want to grow my work, clients, or income.', number: '04' },
  { id: 'mentorship', title: 'I want some direction', description: 'I could use a fresh point of view or a mentor.', number: '05' },
  { id: 'other', title: 'Something else', description: 'My situation is a little different.', number: '06' },
]

const prompts: Record<Category, { questions: string[]; open: string }> = {
  business: { questions: ['Are you running a business right now?', 'Do you get enquiries that do not turn into customers?', 'Do you use AI or automation in your business?', 'Would you pay for a solution to an important business problem?'], open: 'What is the biggest challenge your business is facing?' },
  idea: { questions: ['Do you have an idea or experience you want to build on?', 'Have you tried to build or launch something around it?', 'Do you have the skills or support you need to take the next step?', 'Would expert help be useful to you?'], open: 'What knowledge, experience, or idea would you like to build on?' },
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

function buildConversationSummary(form: FormState, categoryLabel?: string) {
  const answers = Object.entries(form.branch)
    .filter(([question, answer]) => question !== 'open' && answer)
    .map(([question, answer]) => `${question} ${answer.toLowerCase()}`)

  return [
    categoryLabel ? `Where I am now: ${categoryLabel}` : '',
    ...answers,
    form.branch.open ? `A little more about my situation: ${form.branch.open}` : '',
    form.biggestChallenge ? `My biggest challenge: ${form.biggestChallenge}` : '',
    form.desiredOutcome ? `A useful outcome for me: ${form.desiredOutcome}` : '',
    form.previousAttempts ? `What I have tried: ${form.previousAttempts}` : '',
    form.willingness ? `Open to paid support: ${form.willingness}` : '',
  ].filter(Boolean).join('\n\n')
}

export default function CampaignPage() {
  const [form, setForm] = useState<FormState>(initialState)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function updateBranch(question: string, answer: string) {
    setForm((current) => ({ ...current, branch: { ...current.branch, [question]: answer } }))
  }

  function next() {
    setError('')
    if (step === 0 && !form.category) {
      setError('Please choose the option that feels closest to your situation.')
      return
    }
    if (step === 2 && (!form.biggestChallenge.trim() || !form.desiredOutcome.trim())) {
      setError('Please answer the first two questions. You can leave the last one blank.')
      return
    }
    setStep((current) => Math.min(current + 1, 3))
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!form.willingness) {
      setError('Please choose the option that feels right for you.')
      return
    }
    track('conversation summary prepared')
    setDone(true)
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(buildConversationSummary(form, categoryLabel))
      setCopyStatus('Copied. Paste it into your LinkedIn message.')
    } catch {
      setCopyStatus('Select the summary above and copy it manually.')
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
          <a href="#about" onClick={() => setMenuOpen(false)}>My story</a><a href="#work" onClick={() => setMenuOpen(false)}>Things I have made</a><a href="#case-study" onClick={() => setMenuOpen(false)}>Case study</a><a className="nav-cta" href="#conversation" onClick={() => { setMenuOpen(false); track('CTA clicked', 'navigation') }}>Let&apos;s talk <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <section className="hero page-pad" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> OL AJIDE IGBALAYE <span className="eyebrow-divider">/</span> AN OPEN INVITATION</div>
          <h1>You have an idea, a skill, or a challenge. <span>Let&apos;s find the next step.</span></h1>
          <p className="hero-intro">I help people turn experience and ideas into practical next steps through business thinking, digital products, AI, teaching, and mentorship. I&apos;m making room for 20 free initial conversations.</p>
          <div className="hero-actions"><a className="button button-dark" href="#conversation" onClick={() => track('CTA clicked', 'hero')}>Start the conversation <ArrowRight size={17} /></a><a className="text-link" href="#about">Get to know me <ArrowDown size={15} /></a></div>
          <div className="availability"><span className="availability-mark"><CircleCheck size={16} /></span><span><strong>20 free conversations</strong><small>No pitch, just a useful first step</small></span></div>
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
          <h2>I like helping people move from <em>“what if”</em> to “what next.”</h2>
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
          <div className="conversation-intro"><div className="small-label">20 CONVERSATIONS. ONE PURPOSE: PROGRESS.</div><h2>Tell me a little about <em>you.</em></h2><p>A few simple questions can help you clarify what matters before we talk.</p><div className="privacy-note"><LockKeyhole size={17} /><span>This worksheet stays in your browser. Nothing is sent or stored. Share only what you are comfortable copying into a message.</span></div></div>
          <div className="form-panel">
            {done ? <div className="success-state"><div className="success-icon"><Check size={22} /></div><div className="small-label">YOUR NOTE IS READY</div><h3>Start with a clearer message.</h3><p>Your answers have not been sent or saved. Copy this note and paste it into a LinkedIn message when you are ready.</p><label className="summary-label" htmlFor="conversation-summary">MESSAGE DRAFT</label><textarea className="summary-output" id="conversation-summary" value={buildConversationSummary(form, categoryLabel)} readOnly rows={9} /><p className="copy-status" role="status" aria-live="polite">{copyStatus}</p><div className="summary-actions"><button className="button button-dark" type="button" onClick={() => void copySummary()}>Copy my summary</button><a className="button button-light" href="https://www.linkedin.com/in/olajide-igbalaye/" target="_blank" rel="noreferrer" onClick={() => track('LinkedIn handoff clicked')}>Open LinkedIn <ArrowUpRight size={16} /></a></div></div> : <form onSubmit={submit}>
              <div className="form-progress"><div><span>CONVERSATION NOTES</span><b>STEP {step + 1} OF 4</b></div><div className="progress-track"><span style={{ width: `${((step + 1) / 4) * 100}%` }} /></div></div>
              {step === 0 && <div className="form-step"><h3>Where are you right now?</h3><p>Choose the one that feels closest. There is no wrong answer.</p><div className="category-options">{categories.map((item) => <button type="button" key={item.id} aria-pressed={form.category === item.id} className={form.category === item.id ? 'category-option is-selected' : 'category-option'} onClick={() => { update('category', item.id); track('audience category selected', item.id) }}><span className="category-number">{item.number}</span><span className="category-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="radio-dot" /></button>)}</div></div>}
              {step === 1 && form.category && <div className="form-step"><h3>{form.category === 'other' ? 'Help me understand your situation.' : 'A little more about your situation.'}</h3><p>Answer what you can. It is okay if you are still figuring things out.</p>{prompts[form.category].questions.map((question) => <fieldset className="answer-field" key={question}><legend>{question}</legend><div className="answer-options">{(['Yes', 'No'] as Answer[]).map((answer) => <button key={answer} type="button" aria-pressed={form.branch[question] === answer} className={form.branch[question] === answer ? 'answer-choice answer-active' : 'answer-choice'} onClick={() => updateBranch(question, answer)}>{answer}</button>)}</div></fieldset>)}<label className="field"><span>{prompts[form.category].open}</span><textarea value={form.branch.open || ''} onChange={(event) => updateBranch('open', event.target.value)} rows={3} placeholder="Take your time..." /></label></div>}
              {step === 2 && <div className="form-step"><h3>What would make this time useful?</h3><p>There is no need to have it all worked out before you answer.</p><label className="field"><span>What is the biggest challenge you are trying to get past? *</span><textarea value={form.biggestChallenge} onChange={(event) => update('biggestChallenge', event.target.value)} rows={3} placeholder="Share what feels important" required /></label><label className="field"><span>If we talk, what is one useful thing you would like to leave with? *</span><textarea value={form.desiredOutcome} onChange={(event) => update('desiredOutcome', event.target.value)} rows={3} placeholder="A clearer next step? A new idea?" required /></label><label className="field"><span>Have you tried anything so far? What happened?</span><textarea value={form.previousAttempts} onChange={(event) => update('previousAttempts', event.target.value)} rows={2} placeholder="Optional" /></label></div>}
              {step === 3 && <div className="form-step"><h3>One last thing.</h3><p>This helps frame what kind of support might be useful. No pressure.</p><fieldset className="answer-field"><legend>Would you be open to a paid solution if we find one that truly helps?</legend><div className="willing-options">{['Yes', 'Maybe, depending on the solution', 'Not at the moment'].map((choice) => <button type="button" key={choice} aria-pressed={form.willingness === choice} className={form.willingness === choice ? 'answer-choice answer-active' : 'answer-choice'} onClick={() => update('willingness', choice)}>{choice}</button>)}</div></fieldset></div>}
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="form-actions">{step > 0 ? <button className="back-button" type="button" onClick={() => { setStep((current) => current - 1); setError('') }}><ArrowLeft size={16} /> Back</button> : <span />}{step < 3 ? <button className="button button-dark" type="button" onClick={() => { if (step === 0) track('form started'); next() }}>Continue <ArrowRight size={16} /></button> : <button className="button button-dark" type="submit">Prepare my message <ArrowRight size={16} /></button>}</div>
              <p className="form-footnote">{categoryLabel ? `Here for: ${categoryLabel}` : 'Nothing is sent from this worksheet.'}</p>
            </form>}
          </div>
        </div>
      </section>

      <section className="closing page-pad"><div className="closing-mark">A GOOD PLACE TO START <span>→</span></div><h2>One honest conversation can make the next step <em>feel clearer.</em></h2><p>If there is something you are building, facing, or figuring out, I would love to hear about it.</p><a className="button button-light" href="#conversation" onClick={() => track('CTA clicked', 'final')}>Start the conversation <ArrowRight size={16} /></a></section>

      <footer className="footer"><a className="wordmark" href="#home">OI<span>.</span></a><div className="footer-name"><strong>Olajide Igbalaye</strong><span>Personal brand and professional portfolio</span></div><div className="footer-links"><a href="https://www.linkedin.com/in/olajide-igbalaye/" target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight size={13} /></a><a href="https://jdev-live.vercel.app/" target="_blank" rel="noreferrer">My work <ArrowUpRight size={13} /></a></div><span className="copyright">© {new Date().getFullYear()} OLAJIDE IGBALAYE</span></footer>
    </main>
  )
}

import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Find the opportunity',
    description: 'Explore how professional accounting experience could become a training business alongside existing employment.',
  },
  {
    number: '02',
    title: 'Shape the offer',
    description: 'Organize beginner, intermediate, and advanced learning into clear training packages and pricing.',
  },
  {
    number: '03',
    title: 'Prepare to launch',
    description: 'Build a dedicated website with training choices, enquiry and booking paths, plus an initial marketing plan.',
  },
]

export default function CaseStudySection() {
  return (
    <section className="case-study section-pad" id="case-study" aria-labelledby="case-study-title">
      <div className="section-kicker">A REAL CLIENT ENGAGEMENT <span>03 / 05</span></div>
      <div className="case-study-intro">
        <div>
          <p className="case-study-label">ANONYMIZED CLIENT STORY</p>
          <h2 id="case-study-title">From accounting experience to a training offer.</h2>
        </div>
        <p className="case-study-summary">An accounting professional wanted to explore a business of her own without immediately leaving her job. The work focused on turning her expertise into a clear offer and a practical foundation for taking it to market.</p>
      </div>
      <div className="case-study-steps">
        {steps.map((step) => (
          <article className="case-study-step" key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>
      <div className="case-study-footer">
        <p>Business direction, offer packaging, pricing, website development, and initial marketing planning.</p>
        <a href="#conversation">Explore your next step <ArrowRight size={15} aria-hidden="true" /></a>
      </div>
    </section>
  )
}

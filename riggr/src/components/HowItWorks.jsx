function HowItWorks({ t }) {
  return (
    <section className="section section-muted" id="slik-fungerer-det">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">{t.howItWorks.eyebrow}</p>
          <h2>{t.howItWorks.title}</h2>
        </div>
        <div className="steps-grid">
          {t.howItWorks.steps.map((step, index) => (
            <article className="step-card" key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

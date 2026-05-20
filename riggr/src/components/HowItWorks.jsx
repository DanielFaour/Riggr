const steps = [
  {
    title: 'Velg utstyr',
    text: 'Finn høyttaleren eller utstyret du trenger.',
  },
  {
    title: 'Send forespørsel',
    text: 'Velg datoer og send inn kontaktinformasjon.',
  },
  {
    title: 'Avtal henting og tilbakelevering',
    text: 'Jeg bekrefter tilgjengelighet, sender enkel leieavtale og avtaler praktiske detaljer.',
  },
]

function HowItWorks() {
  return (
    <section className="section section-muted" id="slik-fungerer-det">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Prosess</p>
          <h2>Slik fungerer det</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
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

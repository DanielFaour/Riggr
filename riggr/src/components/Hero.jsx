function Hero() {
  const scrollToProducts = () => {
    document.getElementById('utstyr')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero-section" id="top">
      <div className="container hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Oslo, Norge</p>
          <h1>Lei lyd og utstyr enkelt.</h1>
          <p className="hero-subtitle">
            Lei høyttalere og eventutstyr i Oslo uten stress. Send en forespørsel,
            så avtaler vi henting og tilbakelevering.
          </p>
          <button className="button button-primary" type="button" onClick={scrollToProducts}>
            Se utstyr
          </button>
        </div>
        <div className="hero-media" aria-label="Riggr utstyr til leie">
          <div className="hero-panel">
            <div>
              <p className="hero-panel-label">Bookingforespørsel</p>
              <h2>Finn datoer. Send forespørsel.</h2>
            </div>
            <div className="hero-panel-row">
              <span>Utstyr</span>
              <strong>Soundboks, JBL og mer</strong>
            </div>
            <div className="hero-panel-row">
              <span>Område</span>
              <strong>Oslo</strong>
            </div>
            <div className="hero-panel-row">
              <span>Praktisk</span>
              <strong>Henting og tilbakelevering</strong>
            </div>
            <div className="hero-panel-note">
              Forespørselen bekreftes manuelt før leien er avtalt.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

function Hero({ t }) {
  const scrollToProducts = () => {
    document.getElementById('utstyr')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero-section" id="top">
      <div className="container hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>{t.hero.title}</h1>
          <p className="hero-subtitle">{t.hero.subtitle}</p>
          <button className="button button-primary" type="button" onClick={scrollToProducts}>
            {t.hero.cta}
          </button>
        </div>
        <div className="hero-media" aria-label={t.hero.mediaLabel}>
          <div className="hero-panel">
            <div>
              <p className="hero-panel-label">{t.hero.panelLabel}</p>
              <h2>{t.hero.panelTitle}</h2>
            </div>
            <div className="hero-panel-row">
              <span>{t.hero.equipmentLabel}</span>
              <strong>{t.hero.equipmentValue}</strong>
            </div>
            <div className="hero-panel-row">
              <span>{t.hero.areaLabel}</span>
              <strong>{t.hero.areaValue}</strong>
            </div>
            <div className="hero-panel-row">
              <span>{t.hero.practicalLabel}</span>
              <strong>{t.hero.practicalValue}</strong>
            </div>
            <div className="hero-panel-note">{t.hero.note}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

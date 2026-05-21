function InfoSection({ t }) {
  return (
    <section className="section info-section" id="informasjon">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">{t.info.eyebrow}</p>
          <h2>{t.info.title}</h2>
          <p>{t.info.intro}</p>
        </div>

        <div className="info-grid">
          <article className="info-card">
            <h3>{t.info.privacyTitle}</h3>
            <ul>
              {t.info.privacyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="info-card">
            <h3>{t.info.rentalTermsTitle}</h3>
            <ul>
              {t.info.rentalTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}

export default InfoSection

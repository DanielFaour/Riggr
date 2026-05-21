const privacyPoints = [
  'Når du sender forespørsel lagres navn, e-post, telefon, datoer, valgte produkter og melding i Google Sheets.',
  'Opplysningene brukes kun til å behandle leieforespørselen og avtale praktiske detaljer.',
  'Riggr bruker ikke cookies, innlogging, betaling eller sporingsverktøy på nettsiden.',
  'Du kan be om innsyn eller sletting ved å kontakte kontakt@riggr.no.',
]

const rentalTerms = [
  'Leie er ikke bekreftet før du har fått manuell bekreftelse fra Riggr.',
  'Utstyr hentes og leveres tilbake etter avtale i Oslo.',
  'Leietaker er ansvarlig for utstyret i leieperioden.',
  'Skade, tap eller manglende deler kan erstattes etter avtale og faktisk kostnad.',
  'En enkel leieavtale sendes før endelig bekreftelse.',
]

function InfoSection() {
  return (
    <section className="section info-section" id="informasjon">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Informasjon</p>
          <h2>Personvern og leievilkår</h2>
          <p>
            Kort fortalt: Riggr bruker informasjonen du sender inn til å behandle
            forespørselen din og avtale trygg leie av utstyr.
          </p>
        </div>

        <div className="info-grid">
          <article className="info-card">
            <h3>Personvern</h3>
            <ul>
              {privacyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="info-card">
            <h3>Leievilkår</h3>
            <ul>
              {rentalTerms.map((term) => (
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

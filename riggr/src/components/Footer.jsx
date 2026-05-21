function Footer({ t }) {
  return (
    <footer className="site-footer" id="kontakt">
      <div className="container footer-layout">
        <div>
          <h2>Riggr</h2>
          <p>{t.footer.tagline}</p>
        </div>
        <div className="footer-contact">
          <p>{t.footer.contact}</p>
          {/* <a href="#informasjon">Personvern og leievilkår</a> */}
          <a href="mailto:daniea1602@gmail.com">daniea1602@gmail.com</a>
          <span>{t.footer.location}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer

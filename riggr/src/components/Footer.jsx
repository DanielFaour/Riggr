function Footer() {
  return (
    <footer className="site-footer" id="kontakt">
      <div className="container footer-layout">
        <div>
          <h2>Riggr</h2>
          <p>Lei lyd og utstyr enkelt i Oslo.</p>
        </div>
        <div className="footer-contact">
          <p>Kontakt:</p>
          {/* <a href="#informasjon">Personvern og leievilkår</a> */}
          <a href="mailto:daniea1602@gmail.com">daniea1602@gmail.com</a>
          <span>Oslo, Norge</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer

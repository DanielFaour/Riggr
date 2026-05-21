function Header() {
  const scrollToTop = (event) => {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={scrollToTop} aria-label="Riggr forside">
        Riggr
      </a>
      <nav className="site-nav" aria-label="Hovednavigasjon">
        <a href="#utstyr">Utstyr</a>
        <a href="#slik-fungerer-det">
          <span className="nav-label-full">Slik fungerer det</span>
          <span className="nav-label-short" aria-hidden="true">Slik</span>
        </a>
        <a href="#kontakt">Kontakt</a>
      </nav>
    </header>
  )
}

export default Header

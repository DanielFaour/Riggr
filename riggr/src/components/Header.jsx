function Header({ language, onLanguageChange, t }) {
  const scrollToTop = (event) => {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="site-header">
      <a className="brand" href="#top" onClick={scrollToTop} aria-label={t.nav.homeLabel}>
        Riggr
      </a>
      <nav className="site-nav" aria-label={t.nav.ariaLabel}>
        <a href="#utstyr">
          <span className="nav-label-full">{t.nav.equipment}</span>
          <span className="nav-label-short" aria-hidden="true">{t.nav.equipmentShort}</span>
        </a>
        <a href="#slik-fungerer-det">
          <span className="nav-label-full">{t.nav.howItWorks}</span>
          <span className="nav-label-short" aria-hidden="true">{t.nav.howItWorksShort}</span>
        </a>
        <a href="#kontakt">
          <span className="nav-label-full">{t.nav.contact}</span>
          <span className="nav-label-short" aria-hidden="true">{t.nav.contactShort}</span>
        </a>
      </nav>
      <div className="language-toggle" aria-label={t.language.label}>
        <button
          type="button"
          className={language === 'no' ? 'is-active' : ''}
          onClick={() => onLanguageChange('no')}
          aria-pressed={language === 'no'}
          title={t.language.norwegian}
        >
          NO
        </button>
        <button
          type="button"
          className={language === 'en' ? 'is-active' : ''}
          onClick={() => onLanguageChange('en')}
          aria-pressed={language === 'en'}
          title={t.language.english}
        >
          EN
        </button>
      </div>
    </header>
  )
}

export default Header

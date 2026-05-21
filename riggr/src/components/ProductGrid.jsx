import { useMemo, useState } from 'react'
import ProductCard from './ProductCard'

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function ProductGrid({ products, isLoading, error, onRequestProduct }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category).filter(Boolean)),
      ).sort((categoryA, categoryB) => categoryA.localeCompare(categoryB, 'nb-NO')),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return [...products]
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory

        const searchableText = normalizeText(
          `${product.name} ${product.category} ${product.description}`,
        )
        const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch)

        return matchesCategory && matchesSearch
      })
      .sort((productA, productB) => {
        if (sortBy === 'name') {
          return productA.name.localeCompare(productB.name, 'nb-NO')
        }

        if (sortBy === 'price-low') {
          return Number(productA.pricePerDay || 0) - Number(productB.pricePerDay || 0)
        }

        if (sortBy === 'price-high') {
          return Number(productB.pricePerDay || 0) - Number(productA.pricePerDay || 0)
        }

        return 0
      })
  }, [products, searchTerm, selectedCategory, sortBy])

  return (
    <section className="section" id="utstyr">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">Katalog</p>
          <h2>Utstyr til leie</h2>
          <p>Velg produktet du trenger, sjekk tilgjengelighet og send en forespørsel.</p>
          <p className="pricing-note">
            Helg fredag-søndag: +50 kr per produkt per dag. Studentforeninger slipper tillegget.
          </p>
        </div>

        {isLoading ? <div className="state-card">Laster utstyr...</div> : null}

        {!isLoading && error ? (
          <div className="state-card state-card-error" role="alert">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <div className="state-card">
            Ingen aktive produkter er registrert ennå. Kom tilbake snart.
          </div>
        ) : null}

        {!isLoading && !error && products.length > 0 ? (
          <>
            <div className="catalog-tools" aria-label="Filtrer utstyr">
              <label htmlFor="product-search">
                Søk
                <input
                  id="product-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Søk etter Soundboks, JBL..."
                />
              </label>

              <label htmlFor="product-category">
                Kategori
                <select
                  id="product-category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="all">Alle kategorier</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="product-sort">
                Sortering
                <select
                  id="product-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recommended">Anbefalt</option>
                  <option value="name">Navn A-Å</option>
                  <option value="price-low">Laveste pris</option>
                  <option value="price-high">Høyeste pris</option>
                </select>
              </label>
            </div>

            <p className="catalog-count" aria-live="polite">
              Viser {filteredProducts.length} av {products.length} produkter.
            </p>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onRequest={() => onRequestProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="state-card">
                Ingen produkter matcher søket eller kategorien du valgte.
              </div>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}

export default ProductGrid

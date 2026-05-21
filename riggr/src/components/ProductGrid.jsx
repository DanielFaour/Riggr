import { useMemo, useState } from 'react'
import { getProductCategory, getProductName, getProductSearchText } from '../utils/productDisplay'
import ProductCard from './ProductCard'

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function ProductGrid({
  products,
  isLoading,
  error,
  onRequestProduct,
  onRefreshProducts,
  language,
  t,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  const categories = useMemo(
    () => {
      const categoryMap = new Map()

      products.forEach((product) => {
        if (product.category && !categoryMap.has(product.category)) {
          categoryMap.set(product.category, getProductCategory(product, language))
        }
      })

      return Array.from(categoryMap, ([value, label]) => ({ label, value })).sort(
        (categoryA, categoryB) =>
          categoryA.label.localeCompare(categoryB.label, language === 'en' ? 'en-GB' : 'nb-NO'),
      )
    },
    [language, products],
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm)

    return [...products]
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory

        const searchableText = normalizeText(getProductSearchText(product, language))
        const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch)

        return matchesCategory && matchesSearch
      })
      .sort((productA, productB) => {
        if (sortBy === 'name') {
          return getProductName(productA, language).localeCompare(
            getProductName(productB, language),
            language === 'en' ? 'en-GB' : 'nb-NO',
          )
        }

        if (sortBy === 'price-low') {
          return Number(productA.pricePerDay || 0) - Number(productB.pricePerDay || 0)
        }

        if (sortBy === 'price-high') {
          return Number(productB.pricePerDay || 0) - Number(productA.pricePerDay || 0)
        }

        return 0
      })
  }, [language, products, searchTerm, selectedCategory, sortBy])

  return (
    <section className="section" id="utstyr">
      <div className="container">
        <div className="section-heading">
          <p className="eyebrow">{t.products.eyebrow}</p>
          <h2>{t.products.title}</h2>
          <p>{t.products.subtitle}</p>
          <p className="pricing-note">{t.products.pricingNote}</p>
        </div>

        {isLoading ? <div className="state-card">{t.products.loading}</div> : null}

        {!isLoading && error ? (
          <div className="state-card state-card-error" role="alert">
            <p>{error}</p>
            <button className="button button-secondary" type="button" onClick={onRefreshProducts}>
              {t.products.retry}
            </button>
          </div>
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <div className="state-card">{t.products.empty}</div>
        ) : null}

        {!isLoading && !error && products.length > 0 ? (
          <>
            <div className="catalog-tools" aria-label={t.products.filtersLabel}>
              <label htmlFor="product-search">
                {t.products.searchLabel}
                <input
                  id="product-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t.products.searchPlaceholder}
                />
              </label>

              <label htmlFor="product-category">
                {t.products.categoryLabel}
                <select
                  id="product-category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                >
                  <option value="all">{t.products.allCategories}</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="product-sort">
                {t.products.sortLabel}
                <select
                  id="product-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="recommended">{t.products.recommended}</option>
                  <option value="name">{t.products.nameSort}</option>
                  <option value="price-low">{t.products.priceLow}</option>
                  <option value="price-high">{t.products.priceHigh}</option>
                </select>
              </label>
            </div>

            <p className="catalog-count" aria-live="polite">
              {t.products.count(filteredProducts.length, products.length)}
            </p>

            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onRequest={() => onRequestProduct(product)}
                    language={language}
                    t={t}
                  />
                ))}
              </div>
            ) : (
              <div className="state-card">{t.products.noMatches}</div>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}

export default ProductGrid

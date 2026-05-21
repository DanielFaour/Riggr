import { useState } from 'react'
import { formatPrice } from '../utils/formatDate'
import { getProductCategory, getProductDescription, getProductName } from '../utils/productDisplay'

function ProductCard({ product, onRequest, language, t }) {
  const [imageFailed, setImageFailed] = useState(false)
  const shouldShowImage = product.imageUrl && !imageFailed
  const productName = getProductName(product, language)
  const productCategory = getProductCategory(product, language)
  const productDescription = getProductDescription(product, language)

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {shouldShowImage ? (
          <img
            src={product.imageUrl}
            alt={productName}
            className="product-image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-placeholder" aria-label={t.products.imageMissing}>
            <span>{productCategory || t.products.fallbackCategory}</span>
          </div>
        )}
      </div>
      <div className="product-content">
        <p className="product-category">{productCategory}</p>
        <h3>{productName}</h3>
        <p className="product-description">{productDescription}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.pricePerDay, language, t)}</span>
          <button className="button button-secondary" type="button" onClick={onRequest}>
            {t.products.request}
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

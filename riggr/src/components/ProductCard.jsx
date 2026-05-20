import { useState } from 'react'
import { formatPrice } from '../utils/formatDate'

function ProductCard({ product, onRequest }) {
  const [imageFailed, setImageFailed] = useState(false)
  const shouldShowImage = product.imageUrl && !imageFailed

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {shouldShowImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-placeholder" aria-label="Produktbilde mangler">
            <span>{product.category || 'Utstyr'}</span>
          </div>
        )}
      </div>
      <div className="product-content">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.pricePerDay)}</span>
          <button className="button button-secondary" type="button" onClick={onRequest}>
            Send forespørsel
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard

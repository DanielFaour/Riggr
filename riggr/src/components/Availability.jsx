import { getUnavailableBookingsForProduct } from '../utils/dateOverlap'
import { formatDate } from '../utils/formatDate'
import { getProductName } from '../utils/productDisplay'

function formatUpdatedAt(updatedAt, language, t) {
  if (!updatedAt) {
    return t.availability.notUpdated
  }

  const time = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(updatedAt)

  return t.availability.updated(time)
}

function Availability({
  bookings,
  products,
  productIds,
  isLoading,
  error,
  updatedAt,
  onRefresh,
  language,
  t,
}) {
  const unavailableGroups = productIds
    .map((productId) => ({
      productId,
      product: products.find((product) => product.id === productId),
      bookings: getUnavailableBookingsForProduct(bookings, productId),
    }))
    .filter((group) => group.bookings.length > 0)

  return (
    <div className="availability">
      <div className="availability-header">
        <div>
          <h3>{t.availability.title}</h3>
          <span>
            {isLoading ? t.availability.updating : formatUpdatedAt(updatedAt, language, t)}
          </span>
        </div>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
          {t.availability.refresh}
        </button>
      </div>
      {isLoading ? <p>{t.availability.loading}</p> : null}

      {!isLoading && error ? (
        <p className="availability-error">{error}</p>
      ) : null}

      {!isLoading && !error && unavailableGroups.length > 0 ? (
        <div className="availability-groups">
          {unavailableGroups.map((group) => (
            <div className="availability-group" key={group.productId}>
              <strong>
                {group.product ? getProductName(group.product, language) : t.availability.selectedProduct}
              </strong>
              <ul>
                {group.bookings.map((booking) => (
                  <li key={booking.id}>
                    {t.availability.dateRange(
                      formatDate(booking.startDate, language, t),
                      formatDate(booking.endDate, language, t),
                      booking.status,
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && unavailableGroups.length === 0 ? (
        <p>{t.availability.empty}</p>
      ) : null}
    </div>
  )
}

export default Availability

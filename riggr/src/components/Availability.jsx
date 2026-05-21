import { getUnavailableBookingsForProduct } from '../utils/dateOverlap'
import { formatDate } from '../utils/formatDate'

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) {
    return 'Ikke oppdatert ennå'
  }

  return `Oppdatert ${new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(updatedAt)}`
}

function Availability({ bookings, products, productIds, isLoading, error, updatedAt, onRefresh }) {
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
          <h3>Utilgjengelige datoer:</h3>
          <span>{isLoading ? 'Oppdaterer tilgjengelighet...' : formatUpdatedAt(updatedAt)}</span>
        </div>
        <button type="button" onClick={onRefresh} disabled={isLoading}>
          Oppdater
        </button>
      </div>
      {isLoading ? <p>Laster tilgjengelighet...</p> : null}

      {!isLoading && error ? (
        <p className="availability-error">{error}</p>
      ) : null}

      {!isLoading && !error && unavailableGroups.length > 0 ? (
        <div className="availability-groups">
          {unavailableGroups.map((group) => (
            <div className="availability-group" key={group.productId}>
              <strong>{group.product?.name || 'Valgt produkt'}</strong>
              <ul>
                {group.bookings.map((booking) => (
                  <li key={booking.id}>
                    {formatDate(booking.startDate)} til {formatDate(booking.endDate)},{' '}
                    {booking.status}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && unavailableGroups.length === 0 ? (
        <p>Ingen registrerte bookinger for valgte produkter.</p>
      ) : null}
    </div>
  )
}

export default Availability

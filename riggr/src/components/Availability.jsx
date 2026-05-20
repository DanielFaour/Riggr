import { getUnavailableBookingsForProduct } from '../utils/dateOverlap'
import { formatDate } from '../utils/formatDate'

function Availability({ bookings, productId, isLoading, error }) {
  const unavailableBookings = getUnavailableBookingsForProduct(bookings, productId)

  return (
    <div className="availability">
      <h3>Utilgjengelige datoer:</h3>
      {isLoading ? <p>Laster tilgjengelighet...</p> : null}

      {!isLoading && error ? (
        <p className="availability-error">{error}</p>
      ) : null}

      {!isLoading && !error && unavailableBookings.length > 0 ? (
        <ul>
          {unavailableBookings.map((booking) => (
            <li key={booking.id}>
              {formatDate(booking.startDate)} til {formatDate(booking.endDate)},{' '}
              {booking.status}
            </li>
          ))}
        </ul>
      ) : null}

      {!isLoading && !error && unavailableBookings.length === 0 ? (
        <p>Ingen registrerte bookinger for dette produktet.</p>
      ) : null}
    </div>
  )
}

export default Availability

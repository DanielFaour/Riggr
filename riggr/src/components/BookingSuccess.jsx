function BookingSuccess({ message }) {
  return (
    <div className="booking-success-overlay" role="status" aria-live="polite">
      <div className="booking-success-content">
        <div className="booking-success-icon" aria-hidden="true">
          <span />
        </div>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default BookingSuccess


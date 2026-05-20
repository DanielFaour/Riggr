import { useId, useMemo, useState } from 'react'
import { doesDateRangeOverlap, getUnavailableBookingsForProduct } from '../utils/dateOverlap'
import { formatPrice } from '../utils/formatDate'
import Availability from './Availability'

const emptyForm = {
  startDate: '',
  endDate: '',
  name: '',
  email: '',
  phone: '',
  message: '',
}

function BookingModal({ product, bookings, bookingsLoading, bookingsError, onClose, onSubmit }) {
  const formId = useId()
  const [formData, setFormData] = useState(emptyForm)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const unavailableBookings = useMemo(
    () => getUnavailableBookingsForProduct(bookings, product.id),
    [bookings, product.id],
  )

  const overlapBooking = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return null
    }

    return (
      unavailableBookings.find((booking) =>
        doesDateRangeOverlap(
          formData.startDate,
          formData.endDate,
          booking.startDate,
          booking.endDate,
        ),
      ) || null
    )
  }, [formData.endDate, formData.startDate, unavailableBookings])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setStatus('idle')
    setErrorMessage('')
  }

  const validateForm = () => {
    if (!product.id) {
      return 'Produkt mangler. Lukk vinduet og prøv igjen.'
    }

    if (!formData.startDate || !formData.endDate) {
      return 'Velg både startdato og sluttdato.'
    }

    if (bookingsLoading) {
      return 'Vent til tilgjengelighet er lastet inn.'
    }

    if (bookingsError) {
      return 'Kunne ikke sjekke tilgjengelighet akkurat nå. Prøv igjen om litt.'
    }

    if (formData.endDate < formData.startDate) {
      return 'Sluttdato kan ikke være før startdato.'
    }

    if (!formData.name.trim()) {
      return 'Skriv inn navn.'
    }

    if (!formData.email.trim()) {
      return 'Skriv inn e-post.'
    }

    if (!formData.phone.trim()) {
      return 'Skriv inn telefonnummer.'
    }

    if (overlapBooking) {
      return 'Valgte datoer overlapper en eksisterende forespørsel eller booking.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationError = validateForm()

    if (validationError) {
      setStatus('error')
      setErrorMessage(validationError)
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      await onSubmit({
        productId: product.id,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        message: formData.message.trim(),
      })
      setFormData(emptyForm)
      setStatus('success')
    } catch (submitError) {
      setStatus('error')
      setErrorMessage(
        submitError.message || 'Noe gikk galt da forespørselen skulle sendes. Prøv igjen.',
      )
    }
  }

  const isSubmitting = status === 'submitting'
  const isBlockedByOverlap = Boolean(overlapBooking)
  const cannotCheckAvailability = bookingsLoading || Boolean(bookingsError)

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="booking-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
      >
        <button className="close-button" type="button" onClick={onClose} aria-label="Lukk booking" />

        <div className="booking-intro">
          <p className="product-category">{product.category}</p>
          <h2 id={`${formId}-title`}>{product.name}</h2>
          <p>{product.description}</p>
          <strong>{formatPrice(product.pricePerDay)}</strong>
          <p className="pricing-note">
            Helg: +50 kr. Studentforeninger slipper tillegget.
          </p>
        </div>

        <Availability
          bookings={bookings}
          productId={product.id}
          isLoading={bookingsLoading}
          error={bookingsError}
        />

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor={`${formId}-startDate`}>
              Startdato
              <input
                id={`${formId}-startDate`}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </label>
            <label htmlFor={`${formId}-endDate`}>
              Sluttdato
              <input
                id={`${formId}-endDate`}
                type="date"
                name="endDate"
                min={formData.startDate}
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          {isBlockedByOverlap ? (
            <div className="form-message form-message-warning" role="alert">
              Valgte datoer er ikke tilgjengelige for dette produktet.
            </div>
          ) : null}

          <label htmlFor={`${formId}-name`}>
            Navn
            <input
              id={`${formId}-name`}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </label>

          <div className="form-grid">
            <label htmlFor={`${formId}-email`}>
              E-post
              <input
                id={`${formId}-email`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>
            <label htmlFor={`${formId}-phone`}>
              Telefon
              <input
                id={`${formId}-phone`}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </label>
          </div>

          <label htmlFor={`${formId}-message`}>
            Melding
            <textarea
              id={`${formId}-message`}
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder="Fortell gjerne litt om arrangementet."
            />
          </label>

          {status === 'success' ? (
            <div className="form-message form-message-success" role="status">
              Forespørselen er sendt. Jeg tar kontakt for å bekrefte leien.
            </div>
          ) : null}

          {status === 'error' && errorMessage ? (
            <div className="form-message form-message-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <button
            className="button button-primary button-full"
            type="submit"
            disabled={isSubmitting || isBlockedByOverlap || cannotCheckAvailability}
          >
            {isSubmitting ? 'Sender...' : 'Send forespørsel'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default BookingModal

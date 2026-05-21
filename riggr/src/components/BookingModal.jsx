import { useId, useMemo, useState } from 'react'
import { doesDateRangeOverlap, getUnavailableBookingsForProduct } from '../utils/dateOverlap'
import { getTodayDateKey } from '../utils/dateValue'
import { calculateEstimatedBookingPrice } from '../utils/estimatePrice'
import { formatCurrency, formatPrice } from '../utils/formatDate'
import Availability from './Availability'

const emptyForm = {
  startDate: '',
  endDate: '',
  name: '',
  email: '',
  phone: '',
  message: '',
  isStudentAssociation: false,
}

function BookingModal({
  product,
  products,
  bookings,
  bookingsLoading,
  bookingsError,
  bookingsUpdatedAt,
  onRefreshBookings,
  onClose,
  onSubmit,
}) {
  const formId = useId()
  const [formData, setFormData] = useState(emptyForm)
  const [selectedProductIds, setSelectedProductIds] = useState([product.id])
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const selectedProducts = useMemo(
    () => products.filter((availableProduct) => selectedProductIds.includes(availableProduct.id)),
    [products, selectedProductIds],
  )

  const unavailableBookings = useMemo(
    () =>
      selectedProductIds.flatMap((productId) =>
        getUnavailableBookingsForProduct(bookings, productId),
      ),
    [bookings, selectedProductIds],
  )

  const selectedPricePerDay = selectedProducts.reduce((sum, selectedProduct) => {
    const price = Number(selectedProduct.pricePerDay)
    return Number.isFinite(price) ? sum + price : sum
  }, 0)

  const productPickerOptions = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase()

    return products.filter((availableProduct) => {
      if (availableProduct.id === product.id) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return `${availableProduct.name} ${availableProduct.category} ${availableProduct.description}`
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [product.id, productSearch, products])

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
    const { checked, name, type, value } = event.target
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setStatus('idle')
    setErrorMessage('')
  }

  const priceEstimate = useMemo(
    () =>
      calculateEstimatedBookingPrice({
        products: selectedProducts,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isStudentAssociation: formData.isStudentAssociation,
      }),
    [
      formData.endDate,
      formData.isStudentAssociation,
      formData.startDate,
      selectedProducts,
    ],
  )

  const bookingItems = useMemo(
    () =>
      selectedProducts.map((selectedProduct) => {
        const productEstimate = calculateEstimatedBookingPrice({
          products: [selectedProduct],
          startDate: formData.startDate,
          endDate: formData.endDate,
          isStudentAssociation: formData.isStudentAssociation,
        })

        return {
          productId: selectedProduct.id,
          estPrice: productEstimate.total,
        }
      }),
    [
      formData.endDate,
      formData.isStudentAssociation,
      formData.startDate,
      selectedProducts,
    ],
  )

  const handleProductToggle = (productId) => {
    setSelectedProductIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((currentId) => currentId !== productId)
        : [...currentIds, productId],
    )
    setStatus('idle')
    setErrorMessage('')
  }

  const removeSelectedProduct = (productId) => {
    setSelectedProductIds((currentIds) => currentIds.filter((currentId) => currentId !== productId))
    setStatus('idle')
    setErrorMessage('')
  }

  const validateForm = () => {
    if (selectedProductIds.length === 0) {
      return 'Velg minst ett produkt.'
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

    if (formData.startDate < todayDateKey) {
      return 'Startdato kan ikke være før i dag.'
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
      return 'Valgte datoer overlapper en eksisterende forespørsel eller booking for ett eller flere produkter.'
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
        bookingItems,
        selectedProductNames: selectedProducts.map((selectedProduct) => selectedProduct.name),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        message: formData.message.trim(),
        isStudentAssociation: formData.isStudentAssociation,
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
  const todayDateKey = getTodayDateKey()

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
          <p className="product-category">Forespørsel</p>
          <h2 id={`${formId}-title`}>Velg utstyr</h2>
          <p>
            Start med {product.name}. Du kan legge til mer utstyr hvis du trenger det.
          </p>
          <strong>{formatPrice(selectedPricePerDay)} samlet</strong>
          <p className="pricing-note">
            Helg fredag-søndag: +50 kr per produkt per dag. Studentforeninger slipper tillegget.
          </p>
        </div>

        {showProductPicker ? (
          <div className="product-picker" aria-label="Legg til flere produkter">
            <label htmlFor={`${formId}-productSearch`}>
              Søk etter mer utstyr
              <input
                id={`${formId}-productSearch`}
                type="search"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder="Søk etter JBL, stativ, lys..."
              />
            </label>

            <div className="product-options">
              {productPickerOptions.length > 0 ? (
                productPickerOptions.map((availableProduct) => (
                  <label className="product-option" key={availableProduct.id}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(availableProduct.id)}
                      onChange={() => handleProductToggle(availableProduct.id)}
                    />
                    <span>
                      <strong>{availableProduct.name}</strong>
                      <small>{availableProduct.category}</small>
                    </span>
                    <em>{formatPrice(availableProduct.pricePerDay)}</em>
                  </label>
                ))
              ) : (
                <p className="picker-empty">Ingen produkter matcher søket.</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="selected-products" aria-label="Valgt utstyr">
          <div className="selected-products-header">
            <h3>Valgt utstyr</h3>
            <button
              className="inline-action"
              type="button"
              onClick={() => setShowProductPicker((isOpen) => !isOpen)}
              aria-expanded={showProductPicker}
            >
              {showProductPicker ? 'Skjul valg' : '+ Legg til flere produkter'}
            </button>
          </div>

          <div className="selected-product-list">
            {selectedProducts.map((selectedProduct) => (
              <div className="selected-product" key={selectedProduct.id}>
                <span>
                  <strong>{selectedProduct.name}</strong>
                  <small>{formatPrice(selectedProduct.pricePerDay)}</small>
                </span>
                {selectedProduct.id !== product.id ? (
                  <button
                    type="button"
                    onClick={() => removeSelectedProduct(selectedProduct.id)}
                    aria-label={`Fjern ${selectedProduct.name}`}
                  >
                    Fjern
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <Availability
          bookings={bookings}
          products={products}
          productIds={selectedProductIds}
          isLoading={bookingsLoading}
          error={bookingsError}
          updatedAt={bookingsUpdatedAt}
          onRefresh={onRefreshBookings}
        />

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label htmlFor={`${formId}-startDate`}>
              Startdato
              <input
                id={`${formId}-startDate`}
                type="date"
                name="startDate"
                min={todayDateKey}
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
                min={formData.startDate || todayDateKey}
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className="checkbox-field" htmlFor={`${formId}-isStudentAssociation`}>
            <input
              id={`${formId}-isStudentAssociation`}
              type="checkbox"
              name="isStudentAssociation"
              checked={formData.isStudentAssociation}
              onChange={handleChange}
            />
            <span>Dette er for en studentforening</span>
          </label>

          <div className="price-estimate" aria-live="polite">
            <span>Estimert pris</span>
            {priceEstimate.hasValidDates ? (
              <>
                <strong>{formatCurrency(priceEstimate.total)}</strong>
                <small>
                  {priceEstimate.dayCount} {priceEstimate.dayCount === 1 ? 'dag' : 'dager'} x{' '}
                  {formatCurrency(selectedPricePerDay)}
                  {priceEstimate.weekendFee > 0
                    ? ` + ${formatCurrency(priceEstimate.weekendFee)} helgetillegg (${selectedProducts.length} ${selectedProducts.length === 1 ? 'produkt' : 'produkter'} x ${priceEstimate.weekendDayCount} ${priceEstimate.weekendDayCount === 1 ? 'helgedag' : 'helgedager'})`
                    : ''}
                  {priceEstimate.includesWeekend && formData.isStudentAssociation
                    ? ' - helgetillegg fjernet for studentforening'
                    : ''}
                </small>
              </>
            ) : (
              <>
                <strong>Velg datoer</strong>
                <small>Estimatet vises før du sender forespørselen.</small>
              </>
            )}
          </div>

          {isBlockedByOverlap ? (
            <div className="form-message form-message-warning" role="alert">
              Valgte datoer er ikke tilgjengelige for ett eller flere valgte produkter.
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
            disabled={
              isSubmitting ||
              isBlockedByOverlap ||
              cannotCheckAvailability ||
              selectedProductIds.length === 0
            }
          >
            {isSubmitting
              ? 'Sender...'
              : `Send forespørsel${selectedProductIds.length > 1 ? ` (${selectedProductIds.length})` : ''}`}
          </button>
        </form>
      </section>
    </div>
  )
}

export default BookingModal

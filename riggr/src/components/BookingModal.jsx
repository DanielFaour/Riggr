import { useId, useMemo, useState } from 'react'
import { doesDateRangeOverlap, getUnavailableBookingsForProduct } from '../utils/dateOverlap'
import { getTodayDateKey } from '../utils/dateValue'
import { calculateEstimatedBookingPrice } from '../utils/estimatePrice'
import { formatCurrency, formatDate, formatPrice } from '../utils/formatDate'
import {
  getProductCategory,
  getProductName,
  getProductSearchText,
} from '../utils/productDisplay'
import Availability from './Availability'

const emptyForm = {
  startDate: '',
  endDate: '',
  name: '',
  email: '',
  phone: '',
  message: '',
  isStudentAssociation: false,
  acceptsPrivacy: false,
}

function DateField({ id, label, name, min, value, onChange, language, t }) {
  return (
    <label className="date-field" htmlFor={id}>
      <span>{label}</span>
      <span className={`date-field-display ${value ? '' : 'date-field-placeholder'}`} aria-hidden="true">
        <span>{value ? formatDate(value, language, t) : t.booking.chooseDate}</span>
        <span className="date-field-icon" />
      </span>
      <input
        className="date-native-input"
        id={id}
        type="date"
        name={name}
        min={min}
        value={value}
        onChange={onChange}
        required
      />
    </label>
  )
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
  onSuccess,
  language,
  t,
}) {
  const formId = useId()
  const [formData, setFormData] = useState(emptyForm)
  const [selectedProductIds, setSelectedProductIds] = useState([product.id])
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)

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

      return getProductSearchText(availableProduct, language).toLowerCase().includes(normalizedSearch)
    })
  }, [language, product.id, productSearch, products])

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
      return t.booking.validation.selectProduct
    }

    if (!formData.startDate || !formData.endDate) {
      return t.booking.validation.datesRequired
    }

    if (bookingsLoading) {
      return t.booking.validation.waitForAvailability
    }

    if (bookingsError) {
      return t.booking.validation.availabilityError
    }

    if (formData.startDate < todayDateKey) {
      return t.booking.validation.pastStartDate
    }

    if (formData.endDate < formData.startDate) {
      return t.booking.validation.endBeforeStart
    }

    if (!formData.name.trim()) {
      return t.booking.validation.nameRequired
    }

    if (!formData.email.trim()) {
      return t.booking.validation.emailRequired
    }

    if (!formData.phone.trim()) {
      return t.booking.validation.phoneRequired
    }

    if (!formData.acceptsPrivacy) {
      return t.booking.validation.privacyRequired
    }

    if (overlapBooking) {
      return t.booking.validation.overlap
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
        selectedProductNames: selectedProducts.map((selectedProduct) =>
          getProductName(selectedProduct, language),
        ),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        message: formData.message.trim(),
        isStudentAssociation: formData.isStudentAssociation,
      })
      setFormData(emptyForm)
      onSuccess()
    } catch (submitError) {
      setStatus('error')
      setErrorMessage(
        submitError.message || t.booking.validation.submitError,
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
        <button className="close-button" type="button" onClick={onClose} aria-label={t.booking.closeLabel} />

        <div className="booking-intro">
          <p className="product-category">{t.booking.requestLabel}</p>
          <h2 id={`${formId}-title`}>{t.booking.title}</h2>
        </div>

        {showProductPicker ? (
          <div className="product-picker" aria-label={t.booking.addProductsLabel}>
            <label htmlFor={`${formId}-productSearch`}>
              {t.booking.searchMore}
              <input
                id={`${formId}-productSearch`}
                type="search"
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder={t.booking.searchMorePlaceholder}
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
                      <strong>{getProductName(availableProduct, language)}</strong>
                      <small>{getProductCategory(availableProduct, language)}</small>
                    </span>
                    <em>{formatPrice(availableProduct.pricePerDay, language, t)}</em>
                  </label>
                ))
              ) : (
                <p className="picker-empty">{t.booking.noProductMatches}</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="selected-products" aria-label={t.booking.selectedProducts}>
          <div className="selected-products-header">
            <h3>{t.booking.selectedProducts}</h3>
            <button
              className="inline-action"
              type="button"
              onClick={() => setShowProductPicker((isOpen) => !isOpen)}
              aria-expanded={showProductPicker}
            >
              {showProductPicker ? t.booking.hideChoices : t.booking.addMoreProducts}
            </button>
          </div>

          <div className="selected-product-list">
            {selectedProducts.map((selectedProduct) => (
              <div className="selected-product" key={selectedProduct.id}>
                <span>
                  <strong>{getProductName(selectedProduct, language)}</strong>
                  <small>{formatPrice(selectedProduct.pricePerDay, language, t)}</small>
                </span>
                {selectedProduct.id !== product.id ? (
                  <button
                    type="button"
                    onClick={() => removeSelectedProduct(selectedProduct.id)}
                    aria-label={t.booking.removeProduct(getProductName(selectedProduct, language))}
                  >
                    {t.booking.remove}
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
          language={language}
          t={t}
        />

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <DateField
              id={`${formId}-startDate`}
              label={t.booking.startDate}
              name="startDate"
              min={todayDateKey}
              value={formData.startDate}
              onChange={handleChange}
              language={language}
              t={t}
            />
            <DateField
              id={`${formId}-endDate`}
              label={t.booking.endDate}
              name="endDate"
              min={formData.startDate || todayDateKey}
              value={formData.endDate}
              onChange={handleChange}
              language={language}
              t={t}
            />
          </div>

          <label className="checkbox-field" htmlFor={`${formId}-isStudentAssociation`}>
            <input
              id={`${formId}-isStudentAssociation`}
              type="checkbox"
              name="isStudentAssociation"
              checked={formData.isStudentAssociation}
              onChange={handleChange}
            />
            <span>{t.booking.studentAssociation}</span>
          </label>

          <div className="price-estimate" aria-live="polite">
            <span>{t.booking.priceEstimate}</span>
            {priceEstimate.hasValidDates ? (
              <>
                <strong>{formatCurrency(priceEstimate.total, language, t)}</strong>
                <small>
                  {priceEstimate.dayCount}{' '}
                  {priceEstimate.dayCount === 1 ? t.booking.day : t.booking.days} x{' '}
                  {formatCurrency(selectedPricePerDay, language, t)}
                  {priceEstimate.weekendFee > 0
                    ? t.booking.weekendFee(
                        formatCurrency(priceEstimate.weekendFee, language, t),
                        selectedProducts.length,
                        selectedProducts.length === 1 ? t.booking.product : t.booking.products,
                        priceEstimate.weekendDayCount,
                        priceEstimate.weekendDayCount === 1
                          ? t.booking.weekendDay
                          : t.booking.weekendDays,
                      )
                    : ''}
                  {priceEstimate.includesWeekend && formData.isStudentAssociation
                    ? t.booking.studentWeekendWaiver
                    : ''}
                </small>
              </>
            ) : (
              <>
                <strong>{t.booking.chooseDates}</strong>
                <small>{t.booking.estimateHint}</small>
              </>
            )}
          </div>
          <p className="price-note">{t.booking.pricingNote}</p>

          {isBlockedByOverlap ? (
            <div className="form-message form-message-warning" role="alert">
              {t.booking.overlapWarning}
            </div>
          ) : null}

          <label htmlFor={`${formId}-name`}>
            {t.booking.name}
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
              {t.booking.email}
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
              {t.booking.phone}
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
            {t.booking.message}
            <textarea
              id={`${formId}-message`}
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              placeholder={t.booking.messagePlaceholder}
            />
          </label>

          <div className="privacy-consent">
            <label className="checkbox-field" htmlFor={`${formId}-acceptsPrivacy`}>
              <input
                id={`${formId}-acceptsPrivacy`}
                type="checkbox"
                name="acceptsPrivacy"
                checked={formData.acceptsPrivacy}
                onChange={handleChange}
                required
              />
              <span>{t.booking.privacyConsent}</span>
            </label>
            <button
              className="privacy-link"
              type="button"
              onClick={() => setShowPrivacyDetails(true)}
            >
              {t.booking.privacyLink}
            </button>
          </div>

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
            {isSubmitting ? t.booking.submitting : t.booking.submit(selectedProductIds.length)}
          </button>
        </form>

        {showPrivacyDetails ? (
          <div
            className="privacy-dialog-backdrop"
            onMouseDown={(event) =>
              event.target === event.currentTarget && setShowPrivacyDetails(false)
            }
          >
            <section
              className="privacy-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`${formId}-privacy-title`}
            >
              <button
                className="close-button"
                type="button"
                onClick={() => setShowPrivacyDetails(false)}
                aria-label={t.booking.closePrivacyLabel}
              />
              <p className="product-category">{t.info.eyebrow}</p>
              <h3 id={`${formId}-privacy-title`}>{t.info.title}</h3>
              <p>{t.info.intro}</p>
              <div className="privacy-dialog-grid">
                <div>
                  <strong>{t.info.privacyTitle}</strong>
                  <ul>
                    {t.info.privacyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>{t.info.rentalTermsTitle}</strong>
                  <ul>
                    {t.info.rentalTerms.map((term) => (
                      <li key={term}>{term}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default BookingModal

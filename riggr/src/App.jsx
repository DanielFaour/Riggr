import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBooking, getBookings, getProducts } from './api/riggrApi'
import BookingModal from './components/BookingModal'
import BookingSuccess from './components/BookingSuccess'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import InfoSection from './components/InfoSection'
import ProductGrid from './components/ProductGrid'
import { translations } from './i18n/translations'

function createOrderId() {
  const timestampPart = Date.now().toString(36).slice(-6)
  const randomPart = Math.random().toString(36).slice(2, 6)

  return `order-${timestampPart}-${randomPart}`
}

function App() {
  const [products, setProducts] = useState([])
  const [bookings, setBookings] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [bookingsError, setBookingsError] = useState('')
  const [bookingsUpdatedAt, setBookingsUpdatedAt] = useState(null)
  const [showBookingSuccess, setShowBookingSuccess] = useState(false)
  const [bookingSuccessId, setBookingSuccessId] = useState(0)
  const [language, setLanguage] = useState('no')
  const t = translations[language]
  const isOverlayOpen = Boolean(selectedProduct) || showBookingSuccess

  const activeProducts = useMemo(
    () => products.filter((product) => String(product.active).toLowerCase() === 'true'),
    [products],
  )

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')

    try {
      const productsResponse = await getProducts()
      setProducts(productsResponse)
    } catch (requestError) {
      setProductsError(requestError.message)
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const refreshBookings = useCallback(async () => {
    setBookingsLoading(true)
    setBookingsError('')

    try {
      const bookingsResponse = await getBookings()
      setBookings(bookingsResponse)
      setBookingsUpdatedAt(new Date())
      return bookingsResponse
    } catch (requestError) {
      setBookingsError(requestError.message)
      return null
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialProducts() {
      setProductsLoading(true)
      setProductsError('')

      try {
        const productsResponse = await getProducts()

        if (!isMounted) {
          return
        }

        setProducts(productsResponse)
      } catch (requestError) {
        if (isMounted) {
          setProductsError(requestError.message)
        }
      } finally {
        if (isMounted) {
          setProductsLoading(false)
        }
      }
    }

    async function loadInitialBookings() {
      try {
        const bookingsResponse = await getBookings()

        if (!isMounted) {
          return
        }

        setBookings(bookingsResponse)
        setBookingsUpdatedAt(new Date())
      } catch (requestError) {
        if (isMounted) {
          setBookingsError(requestError.message)
        }
      } finally {
        if (isMounted) {
          setBookingsLoading(false)
        }
      }
    }

    loadInitialProducts()
    loadInitialBookings()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'no'
  }, [language])

  useEffect(() => {
    if (!isOverlayOpen) {
      return undefined
    }

    const scrollY = window.scrollY
    const originalBodyStyles = {
      left: document.body.style.left,
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      right: document.body.style.right,
      top: document.body.style.top,
      width: document.body.style.width,
    }

    document.body.style.left = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.right = '0'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.body.style.left = originalBodyStyles.left
      document.body.style.overflow = originalBodyStyles.overflow
      document.body.style.position = originalBodyStyles.position
      document.body.style.right = originalBodyStyles.right
      document.body.style.top = originalBodyStyles.top
      document.body.style.width = originalBodyStyles.width
      window.scrollTo(0, scrollY)
    }
  }, [isOverlayOpen])

  useEffect(() => {
    if (!showBookingSuccess) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setShowBookingSuccess(false)
    }, 2500)

    return () => window.clearTimeout(timeoutId)
  }, [bookingSuccessId, showBookingSuccess])

  const handleBookingSubmit = async ({
    bookingItems,
    isStudentAssociation,
    selectedProductNames,
    ...bookingData
  }) => {
    const orderId = createOrderId()
    const selectedProductsMessage = t.booking.sheetMessage.selectedProducts(selectedProductNames)
    const studentAssociationMessage =
      t.booking.sheetMessage.studentAssociation(isStudentAssociation)
    const message = bookingData.message
      ? `${bookingData.message}\n\n${selectedProductsMessage}\n${studentAssociationMessage}`
      : `${selectedProductsMessage}\n${studentAssociationMessage}`

    await Promise.all(
      bookingItems.map((bookingItem) =>
        createBooking({
          ...bookingData,
          orderId,
          productId: bookingItem.productId,
          estPrice: bookingItem.estPrice,
          message,
        }),
      ),
    )
    await refreshBookings()
  }

  const handleRequestProduct = (product) => {
    setSelectedProduct(product)
    refreshBookings()
  }

  const handleBookingSuccess = () => {
    setSelectedProduct(null)
    setBookingSuccessId((currentId) => currentId + 1)
    setShowBookingSuccess(true)
  }

  return (
    <>
      <Header language={language} onLanguageChange={setLanguage} t={t} />
      <main>
        <Hero t={t} />
        <ProductGrid
          products={activeProducts}
          isLoading={productsLoading}
          error={productsError}
          onRequestProduct={handleRequestProduct}
          onRefreshProducts={refreshProducts}
          language={language}
          t={t}
        />
        <HowItWorks t={t} />
        <InfoSection t={t} />
      </main>
      <Footer t={t} />
      {selectedProduct ? (
        <BookingModal
          product={selectedProduct}
          products={activeProducts}
          bookings={bookings}
          bookingsLoading={bookingsLoading}
          bookingsError={bookingsError}
          bookingsUpdatedAt={bookingsUpdatedAt}
          onRefreshBookings={refreshBookings}
          onClose={() => setSelectedProduct(null)}
          onSubmit={handleBookingSubmit}
          onSuccess={handleBookingSuccess}
          language={language}
          t={t}
        />
      ) : null}
      {showBookingSuccess ? (
        <BookingSuccess key={bookingSuccessId} message={t.booking.success} />
      ) : null}
    </>
  )
}

export default App

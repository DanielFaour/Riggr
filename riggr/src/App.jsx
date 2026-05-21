import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBooking, getBookings, getProducts } from './api/riggrApi'
import BookingModal from './components/BookingModal'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import InfoSection from './components/InfoSection'
import ProductGrid from './components/ProductGrid'

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

  const activeProducts = useMemo(
    () => products.filter((product) => String(product.active).toLowerCase() === 'true'),
    [products],
  )

  const refreshBookings = useCallback(async () => {
    setBookingsLoading(true)
    setBookingsError('')

    try {
      const bookingsResponse = await getBookings()
      setBookings(bookingsResponse)
      setBookingsUpdatedAt(new Date())
    } catch (requestError) {
      setBookingsError(requestError.message)
    } finally {
      setBookingsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialProducts() {
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

  const handleBookingSubmit = async ({
    bookingItems,
    isStudentAssociation,
    selectedProductNames,
    ...bookingData
  }) => {
    const orderId = createOrderId()
    const selectedProductsMessage = `Valgte produkter: ${selectedProductNames.join(', ')}`
    const studentAssociationMessage = isStudentAssociation
      ? 'Studentforening: ja'
      : 'Studentforening: nei'
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

  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductGrid
          products={activeProducts}
          isLoading={productsLoading}
          error={productsError}
          onRequestProduct={handleRequestProduct}
        />
        <HowItWorks />
        <InfoSection />
      </main>
      <Footer />
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
        />
      ) : null}
    </>
  )
}

export default App

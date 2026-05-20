import { useCallback, useEffect, useMemo, useState } from 'react'
import { createBooking, getBookings, getProducts } from './api/riggrApi'
import BookingModal from './components/BookingModal'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import ProductGrid from './components/ProductGrid'

function App() {
  const [products, setProducts] = useState([])
  const [bookings, setBookings] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productsLoading, setProductsLoading] = useState(true)
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [bookingsError, setBookingsError] = useState('')

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

  const handleBookingSubmit = async (bookingData) => {
    await createBooking(bookingData)
    await refreshBookings()
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
          onRequestProduct={setSelectedProduct}
        />
        <HowItWorks />
      </main>
      <Footer />
      {selectedProduct ? (
        <BookingModal
          product={selectedProduct}
          bookings={bookings}
          bookingsLoading={bookingsLoading}
          bookingsError={bookingsError}
          onClose={() => setSelectedProduct(null)}
          onSubmit={handleBookingSubmit}
        />
      ) : null}
    </>
  )
}

export default App

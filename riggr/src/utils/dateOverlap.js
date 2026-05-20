import { parseDateOnly } from './dateValue'

const UNAVAILABLE_STATUSES = ['pending', 'confirmed']

function getTodayDateOnly() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function doesDateRangeOverlap(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) {
    return false
  }

  const rangeStartA = parseDateOnly(startA)
  const rangeEndA = parseDateOnly(endA)
  const rangeStartB = parseDateOnly(startB)
  const rangeEndB = parseDateOnly(endB)

  if (!rangeStartA || !rangeEndA || !rangeStartB || !rangeEndB) {
    return false
  }

  return rangeStartA <= rangeEndB && rangeStartB <= rangeEndA
}

export function getUnavailableBookingsForProduct(bookings, productId) {
  const today = getTodayDateOnly()

  return bookings.filter(
    (booking) => {
      const bookingEndDate = parseDateOnly(booking.endDate)

      return (
        booking.productId === productId &&
        UNAVAILABLE_STATUSES.includes(String(booking.status).toLowerCase()) &&
        bookingEndDate &&
        bookingEndDate >= today
      )
    },
  )
}

import { parseDateOnly } from './dateValue'

const WEEKEND_FEE = 50
const DAY_IN_MS = 24 * 60 * 60 * 1000

function getInclusiveDayCount(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) {
    return 0
  }

  return Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS) + 1
}

function getWeekendDayCount(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) {
    return 0
  }

  let weekendDayCount = 0

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const day = date.getDay()

    if (day === 0 || day === 5 || day === 6) {
      weekendDayCount += 1
    }
  }

  return weekendDayCount
}

export function calculateEstimatedBookingPrice({
  products,
  startDate,
  endDate,
  isStudentAssociation,
}) {
  const parsedStartDate = parseDateOnly(startDate)
  const parsedEndDate = parseDateOnly(endDate)
  const dayCount = getInclusiveDayCount(parsedStartDate, parsedEndDate)

  if (dayCount === 0) {
    return {
      dayCount: 0,
      basePrice: 0,
      weekendFee: 0,
      weekendDayCount: 0,
      total: 0,
      hasValidDates: false,
      includesWeekend: false,
    }
  }

  const pricePerDay = products.reduce((sum, product) => {
    const price = Number(product.pricePerDay)
    return Number.isFinite(price) ? sum + price : sum
  }, 0)
  const weekendDayCount = getWeekendDayCount(parsedStartDate, parsedEndDate)
  const weekendFee =
    weekendDayCount > 0 && !isStudentAssociation
      ? WEEKEND_FEE * products.length * weekendDayCount
      : 0
  const basePrice = pricePerDay * dayCount

  return {
    dayCount,
    basePrice,
    weekendFee,
    weekendDayCount,
    total: basePrice + weekendFee,
    hasValidDates: true,
    includesWeekend: weekendDayCount > 0,
  }
}

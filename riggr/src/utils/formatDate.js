import { parseDateOnly } from './dateValue'

export function formatDate(dateString) {
  const date = parseDateOnly(dateString)

  if (!date) {
    return 'Ukjent dato'
  }

  return new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatPrice(price) {
  const numberPrice = Number(price)

  if (!Number.isFinite(numberPrice)) {
    return 'Pris på forespørsel'
  }

  return `${numberPrice.toLocaleString('nb-NO')} kr / dag`
}

export function formatCurrency(price) {
  const numberPrice = Number(price)

  if (!Number.isFinite(numberPrice)) {
    return 'Pris på forespørsel'
  }

  return `${numberPrice.toLocaleString('nb-NO')} kr`
}

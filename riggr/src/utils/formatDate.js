import { parseDateOnly } from './dateValue'

const localeByLanguage = {
  no: 'nb-NO',
  en: 'en-GB',
}

function getLocale(language = 'no') {
  return localeByLanguage[language] || localeByLanguage.no
}

export function formatDate(dateString, language = 'no', t) {
  const date = parseDateOnly(dateString)

  if (!date) {
    return t?.format?.unknownDate || 'Ukjent dato'
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatPrice(price, language = 'no', t) {
  const numberPrice = Number(price)

  if (!Number.isFinite(numberPrice)) {
    return t?.format?.priceOnRequest || 'Pris på forespørsel'
  }

  const formattedPrice = numberPrice.toLocaleString(getLocale(language))
  return t?.format?.pricePerDay
    ? t.format.pricePerDay(formattedPrice)
    : `${formattedPrice} kr / dag`
}

export function formatCurrency(price, language = 'no', t) {
  const numberPrice = Number(price)

  if (!Number.isFinite(numberPrice)) {
    return t?.format?.priceOnRequest || 'Pris på forespørsel'
  }

  const formattedPrice = numberPrice.toLocaleString(getLocale(language))
  return t?.format?.currency ? t.format.currency(formattedPrice) : `${formattedPrice} kr`
}

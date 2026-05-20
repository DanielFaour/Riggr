function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function toDateKey(date) {
  if (!Number.isFinite(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())

  return `${year}-${month}-${day}`
}

export function normalizeDateString(value) {
  if (!value) {
    return ''
  }

  const rawValue = String(value).trim()

  if (!rawValue) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue
  }

  const norwegianDateMatch = rawValue.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)

  if (norwegianDateMatch) {
    const [, day, month, year] = norwegianDateMatch
    return `${year}-${padDatePart(month)}-${padDatePart(day)}`
  }

  return toDateKey(new Date(rawValue))
}

export function parseDateOnly(value) {
  const normalizedDate = normalizeDateString(value)

  if (!normalizedDate) {
    return null
  }

  const date = new Date(`${normalizedDate}T00:00:00`)

  return Number.isFinite(date.getTime()) ? date : null
}

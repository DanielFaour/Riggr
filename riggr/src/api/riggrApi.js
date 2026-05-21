const API_URL = import.meta.env.VITE_RIGGR_API_URL

function getApiUrl() {
  if (!API_URL) {
    throw new Error('Mangler VITE_RIGGR_API_URL. Legg til Apps Script Web App URL i .env.')
  }

  return API_URL
}

async function requestJson(url, options) {
  let response

  try {
    response = await fetch(url, options)
  } catch {
    throw new Error('Kunne ikke kontakte Riggr API. Sjekk nettverk og Apps Script URL.')
  }

  if (!response.ok) {
    throw new Error(`Riggr API svarte med status ${response.status}.`)
  }

  try {
    return await response.json()
  } catch {
    throw new Error('Riggr API returnerte et ugyldig svar.')
  }
}

function buildActionUrl(action) {
  const url = new URL(getApiUrl())
  url.searchParams.set('action', action)
  return url.toString()
}

export async function getProducts() {
  const data = await requestJson(buildActionUrl('products'))
  return Array.isArray(data.products) ? data.products : []
}

export async function getBookings() {
  const data = await requestJson(buildActionUrl('bookings'))
  return Array.isArray(data.bookings) ? data.bookings : []
}

export async function createBooking(bookingData) {
  const payload = {
    action: 'createBooking',
    ...bookingData,
  }

  const data = await requestJson(getApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  if (!data.success) {
    throw new Error('Forespørselen ble ikke lagret. Prøv igjen litt senere.')
  }

  return data
}

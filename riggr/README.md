# Riggr

Riggr er en enkel rental-nettside for høyttalere og eventutstyr i Oslo. Brukere ser aktive produkter, sjekker utilgjengelige datoer og sender en bookingforespørsel som lagres i Google Sheets.

## Tech stack

- React
- Vite
- Plain CSS
- Google Sheets som database
- Google Apps Script Web App som API

Ingen Firebase, Supabase, Express, Next.js, betaling, innlogging eller brukerkontoer.

## Google Sheets struktur

Google Sheet-et har to faner.

### Products

| id | name | category | description | pricePerDay | imageUrl | active |
| --- | --- | --- | --- | --- | --- | --- |

`active` må være `true` for at produktet skal vises i katalogen.

### Bookings

| id | productId | name | email | phone | startDate | endDate | message | status | createdAt |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Gyldige statuser:

- `pending`
- `confirmed`
- `declined`

Bookinger med `pending` og `confirmed` blokkerer valgte datoer. `declined` ignoreres i tilgjengelighetssjekken.

## Konfigurer miljøvariabler

Lag en lokal `.env` basert på `.env.example`:

```bash
VITE_RIGGR_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Verdien skal være den deployede Google Apps Script Web App URL-en.

## Kjør lokalt

```bash
npm install
npm run dev
```

## Bookingflyt

Frontend henter produkter fra:

```text
GET {VITE_RIGGR_API_URL}?action=products
```

Frontend henter bookinger fra:

```text
GET {VITE_RIGGR_API_URL}?action=bookings
```

Når en bruker sender forespørsel, postes bookingdata til Apps Script:

```text
POST {VITE_RIGGR_API_URL}
```

Bookingen lagres manuelt i Google Sheets med status `pending`. Etter innsending får brukeren beskjed om at forespørselen må bekreftes manuelt, og frontend henter bookinger på nytt slik at tilgjengeligheten oppdateres.

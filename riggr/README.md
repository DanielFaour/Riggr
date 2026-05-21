# Riggr

Riggr er en enkel rental-nettside for hoyttalere og eventutstyr i Oslo. Brukere ser aktive produkter, sjekker utilgjengelige datoer og sender en bookingforesporsel som lagres i Google Sheets.

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

`active` ma vaere `true` for at produktet skal vises i katalogen.

### Bookings

| id | orderId | productId | name | email | phone | startDate | endDate | message | status | createdAt | estPrice |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Gyldige statuser:

- `pending`
- `confirmed`
- `declined`

Bookinger med `pending` og `confirmed` blokkerer valgte datoer. `declined` ignoreres i tilgjengelighetssjekken.

## Konfigurer miljo

Lag en lokal `.env` basert pa `.env.example`:

```bash
VITE_RIGGR_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Verdien skal vaere den deployede Google Apps Script Web App URL-en.

## Kjor lokalt

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

Nar en bruker sender foresporsel, postes bookingdata til Apps Script:

```text
POST {VITE_RIGGR_API_URL}
```

Bookingen lagres manuelt i Google Sheets med status `pending`. Etter innsending far brukeren beskjed om at foresporselen ma bekreftes manuelt, og frontend henter bookinger pa nytt slik at tilgjengeligheten oppdateres.

`orderId` er felles for alle bookingrader i samme foresporsel. Hvis en kunde velger flere produkter, lagres det fortsatt en rad per produkt, men radene kan grupperes pa samme `orderId`.

`estPrice` sendes med som estimert pris for bookingraden. Estimatet regnes fra dagspris, antall valgte dager og eventuelt helgetillegg pa 50 kr per produkt per helgedag fredag-sondag. Studentforeninger kan markeres i skjemaet, og da fjernes helgetillegget fra estimatet.

# PrimeVault — MERN Premium Subscription Store

Fully automated premium-account store with **two separate portals**:

- **User portal** — browse plans, pick duration, cart, checkout, automatic delivery of account credentials, order history.
- **Admin portal** — separate login (role-gated), dashboard stats, product management, account-stock upload, order management.

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite, React Router, Axios, Context API |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (httpOnly-ready bearer tokens) + bcrypt, role-based (`user` / `admin`) |
| i18n | 8 languages with RTL support (Urdu, Arabic) |

## Quick start

```bash
# 1. Backend
cd server
cp .env.example .env         # set MONGO_URI + JWT_SECRET
npm install
npm run seed                 # creates admin user, products, demo stock
npm run dev                  # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                  # http://localhost:5173
```

### Default admin
```
email:    admin@primevault.pk
password: admin123
```
Change it immediately in production.

## Portals
- User site: `/`
- Admin portal: `/admin` (separate login screen, blocked unless `role === 'admin'`)

## Automatic delivery
When an order is paid, `orderController.payOrder` pulls unused `Account` documents from the
stock pool inside a MongoDB transaction, marks them `assigned`, and returns the credentials to
the buyer. No manual screenshots, no WhatsApp waiting.

## Payment gateways
`server/src/services/payments.js` is a provider-agnostic adapter. Plug in a Pakistani
aggregator (PayFast / Safepay / bSecure) for JazzCash, EasyPaisa and card payments — the rest of
the flow needs no changes.

## Folder layout
```
server/   Express API, Mongoose models, JWT auth, seed script
client/   React app: user portal (src/pages) + admin portal (src/admin)
```

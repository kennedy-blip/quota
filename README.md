# QuotaPulse

QuotaPulse is a Vite + React + TypeScript usage-metering dashboard with Vercel Serverless API routes.

## Local development

- `npm install`
- `npm run dev` for the Vite frontend (API requests use the demo fallback)
- `npm run vercel:dev` to run frontend and `/api` functions together
- `npm run build` to run TypeScript checks and create the production bundle

## API

- `GET /api/usage` — tenant ledger, quota balances and usage events
- `POST /api/usage` — `{ tenantId, meterKey, units, unitCost? }`
- `PATCH /api/usage` — `{ tenantId, tier }`
- `GET /api/tiers` — tier definitions
- `POST /api/tiers` — `{ units }` monthly cost projections

## Deploy to Vercel

Import `kennedy-blip/quota` as a Vite project. Vercel uses `npm run build`.

## Important persistence note

The API store is an in-memory demo ledger seeded with sample tenants. Vercel functions are stateless/ephemeral and may run in parallel, so this store is not durable or safe for production billing. Before charging real customers, replace `api/_store.ts` with a transactional database, enforce tenant authentication, add idempotency keys, and reconcile invoices from immutable records. The reset button is a frontend demo action.

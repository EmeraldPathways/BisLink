# YBIAL — Backend Implementation Instructions
## For AI Coding Agent

---

## Context

You are implementing the backend for **Your Business in a Link** — a SaaS booking platform for service businesses. The codebase uses Next.js 14 App Router, TypeScript, Supabase (PostgreSQL + RLS), and Stripe Connect.

The files in this package are **complete and correct**. Your job is to place them in the right locations, run the migrations, and wire the environment variables. Do not rewrite the logic. If something looks wrong, flag it — don't silently change it.

---

## Step 1 — Run the database migration

In the Supabase dashboard SQL editor (or via Supabase CLI), run:

```
supabase/migrations/001_orders_products_reviews.sql
```

This creates:
- `products` table with a 10-product-per-business trigger
- `reviews` table
- `orders` table with `payment_intent_id UNIQUE` for idempotency
- New columns on `businesses` table for the About and Contact tabs
- `increment_customer_stats` RPC function

Run it once. If any table already exists, comment out that block and re-run.

---

## Step 2 — Place the Next.js API routes

Copy these files into your Next.js project exactly as shown:

| File | Destination |
|------|-------------|
| `app/api/bookings/route.ts` | `app/api/bookings/route.ts` |
| `app/api/checkout/route.ts` | `app/api/checkout/route.ts` |
| `app/api/stripe/webhook/route.ts` | `app/api/stripe/webhook/route.ts` |
| `app/api/contact/route.ts` | `app/api/contact/route.ts` |

If any of these routes already exist in your project, **replace them entirely** — do not merge.

---

## Step 3 — Install dependencies

In your Next.js project root:

```bash
npm install stripe zod @supabase/supabase-js resend
```

These may already be installed. Running install again is safe.

---

## Step 4 — Add environment variables

Add these to `.env.local` in the Next.js project root. Do not overwrite existing values — only add the ones that are missing:

```bash
# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Cloud Function URLs (fill in after deploying functions)
BOOKING_LIFECYCLE_FUNCTION_URL=
ORDER_LIFECYCLE_FUNCTION_URL=
GOOGLE_CLOUD_FUNCTION_TOKEN=
```

---

## Step 5 — Deploy the Cloud Functions

Navigate to the `functions/` directory.

Install dependencies:
```bash
cd functions
npm install
```

Deploy all three functions:
```bash
npm run deploy:booking-lifecycle
npm run deploy:reminder-dispatcher
npm run deploy:order-lifecycle
```

Each function needs these environment variables set in Google Cloud Console
(**Cloud Functions → select function → Edit → Variables & Secrets**):

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
EMAIL_FROM
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
APP_URL
REVIEW_TOKEN_SECRET   ← generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`booking-lifecycle` also needs:
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

After deploying, copy each function's trigger URL into your Next.js `.env.local`:
- `BOOKING_LIFECYCLE_FUNCTION_URL` = booking-lifecycle trigger URL
- `ORDER_LIFECYCLE_FUNCTION_URL` = order-lifecycle trigger URL

---

## Step 6 — Set up Cloud Scheduler for reminders

In Google Cloud Console → Cloud Scheduler → Create job:

| Field | Value |
|-------|-------|
| Name | `reminder-cron` |
| Frequency | `*/15 * * * *` |
| Timezone | UTC |
| Target type | HTTP |
| URL | reminder-dispatcher trigger URL |
| HTTP method | POST |
| Auth header | OIDC token |
| Service account | Default compute service account |

This runs every 15 minutes and dispatches any pending 24h reminders, 1h reminders, and follow-up emails.

---

## Step 7 — Register the Stripe webhook

In Stripe Dashboard → Developers → Webhooks → Add endpoint:

- **URL:** `https://yourdomain.com/api/stripe/webhook`
- **Events to listen for:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `account.updated`

Copy the signing secret → paste into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

For local development, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
The CLI prints a webhook secret — use that for local `.env.local`.

---

## Step 8 — Verify the `createClient` import

The API routes import `createClient` from `@/lib/supabase/server`. Verify this file exists in your project and exports a server-side Supabase client using the service role key for admin operations, or the anon key for RLS-protected operations.

If the import path is different in your project, update it in all four route files.

---

## What each file does

### `app/api/bookings/route.ts`
`POST` — Creates a booking and Stripe PaymentIntent. Called by the frontend booking sheet on Step 4 (Payment). Returns `{ bookingId, clientSecret }`. The frontend uses `clientSecret` to confirm payment with Stripe Elements.

### `app/api/checkout/route.ts`
`POST` — Creates a Stripe PaymentIntent for a product cart. Called by the frontend cart when customer taps checkout. Returns `{ clientSecret, total }`.

### `app/api/stripe/webhook/route.ts`
`POST` — Receives Stripe webhook events. Routes `payment_intent.succeeded` to either booking confirmation or product order handling depending on `metadata.type`. Fires Cloud Functions asynchronously.

### `app/api/contact/route.ts`
`POST` — Forwards a contact form message to the business owner's email via Resend. Called by the Contact tab form on the public page.

### `functions/booking-lifecycle/index.ts`
Cloud Function — Triggered by the webhook after a booking payment succeeds. Sends confirmation email to customer. Creates Google Calendar event for the owner. Updates `confirmation_sent` and `google_event_id` on the booking.

### `functions/reminder-dispatcher/index.ts`
Cloud Function — Triggered every 15 minutes by Cloud Scheduler. Sends 24h reminders, 1h reminders, and post-appointment follow-up/review request emails. Each email type is independent — one failing doesn't block the others.

### `functions/order-lifecycle/index.ts`
Cloud Function — Triggered by the webhook after a product order payment succeeds. Inserts an order record and sends an order confirmation email to the customer.

### `supabase/migrations/001_orders_products_reviews.sql`
Database migration — Creates the `products`, `reviews`, and `orders` tables, adds new columns to `businesses`, and creates the `increment_customer_stats` RPC.

---

## Important constraints — do not change these

1. `application_fee_amount` is `0` on all Stripe PaymentIntents. This is intentional for v1.
2. All money is in **cents** (integers). Never convert to floats in the database or API.
3. The webhook returns `200` for all unhandled Stripe event types. Do not change this.
4. Cloud Functions are called fire-and-forget from the webhook. The webhook must return in under 30 seconds.
5. `SUPABASE_SERVICE_ROLE_KEY` is used in Cloud Functions only — never in the Next.js client or browser.
6. The `orders` table uses `payment_intent_id UNIQUE` as its idempotency key. Do not remove this constraint.
7. The 10-product limit is enforced by both the Postgres trigger and the API. Both must stay in place.

---

## Testing checklist

Once everything is deployed, verify this end-to-end flow:

- [ ] `POST /api/bookings` returns `{ bookingId, clientSecret }` for a valid request
- [ ] `POST /api/bookings` returns `409` if the slot is already booked
- [ ] Stripe test payment triggers `payment_intent.succeeded` webhook
- [ ] Webhook updates booking `status` to `confirmed`
- [ ] `booking-lifecycle` function sends confirmation email
- [ ] `booking-lifecycle` function creates Google Calendar event (if owner has connected)
- [ ] `reminder-dispatcher` function sends 24h reminder when invoked
- [ ] `POST /api/checkout` returns `{ clientSecret, total }` for a valid cart
- [ ] Product order payment triggers order confirmation email
- [ ] `POST /api/contact` sends email to business owner
- [ ] Out-of-stock product returns `409` from `/api/checkout`

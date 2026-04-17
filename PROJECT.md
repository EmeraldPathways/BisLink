# Your Business in a Link - Project Summary

## What This Project Is

A SaaS product that gives real-world service businesses such as personal trainers, salons, yoga instructors, and consultants a single shareable link like `yourbusinessinalink.com/studioeleven` that acts as their commercial presence: bookings, products, reviews, about page, and contact info.

Designed to be dropped into a TikTok or Instagram bio and convert cold social traffic into paying customers.

Closest competitors: Stan Store / Beacons.ai, except this product targets real-world service businesses with scheduling and operational complexity.

Pricing model: flat subscription, no per-booking fees.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| UI Components | shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google OAuth + email magic link) |
| Realtime | Supabase Realtime |
| File Storage | Supabase Storage |
| Serverless | Google Cloud Functions |
| Calendar Sync | Google Calendar API (Microsoft parity deferred) |
| Payments | Stripe + Stripe Connect Express |
| Email | Resend |
| Hosting | Vercel |
| DNS/CDN | Cloudflare |
| Animations | Framer Motion |

---

## Design System

### Fonts
- Display/headings: Cormorant Garamond (400, 600)
- UI/body: DM Sans (300, 400, 500, 600)

### CSS Variables (`app/globals.css`)
All canonical variables use the `--color-*` prefix. Shorthand aliases are also defined for compatibility.

| Token | Value | Usage |
|---|---|---|
| `--color-void` | `#0C0B09` | Hero/dark backgrounds |
| `--color-gold` | `#C9A45C` | Primary accent |
| `--color-gold-dark` | `#8B6B1A` | Accent gradient end |
| `--color-gold-muted` | `#F2EDE3` | Chips / credential pills |
| `--color-bg` | `#FAFAF8` | App background |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-surface-2` | `#F7F4EF` | Summary boxes |
| `--color-surface-3` | `#F4F4F2` | Light surface |
| `--color-border` | `#EBEBEB` | Default borders |
| `--color-border-dark` | `#2E2A26` | Hero divider |
| `--color-text-hero` | `#F7F3ED` | Primary text on dark hero |
| `--color-text-hero-2` | `#9E9890` | Secondary text on dark hero |
| `--color-text-hero-3` | `#666666` | Tertiary text on dark hero |
| `--color-text-primary` | `#111111` | Primary body text |
| `--color-text-secondary` | `#888888` | Secondary body text |
| `--color-text-tertiary` | `#AAAAAA` | Hints/placeholders |
| `--color-success` | `#4ADE80` | Live availability dot |

### Hero Section
Dark gradient: `linear-gradient(165deg, #0C0B09 0%, #1C1610 55%, #0F0D0B 100%)` with radial gold glow accents and staggered motion on load.

---

## Directory Structure

```text
app/
  layout.tsx                    Root layout with globals.css
  page.tsx                      Landing/marketing page
  globals.css                   Design tokens + CSS variable aliases
  [slug]/page.tsx               Live public business page by slug
  demo/page.tsx                 Explicit public demo/showcase route
  (auth)/
    callback/                   Supabase auth code exchange + post-auth redirect
    login/                      Owner sign-in page
    signup/                     Dedicated owner sign-up page
  (dashboard)/
    dashboard/                  Today view - live bookings + stats
    calendar/                   Weekly calendar grid
    services/                   Add/edit/reorder services
    products/                   Add/edit/reorder products (max 10)
    availability/               Working hours + blocked times
    customers/                  CRM - booking history, spend, order activity
    reviews/                    Review moderation + visibility
    link/                       Customise public page bio/about/contact
    payouts/                    Stripe Connect + revenue chart + recent orders
  (onboarding)/onboarding/      5-step onboarding wizard
  admin/
    login/                      Internal admin login
    (console)/                  Super-admin console
  api/
    owner/                      Live owner mutations
    admin/                      Safe super-admin actions
    availability/               Live slot generation for public booking flow
    bookings/                   Booking intent creation + booking status polling
    contact/                    Public contact form submission
    orders/                     Product order intent creation
    reviews/                    Public review submission
    stripe/webhook/             Stripe source-of-truth payment completion
    calendar/                   Google connect/callback/sync routes

components/
  auth/
    LoginForm.tsx               Client sign-in form
    SignupForm.tsx              Client sign-up form
  public/
    PublicPage.tsx              Main wrapper
    HeroSection.tsx             Dark hero with avatar, name, bio, rating, location
    TabBar.tsx                  5-tab navigation bar
    tabs/
      BookingsTab.tsx           Service list
      ProductsTab.tsx           Product grid + filters
      ReviewsTab.tsx            Rating summary + review cards
      AboutTab.tsx              Bio, stats, credentials, specialisms
      ContactTab.tsx            Contact rows, form, location card
    sheets/
      CartSheet.tsx             Product cart + checkout
      ProductSheet.tsx          Product detail sheet
  booking/
    BookingPage.tsx             Booking wrapper
    BookingSheet.tsx            Multi-step booking bottom sheet
    StepDate.tsx / StepTime.tsx / StepDetails.tsx / StepPayment.tsx / StepConfirm.tsx
  dashboard/
    CustomersList.tsx           Search/filter/sort customer UI
  payments/
    EmbeddedPaymentForm.tsx     Shared Stripe Payment Element wrapper

hooks/
  useCart.ts
  useProducts.ts
  useAvailability.ts
  useBookings.ts
  useBusiness.ts

lib/
  demo-data.ts                  Demo dataset for explicit demo route
  public-page-data.ts           Live public page read model
  dashboard-data.ts             Live owner dashboard read model
  admin-console-data.ts         Live internal admin console read model
  auth-redirect.ts              Shared post-auth redirect resolver
  owner.ts / owner-api.ts       Owner auth + business resolution
  admin.ts / admin-api.ts       Internal admin auth helpers
  rate-limit.ts                 Basic public POST abuse protection
  stripe/browser.ts             Stripe.js client loader

functions/
  booking-lifecycle/            Booking side effects
  order-lifecycle/              Order side effects
  reminder-dispatcher/          Reminder / follow-up dispatch

types/index.ts                  Application types
supabase/                       DB migrations and schema
emails/                         Email templates
ybial-agents/                   AI agent layer
```

---

## Public Page - 5-Tab System

Tab bar sits at the bottom of the dark hero. Default active tab: `bookings`.

| Tab | Content |
|---|---|
| Bookings | Service cards -> booking sheet |
| Products | Product grid, category filters, cart sheet, product detail sheet |
| Reviews | Rating summary + review cards |
| About | Profile card, stats, bio, credentials, specialisms |
| Contact | Contact rows, message form, location card |

---

## Database Schema

All monetary values are stored in cents. Row Level Security is enabled.

| Table | Purpose |
|---|---|
| `businesses` | Core profile, slug, Stripe/calendar tokens, contact fields |
| `services` | Bookable services |
| `availability` | Working hours per day of week |
| `blocked_times` | Manual time-off blocks |
| `bookings` | Customer bookings with payment and reminder status |
| `customers` | CRM built from booking/order history |
| `products` | Up to 10 products per business |
| `orders` | Product purchases persisted from Stripe payment intents |
| `reviews` | Customer reviews linked to bookings |
| `credentials` | Public credentials list |
| `specialisms` | Public specialisms list |

### Important lifecycle / integrity columns

```sql
bookings.confirmation_sent BOOLEAN
bookings.reminder_24h_sent BOOLEAN
bookings.reminder_1h_sent BOOLEAN
bookings.followup_sent BOOLEAN
bookings.google_event_id TEXT
orders.confirmation_sent BOOLEAN
reviews.booking_id UNIQUE WHERE booking_id IS NOT NULL
```

---

## Live Routes and APIs

```text
GET    /signup                           Dedicated owner sign-up page
GET    /login                            Dedicated owner sign-in page
GET    /callback                         Supabase auth callback and code exchange
GET    /onboarding                       Auth-aware onboarding entry
GET    /dashboard                        Owner dashboard shell
GET    /demo                             Explicit Studio Eleven demo route
GET    /[slug]                           Live public business page by slug

GET    /admin                            Internal admin overview
GET    /admin/businesses                 Internal business list + drilldown
GET    /admin/support                    Internal support / moderation
GET    /admin/finance                    Internal finance view
GET    /admin/agents                     Internal agent diagnostics
GET    /admin/settings                   Internal environment / integration visibility

PATCH  /api/owner/business               Update owner business/profile settings
POST   /api/owner/services               Create owner service
PATCH  /api/owner/services/[id]          Update/toggle owner service
POST   /api/owner/products               Create owner product
PATCH  /api/owner/products/[id]          Update/toggle owner product
PUT    /api/owner/availability           Replace owner weekly availability
POST   /api/owner/blocked-times          Create blocked time
DELETE /api/owner/blocked-times/[id]     Remove blocked time
PATCH  /api/owner/reviews/[id]           Toggle owner review visibility
PUT    /api/owner/onboarding             Persist onboarding business/services/availability

PATCH  /api/admin/businesses/[id]/status         Activate/deactivate business
POST   /api/admin/businesses/[id]/stripe-connect Reopen or generate Stripe onboarding link
PATCH  /api/admin/reviews/[id]                   Moderate review visibility
GET    /api/admin/agents/diagnostics            Fetch internal diagnostics summary

GET    /api/availability                 Live slot generation by business/service/date
GET    /api/bookings/[id]                Poll booking payment/confirmation status
POST   /api/bookings                     Create booking + PaymentIntent
POST   /api/orders                       Create order + PaymentIntent
POST   /api/contact                      Public contact form submission
POST   /api/reviews                      Public review submission
POST   /api/stripe/webhook               Stripe payment completion source of truth
GET    /api/calendar/google              Start Google Calendar OAuth
GET    /api/calendar/google/callback     Persist Google Calendar tokens
GET|POST /api/calendar/sync              Sync booking to Google Calendar
```

---

## Key Business Logic

- Slot availability is generated from `availability`, minus overlapping `bookings` and `blocked_times`, accounting for service duration + buffer time.
- Stripe Payment Element is used for bookings and product checkout. Stripe webhooks remain the source of truth for completion.
- Booking confirmation flow: `payment_intent.succeeded` -> confirm booking -> trigger booking lifecycle -> send confirmation email and create Google Calendar event idempotently.
- Order confirmation flow: `payment_intent.succeeded` -> trigger order lifecycle -> persist order exactly once from `payment_intent_id` and send one confirmation email.
- Reminder flow: 24h and 1h reminders are tracked with `reminder_24h_sent` and `reminder_1h_sent`.
- Review collection flow: follow-up email after the appointment includes a review token link, with one review allowed per booking.
- 10-product limit is enforced by both Postgres trigger and API logic.
- Basic rate limiting is applied to booking, order, contact, and review POST routes.

---

## Auth and Onboarding Flow

### Public auth entrypoints

- `/signup` is the dedicated new-owner account creation page.
- `/login` is the dedicated returning-owner sign-in page.
- Homepage CTA flow:
  - `Sign Up` -> `/signup`
  - `Sign In to Owner Dashboard` -> `/login`
  - `View Demo Link` -> `/demo`

### Post-auth routing

- Auth callback exchanges the Supabase code and resolves the destination server-side.
- Admin users are redirected to `/admin`.
- Authenticated owners with no business row are redirected to `/onboarding`.
- Authenticated owners with a business row are redirected to `/dashboard`.
- Authenticated users are redirected away from `/login` and `/signup`.

### Onboarding wizard

1. Business name, category, bio, location, slug
2. First services
3. Weekly availability
4. Stripe Connect onboarding or skip
5. Success screen with live link + dashboard handoff

Products and most About-page enrichment are completed later from the owner dashboard.

---

## Admin Console

The app includes a real internal super-admin console under `/admin`.

- `/admin/login` is protected separately from owner auth.
- `/admin/(console)` exposes:
  - overview
  - businesses list + business detail
  - support / moderation
  - finance
  - agents diagnostics
  - settings / environment status
- Safe actions include:
  - activate/deactivate business
  - reopen Stripe onboarding
  - moderate review visibility
  - inspect owner/business operational state

---

## Git Branches

| Branch | Purpose |
|---|---|
| `main` | Production base |
| `tabs-update` | 5-tab public page system |
| `ui-fixes` | Public page visual fixes and mobile polish |
| `backend-merged` | Backend/schema consolidation work |
| `owner-dashboard-update` | Live owner dashboard reads + owner mutation wiring |
| `admin-dash-update` | Internal admin console, diagnostics, finance, support, and moderation views |
| `public-data` | Public live-data migration workstream |

---

## Current Product Status

The app is now mostly live across owner, public, and payment-critical flows.

### Live now

- owner auth (`/signup`, `/login`, `/callback`) with server-side post-auth routing
- auth-aware onboarding
- live public `/[slug]` page via `getPublicBusinessPageBySlug(slug)`
- explicit `/demo` route for showcase/demo use
- live availability resolution from services, availability, blocked times, bookings, and business timezone
- public booking checkout using Stripe Payment Element and booking-status polling
- public product checkout using Stripe Payment Element
- public contact form submission
- public review submission with duplicate protection
- owner dashboard reads across bookings, customers, services, products, reviews, availability, link settings, and payouts
- owner mutations for services, products, availability, blocked times, review visibility, and business profile updates
- Stripe Connect onboarding for owners
- internal admin console backed by live Supabase, Stripe, and diagnostics
- booking/order lifecycle processing with idempotent guards and structured logs
- Google Calendar token persistence and booking sync

### Still incomplete / highest remaining risk

- `npm run build` is still the main unresolved delivery blocker and needs reproducible clean-checkout behavior
- runtime diagnostics are present but still lightweight
- Google Calendar is productionized before Microsoft; Microsoft calendar remains deferred
- public/operator messaging around delayed lifecycle processing can still be improved

### Implication

The product is no longer mainly "demo plus dashboard". The next stage is release hardening and runtime reliability rather than another major public-data migration.

---

## Next Agent Handoff Plan

### Goal

Turn the current live product into a reproducible, release-ready system by closing the remaining build/runtime blocker and tightening diagnostics around integrations and async side effects.

### Priority Order

1. Build and runtime reproducibility
2. Integration diagnostics and failure visibility
3. Lifecycle observability and retry safety
4. Final operational UX cleanup

### 1. Build and Runtime Reproducibility

- Reproduce and fix the `npm run build` hang/failure from this synced workspace.
- Audit `.next` / trace / generated-artifact coupling and make builds reliable from a clean checkout.
- Keep `npm run typecheck`, `npm run lint`, and `npm run build` all green without relying on stale generated files.
- Confirm `tsconfig.json`, `.gitignore`, and any Next output assumptions do not require prior local state.

Acceptance:
- clean checkout
- `npm install`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- all succeed in the intended local environment

### 2. Integration Diagnostics and Failure Visibility

- Expand owner/admin diagnostics for:
  - Stripe keys + webhook secret
  - Supabase admin config
  - Resend sender + API key
  - Google OAuth config
  - lifecycle function URLs + shared auth token
- Show clearer status on owner-facing surfaces for:
  - calendar connected / reconnect needed
  - booking confirmation still processing
  - order confirmation pending
  - contact email unavailable
- Prefer deterministic status text over silent no-op behavior.

Acceptance:
- missing config is visible without checking server logs
- owner/admin users can tell whether failures are auth/config/runtime related

### 3. Lifecycle Observability and Retry Safety

- Audit booking and order lifecycle payload contracts end to end.
- Ensure retries do not duplicate:
  - confirmation emails
  - customer order stats
  - Google Calendar events
  - reminder/follow-up dispatch
- Add any missing structured log identifiers consistently:
  - `payment_intent_id`
  - `booking_id`
  - `order_id`
  - `business_id`
- Review reminder dispatcher behavior against real booking windows and failure cases.

Acceptance:
- replayed Stripe webhook does not duplicate downstream side effects
- replayed lifecycle function calls remain safe
- logs make it possible to trace one booking/order across webhook and lifecycle boundaries

### 4. Final Operational UX Cleanup

- Review owner settings vs public rendering one more time:
  - contact fields
  - maps/location
  - review visibility
  - product visibility / in-stock behavior
- Replace any remaining placeholder or dead owner/admin controls.
- Quarantine or remove clearly non-runtime legacy/demo modules that still create maintenance noise.

Acceptance:
- no production-facing control appears interactive while still being a stub
- public rendering matches owner toggles consistently

### Constraints / Assumptions

- Do not redesign the product surface in this phase.
- Do not expand scope into multi-staff, marketplace/discovery, loyalty, or customer accounts.
- Google Calendar is the only calendar integration to fully harden in this phase.
- Preserve the explicit `/demo` route for showcase/demo use rather than mixing demo logic into generic live routes.

---

## Explicitly Out of Scope for V1

Multiple staff, group bookings, packages/bundles/discount codes, TikTok/Meta native booking, marketplace/discovery, loyalty points, SMS (email only), product photo upload (emoji thumbnail only), Google Maps iframe embed, tab state in URL hash, customer accounts (guest checkout only), waitlist, FAQ tab.

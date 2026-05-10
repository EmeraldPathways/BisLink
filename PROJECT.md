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
| Framework | Next.js 16 App Router |
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
| Error Monitoring | Sentry |
| Hosting | Vercel |
| DNS/CDN | Cloudflare |
| Animations | Framer Motion |
| Linting/Formatting | ESLint 9 flat config + Biome |

---

## Design System

### Fonts
- Display/headings: Cormorant Garamond (400, 600)
- UI/body: DM Sans (300, 400, 500, 600)
- Theme-specific additions:
  - `wellness-studio`: Fraunces display with DM Sans UI
  - `bright-performance`: Space Grotesk display with Manrope UI

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

### Business Theme Presets

The public business page now supports three curated per-business presets driven by `businesses.theme_key`.

| Theme Key | Direction | Best Fit |
|---|---|---|
| `classic-luxe` | Existing dark luxe gold identity | Premium service brands and high-trust specialists |
| `wellness-studio` | Softer, warmer, calmer treatment | Massage, salons, beauty, hair, wellness |
| `bright-performance` | Brighter, cleaner, energetic contrast | Gyms, PTs, fitness, coaching |

Theme presets are resolved through `lib/business-themes.ts` and applied at the `PublicPage` container level so layout stays shared while colors, fonts, gradients, and surfaces change by business.

This feature depends on the `businesses.theme_key` column and its follow-up constraint expansion in `supabase/migrations/0010_business_theme_presets.sql` and `supabase/migrations/0014_expand_business_theme_constraint.sql`. Any new or drifted environment must have those schema changes applied for owner theme saves to work across all six presets.

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
    link/                       My Link editor for public-page content, contact, and link settings
      theme/                    Theme Settings page for presets, brand colour, and font pairing
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
    PublicPage.tsx              Shared live/demo public page shell with frame-aware overlays
    HeroSection.tsx             Public hero card with cover image, stronger announcement bar, compact profile row, social row, location, and CTA
    SectionImageHeader.tsx      Reusable image-led section header used by bookings, shop, and about
    MobileBottomNav.tsx         Shared fixed bottom navigation with stable Home / Book / Shop / About / More primary actions
    TabBar.tsx                  Legacy semantic section nav component retained in the repo but no longer mounted on the live public page
    tabs/
      BookingsTab.tsx           Editorial booking section with image header and service cards styled to match product cards
      ProductsTab.tsx           Product grid + filters + real product-image support + accessible product detail entry without an extra outer wrapper card
      ReviewsTab.tsx            Rating summary + review cards using shared review counts
      AboutTab.tsx              Image-led about section with story, stats, credentials, specialisms, and booking CTA
      ContactTab.tsx            Compact top-aligned contact form, editorial contact cards, and city-map style location card
    sheets/
      CartSheet.tsx             Product cart + checkout, demo-frame aware
      ProductSheet.tsx          Product detail sheet, demo-frame aware
  booking/
    BookingPage.tsx             Booking wrapper
    BookingSheet.tsx            Multi-step booking bottom sheet with labeled progress
    StepDate.tsx / StepTime.tsx / StepDetails.tsx / StepPayment.tsx / StepConfirm.tsx
  dashboard/
    MobileNav.tsx               Mobile bottom nav with More drawer for hidden dashboard routes
    MobileCalendar.tsx          Single-day mobile calendar
    CalendarView.tsx            Desktop weekly grid + mobile calendar switch
    CustomersList.tsx           Search/filter/sort customer UI
    Sidebar.tsx                 Desktop owner nav shell
    SidebarNav.tsx              Shared dashboard nav links
    StatsBar.tsx                Mobile 2x2 stat layout
    LinkEditor.tsx              Split owner editor for My Link content or Theme Settings controls
    LinkWorkspace.tsx           Shared owner editor + live public preview wrapper for `/link` and `/link/theme`
    ProductForm.tsx             Owner product create/edit form with product image upload and no owner emoji picker
    ServiceForm.tsx             Owner service create/edit form with service image upload and simplified fields
    ReviewsManager.tsx          Owner review moderation UI
  payments/
    EmbeddedPaymentForm.tsx     Shared Stripe Payment Element wrapper

scripts/
  run-next-build.cjs            Build wrapper for local Windows hardening
  windows-next-trace-workaround.cjs
                                Windows-only Next trace-file workaround for synced workspaces

hooks/
  useCart.ts
  useProducts.ts
  useAvailability.ts
  useBookings.ts
  useBusiness.ts
  useBreakpoint.ts             SSR-safe mobile breakpoint hook

lib/
  business-themes.ts            Theme preset registry + token maps
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

The shared public page powers both `/[slug]` and `/demo`. In demo mode, booking, product, and cart sheets render relative to the centered `max-w-[430px]` frame on desktop and fall back to full-viewport sheets on mobile.

Default active tab: `bookings`.

| Tab | Content |
|---|---|
| Bookings | Service cards -> booking sheet |
| Products | Product grid, category filters, cart sheet, product detail sheet |
| Reviews | Rating summary + review cards |
| About | Profile card, stats, bio, credentials, specialisms |
| Contact | Contact rows, message form, location card |

### Recent public-page improvements

- `/demo` now has route metadata and remains an explicit showcase route.
- Decorative hero glows are clipped internally so tab focus no longer shifts the hero horizontally.
- Review counts are derived from one shared summary source in `lib/reviews.ts` / `lib/demo-data.ts`.
- Product cards expose full descriptions accessibly and open a clearer detail flow.
- Public-page mobile layout now uses a full-width viewport treatment on small screens while preserving the centered card on desktop.
- The footer now renders at the `PublicPage` shell level so it appears consistently across all tabs.
- Reviews empty states now avoid misleading `0.0` / five-star presentation, support partial star fills, and use clearer zero-review CTA copy.
- About tab sections now hide empty content, avoid fake stats for new businesses, and present new profiles with cleaner fallback labels.
- Hero metadata no longer shows noisy "New profile" copy, and zero-review profiles no longer render an orphaned divider before the location.
- Hero presentation was rebuilt into a lighter editorial card with a cover image, avatar, single social-icon row, inline announcement bar directly below the hero image, review metadata, location row, and full-width CTA.
- Public navigation now reuses the same fixed bottom-menu component across mobile and desktop and keeps a stable Home / Book / Shop / About / More primary nav instead of switching section labels by state.
- Shared public-page sections now render with tighter spacing, smaller section titles, and centered dividers for a cleaner vertical rhythm.
- Contact form fields now use visible labels, inline validation, and a honeypot-backed submission payload.
- Contact delivery now resolves the business via the admin-capable lookup path, falls back to `business.email` when `contact_email` is blank, and surfaces explicit Resend send failures from `/api/contact`.
- Contact presentation now uses a reference-matched editorial two-column card layout, a compact top-aligned contact form, and a cleaner hierarchy for direct contact methods.
- Location presentation is now a theme-aware linked map card using a denser city-map style inline SVG background, centered Google Maps CTA, clearer address hierarchy, and parking-note support instead of duplicated placeholder address text.
- Booking sheet scrolling was hardened on mobile by switching the sheet panel to an explicit viewport-tied height so the date step remains scrollable inside the bottom sheet.
- Booking service cards were redesigned into taller editorial cards with icon treatment, larger title hierarchy, a time/price divider row, and a dedicated full-width booking CTA.
- Booking date selection was redesigned into a centered 7-column mobile calendar with month-only dates, tighter month controls, and a more reference-matched visual layout.
- Bookings, shop, and about sections now use reusable image-led section headers for stronger visual hierarchy on the public page.
- Product cards and product detail sheets now render uploaded product imagery, and service cards now mirror the product-card layout with a booking icon action.
- Owner dashboard service and product forms now support direct image uploads, with service images backed by `supabase/migrations/0015_service_images.sql`.
- Owner dashboard calendar hours now derive from live availability instead of a fixed 7 AM to 8 PM range, and the hour labels no longer shift incorrectly across timezones.
- Owner dashboard service editing now works with Next 16 async `searchParams`, services now support delete in the dashboard, and service create/edit no longer exposes emoji or tag fields.
- Owner dashboard product editing now uses the same async `searchParams` fix, products now support delete in the dashboard, and owner product/service cards no longer render emoji in the list view.
- Owner dashboard product creation/editing no longer exposes the emoji picker; products now fall back to a server-side default emoji instead.
- The live Supabase `services.image_url` column was applied directly to the linked project after drift was detected, restoring service-image persistence for owner uploads.
- Product cards now sit directly in the shop section grid without an extra outer container card.
- Empty portfolio placeholder cards no longer appear in the owner mobile preview when no active portfolio items exist.
- Public slug pages now render dynamically rather than serving a short-lived cached not-found state, so newly created businesses appear immediately after setup.
- Public styling is now theme-driven through `business.theme_key`, with six curated presets: `classic-luxe`, `wellness-studio`, `bright-performance`, `editorial-minimal`, `warm-studio`, and `dark-athletic`.
- Owner dashboard editing is now split across `/link` and `/link/theme`, with live public-page preview on both screens.
- Desktop `My Link` editing now uses a tabbed section menu with `Link Settings` first to reduce long-scroll editing.
- Desktop dashboard sidebar actions were regrouped so account controls and quick actions surface above the main nav.
- About tab story content now renders above stat cards instead of below them.

---

## Database Schema

All monetary values are stored in cents. Row Level Security is enabled.

| Table | Purpose |
|---|---|
| `businesses` | Core profile, slug, theme preset, Stripe/calendar tokens, contact fields |
| `services` | Bookable services |
| `availability` | Working hours per day of week |
| `blocked_times` | Manual time-off blocks |
| `bookings` | Customer bookings with payment and reminder status |
| `customers` | CRM built from booking/order history |
| `products` | Up to 10 products per business |
| `orders` | Product purchases persisted from Stripe payment intents |
| `reviews` | Customer reviews linked to bookings |
| `app_logs` | Server-side operational warnings/errors written via Supabase admin client |
| `credentials` | Public credentials list |
| `specialisms` | Public specialisms list |

### Important lifecycle / integrity columns

```sql
businesses.theme_key TEXT CHECK IN ('classic-luxe', 'wellness-studio', 'bright-performance')
bookings.confirmation_sent BOOLEAN
bookings.reminder_24h_sent BOOLEAN
bookings.reminder_1h_sent BOOLEAN
bookings.followup_sent BOOLEAN
bookings.google_event_id TEXT
orders.confirmation_sent BOOLEAN
reviews.booking_id UNIQUE WHERE booking_id IS NOT NULL
bookings.review_token_expires_at TIMESTAMPTZ GENERATED FROM end_time + 30 days
```

---

## Live Routes and APIs

```text
GET    /signup                           Dedicated owner sign-up page
GET    /login                            Dedicated owner sign-in page
GET    /callback                         Supabase auth callback and code exchange
GET    /onboarding                       Auth-aware onboarding entry
GET    /dashboard                        Owner dashboard shell
GET    /link                             Owner My Link editor + live preview
GET    /link/theme                       Owner Theme Settings + live preview
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
DELETE /api/owner/services/[id]          Delete owner service
POST   /api/owner/products               Create owner product
PATCH  /api/owner/products/[id]          Update/toggle owner product
DELETE /api/owner/products/[id]          Delete owner product
POST   /api/owner/media                  Upload owner business/profile/product/service media
POST   /api/owner/availability           Upsert owner weekly availability day
POST   /api/owner/blocked-times          Create blocked time
DELETE /api/owner/blocked-times/[id]     Remove blocked time
PATCH  /api/owner/reviews/[id]           Toggle owner review visibility
GET    /api/owner/onboarding             Load onboarding state
PUT    /api/owner/onboarding             Persist onboarding business/services/availability

PATCH  /api/admin/businesses/[id]/status         Activate/deactivate business
POST   /api/admin/businesses/[id]/stripe-connect Reopen or generate Stripe onboarding link
PATCH  /api/admin/reviews/[id]                   Moderate review visibility
GET    /api/admin/agents/diagnostics            Fetch internal diagnostics summary

GET    /api/availability                 Live slot generation by business/service/date
GET    /api/bookings/[id]                Poll booking payment/confirmation status
POST   /api/bookings                     Create booking + PaymentIntent
POST   /api/checkout                     Shared checkout-session route from canonical checkout schema
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

- Public-page theming is driven by `business.theme_key`, resolved through `lib/business-themes.ts`, with app-level fallback to `classic-luxe` for older or missing data.
- Owner editing is split between `/link` for public-page content/settings and `/link/theme` for theme preset, colour, and font controls.
- Both owner pages keep the same right-side live public-page preview before persistence.
- Theme persistence requires the `0010_business_theme_presets.sql` schema change; the live BisLink Supabase project was realigned after schema drift so owner dashboard theme saves now succeed.
- Slot availability is generated from `availability`, minus overlapping `bookings` and `blocked_times`, accounting for service duration + buffer time.
- Stripe Payment Element is used for bookings and product checkout. Stripe webhooks remain the source of truth for completion.
- `lib/payments/checkout.ts` is now the canonical checkout-session path, with `/api/checkout` using the native schema directly and `/api/orders` retained as a legacy-compatible adapter for the current cart payload shape.
- Booking confirmation flow: `payment_intent.succeeded` -> confirm booking -> trigger booking lifecycle -> send confirmation email and create Google Calendar event idempotently.
- Order confirmation flow: `payment_intent.succeeded` -> persist or mark the order `paid` from `payment_intent_id` inside the webhook -> await order lifecycle -> send buyer confirmation email and seller order notification email.
- Reminder flow: 24h and 1h reminders are tracked with `reminder_24h_sent` and `reminder_1h_sent`.
- Review collection flow: follow-up email after the appointment includes a review token link, with one review allowed per booking.
- Review submission links now expire 30 days after the booking end time via `bookings.review_token_expires_at`.
- Public review summaries and demo review counts are derived from the same published-review source to keep hero and reviews-tab totals consistent.
- 10-product limit is enforced by both Postgres trigger and API logic.
- Basic rate limiting is applied to booking, order, contact, and review POST routes.
- Important API warnings/errors are now persisted to Supabase `app_logs` through a minimal server helper that no-ops safely when admin env is unavailable.
- Stripe webhooks verify the `stripe-signature` header against the raw request body before any lifecycle processing runs.
- Public contact submissions now include stricter field validation plus a honeypot field that is rejected server-side when populated.
- Public contact delivery now uses the same admin-capable business lookup approach as the public-page read path, falls back to `business.email`, and returns an explicit error when Resend rejects a send attempt.
- Public booking intent creation now uses the same admin-capable business lookup approach as availability and public-page reads, preventing false `Business not found` failures at the payment step.
- Dynamic page routes now await `params` under Next 16, fixing live slug/admin detail regressions after the framework upgrade.
- Admin diagnostics now distinguish configured, partial, pending processing, reconnect needed, and runtime-incomplete states.
- Owner-facing payout and booking surfaces now expose clearer runtime status for calendar sync, contact delivery, and order confirmation processing.
- Booking lifecycle retries only persist missing side effects, and order lifecycle no longer marks `confirmation_sent` true unless the confirmation email actually succeeds.
- Product-order completion now keeps order persistence on the webhook critical path instead of a detached background fetch, so Stripe retries the flow when lifecycle delivery fails.
- Product-order seller notifications resolve recipient email from `contact_email`, then `business.email`, then the auth owner email.
- Reminder/follow-up logging now includes structured identifiers to make replay/debug traces easier to follow.
- Sentry is wired for runtime error capture via `instrumentation.ts`, `instrumentation-client.ts`, and the global error boundary.
- Owner and admin surfaces now include explicit sign-out actions instead of relying on manual route switching back to login pages.
- Owner mutation routes now use the admin-capable Supabase path after server-side ownership has already been verified, avoiding RLS-related write failures on products and similar owner writes.
- Owner product and service media uploads now share the `/api/owner/media` flow, with `kind` expanded to support both `product` and `service` assets.
- Owner dashboard read routes now also use the admin-capable Supabase path after owner/business resolution, preventing false empty states where public pages have data but dashboard lists appear blank.
- Owner service form error handling now converts structured validation payloads into readable text instead of crashing the dashboard when a Zod error object is returned.
- Owner dashboard list cards for products and services are now text-first and no longer prepend emoji labels in the owner UI.
- Owner dashboard product and service actions now include edit/delete flows directly on the list cards, alongside the active toggle.
- Owner dashboard product and service editors now share a small async-search-param helper to stay compatible with Next 16 route prop semantics.
- Owner dashboard calendar hour rendering now uses availability-derived bounds and local slot labels instead of timezone-shifted synthetic dates.
- Service-image persistence on the linked Supabase project required a live `ALTER TABLE services ADD COLUMN image_url TEXT` repair because the remote migration history had drifted.
- Middleware now explicitly protects all owner dashboard route-group pages (`/calendar`, `/services`, `/products`, `/customers`, `/reviews`, `/link`, `/link/theme`, `/payouts`, `/availability`) instead of relying only on layout-level redirects.

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
- Authenticated owners with an incomplete business setup are redirected back to `/onboarding`.
- Authenticated owners with a complete business setup are redirected to `/dashboard`.
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
- Owner dashboard route-group pages are now also explicitly covered by middleware matcher protection.
- `/admin/(console)` exposes:
  - overview
  - businesses list + business detail
  - support / moderation, including owner/admin support inbox views
  - finance
  - agents diagnostics
  - settings / environment status
- Safe actions include:
  - activate/deactivate business
  - reopen Stripe onboarding
  - moderate review visibility
  - inspect owner/business operational state
- Admin sidebar now includes a real sign-out action that clears the Supabase session and redirects back to `/admin/login`.

---

## Git Branches

| Branch | Purpose |
|---|---|
| `main` | Production base |
| `demo-update-ui` | `/demo` public page remediation, accessibility, and overlay/frame fixes |
| `release-hardening-update` | Build reproducibility, diagnostics expansion, lifecycle retry hardening, and operational cleanup |
| `user-dashboard-fix` | Owner dashboard mobile responsiveness and accessibility fixes |
| `tabs-update` | 5-tab public page system |
| `ui-fixes` | Public page visual fixes and mobile polish |
| `backend-merged` | Backend/schema consolidation work |
| `owner-dashboard-update` | Live owner dashboard reads + owner mutation wiring |
| `admin-dash-update` | Internal admin console, diagnostics, finance, support, and moderation views |
| `public-data` | Public live-data migration workstream |
| `3-themes-update` | Business theme presets, theme registry, and owner live preview |
| `owner-dashboard-ui-fix` | Owner dashboard UI and interaction fixes |
| `snyk-scan` | Dependency and security remediation pass |

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
- shared public `/demo` and `/[slug]` experience with sticky semantic tabs, frame-aware sheets in demo mode, and consistent review totals
- public-page navigation and section polish:
  - stable Home / Book / Shop / About / More bottom navigation
  - centered section dividers and smaller section-title scale
  - compact hero profile row and stronger announcement bar
  - editorial service cards and flatter shop grid treatment
  - simplified contact cards and location presentation
- split owner editing across `/link` and `/link/theme`, with live preview on both pages
- live Supabase schema alignment for `businesses.theme_key`, including the follow-up constraint expansion required for the later `editorial-minimal`, `warm-studio`, and `dark-athletic` presets
- dynamic public slug rendering so new business links are available immediately after setup
- owner dashboard reads across bookings, customers, services, products, reviews, availability, link settings, and payouts
- owner mutations for services, products, availability, blocked times, review visibility, and business profile updates
- owner mutation reliability improvements:
  - admin-capable Supabase write path after ownership verification
  - readable service-form validation errors instead of React render crashes
  - working product/service edit selection under Next 16 async `searchParams`
  - delete actions for both product and service cards
  - simplified owner-side product/service forms without exposed emoji controls
- owner dashboard mobile remediation:
  - bottom navigation with More drawer
  - single-day mobile calendar
  - responsive services/products layouts and empty states
  - improved payouts/stat-card/mobile filters
  - labeled My Link fields and stronger focus treatment
  - separate Theme Settings route for presets and brand styling
  - live preview on both owner editor pages
  - weekly calendar hours now follow configured availability and render correct local labels
- owner dashboard auth/session UX:
  - desktop sidebar sign-out action
  - mobile More drawer sign-out action
- Stripe Connect onboarding for owners
- post-signup Stripe recovery from `/payouts`, including a visible Stripe onboarding CTA when onboarding was skipped or left incomplete
- live payout status derived from the connected Stripe account rather than trusting only the cached `stripe_onboarded` flag
- internal admin console backed by live Supabase, Stripe, and expanded diagnostics
- internal admin support/moderation section is in place
- booking/order lifecycle processing with tighter idempotent guards, structured logs, and clearer retry semantics
- product checkout hardening:
  - admin-capable business lookup instead of false `Business not found`
  - business currency source fixed
  - cart quantity cap aligned with server validation
  - leaner PaymentIntent metadata with persisted pending orders
  - paid-order persistence kept on the webhook path
  - buyer and seller product-order emails via `order-lifecycle`
- security remediation pass:
  - root app upgraded to `next@16.2.3`
  - root lint stack upgraded to `eslint@9.27.0` and `eslint-config-next@16.2.3`
  - ESLint now runs through flat config in `eslint.config.mjs`
  - `postcss` pinned/overridden to `8.5.10`
  - `functions` upgraded to `@google-cloud/functions-framework@5.0.2` and `googleapis@152.0.0`
  - `ybial-agents` upgraded to `@google-cloud/functions-framework@5.0.2`
  - server-side Supabase helpers and typed route handlers were updated for Next 16 compatibility
- live post-upgrade production fixes:
  - dynamic public slug pages and admin business detail pages now await async route `params`
  - owner dashboard reads now use the admin-capable data path, fixing cases where services/products exist publicly but appear empty in the owner dashboard
- public product/service freshness improvements:
  - owner product and service edits revalidate the live public slug page
  - public products now exclude out-of-stock items to match policy
- Google Calendar token persistence and booking sync
- Supabase-backed operational logging for key API failures and selected warnings
- Sentry runtime instrumentation for server/client/global-error capture
- stricter TypeScript settings with `noUncheckedIndexedAccess` and `noImplicitAny`
- repo-scoped Biome setup for source linting/formatting, with generated/build output excluded
- local Windows build reproducibility via `scripts/run-next-build.cjs` and the synced-workspace trace workaround
- booking sheet mobile scroll behavior fixed so the date-selection step can scroll reliably within the bottom sheet
- public contact form delivery fixed to work when the business row is only resolvable via the admin-capable lookup path and when only `business.email` is configured
- booking payment-intent creation fixed to resolve live businesses through the admin-capable lookup path instead of failing at the payment step with a false `Business not found`
- public review links now expire after 30 days instead of remaining valid indefinitely
- middleware protection now covers the full owner route-group surface, closing the previous defense-in-depth gap outside `/dashboard`
- current public-page UI/UX polish pass is complete across bookings, products, reviews, about, contact, and shared shell/footer behavior
- public-page editorial refresh:
  - image-led headers on bookings, shop, and about
  - product and service card parity with real uploaded imagery
  - compact contact form moved above contact cards
  - city-map style location card treatment
  - month-only booking calendar without adjacent-month filler dates

### Still incomplete / highest remaining risk

- live webhook replay and reminder-dispatcher validation still need true runtime/manual verification beyond local build/test success
- production verification is still needed on the newly hardened product-order path after the latest `order-lifecycle` redeploy
- Google Calendar is productionized before Microsoft; Microsoft calendar remains deferred
- public/operator messaging around delayed lifecycle processing can still be improved further in production conditions
- buyer/seller email delivery still depends on correct Resend and Cloud Function env/config in production
- the remaining Snyk findings are transitive `uuid@8.3.2` paths inside `cloudevents` from `@google-cloud/functions-framework`; there is no safe upstream-supported fix yet
- the `functions` package was redeployed after the dependency upgrade, but `ybial-agents` still needs a safe deploy-path fix before its runtime dependency updates are fully live in Google Cloud
- Biome backlog reduction is in progress; the repo now has scoped config, but not all source files are clean yet

### Implication

The release-hardening implementation pass is now in place. The next stage is production validation and runtime verification rather than broad new product-surface work.

---

## Next Agent Handoff Plan

### Goal

Validate the hardening work in real runtime conditions, close any issues found from replay/manual verification, and then move into narrower release-readiness polish instead of another platform-wide refactor. Support/moderation and the latest public-page UI pass are complete; they are no longer active implementation tracks.

### Priority Order

1. Runtime verification of lifecycle and diagnostics
2. Production-facing status and operator polish
3. Optional cleanup of local-only build workaround assumptions
4. Release-readiness documentation and handoff

### 1. Runtime Verification of Lifecycle and Diagnostics

- Replay `payment_intent.succeeded` scenarios for booking and order flows and confirm:
  - no duplicate confirmation emails
  - no duplicate Google Calendar events
  - no duplicate customer stats/order persistence
- Run reminder dispatcher twice over the same booking window and confirm reminders/follow-ups remain one-time.
- Verify admin diagnostics states against real env permutations and confirm owner-facing status text matches actual runtime behavior.

Acceptance:
- replayed webhook/function calls remain safe
- diagnostics surfaces match real configuration/runtime state
- reminder/follow-up jobs remain idempotent in practice

### 2. Integration Diagnostics and Failure Visibility

- Review whether any remaining owner/public screens still need deterministic runtime messaging for:
  - contact delivery unavailable
  - confirmation processing delays
  - reconnect-required calendar state
  - pending order confirmations

Acceptance:
- missing config is visible without checking server logs
- owner/admin users can tell whether failures are auth/config/runtime related

### 3. Lifecycle Observability and Retry Safety

- If replay/manual verification reveals gaps, patch only the specific failing lifecycle edges rather than reopening broad refactors.
- Keep webhook/function payloads and logging fields normalized across booking, order, and reminder flows.

Acceptance:
- replayed Stripe webhook does not duplicate downstream side effects
- replayed lifecycle function calls remain safe
- logs make it possible to trace one booking/order across webhook and lifecycle boundaries

### 4. Release-Readiness Documentation and Handoff

- Keep `PROJECT.md` and any release notes aligned with the real shipped state.
- Document the Windows build workaround as a local-environment mitigation, not a platform requirement.
- Capture any production-only follow-up items discovered during runtime verification as explicit next tasks.

Acceptance:
- handoff docs match actual shipped behavior
- any remaining production-only risks are explicit and actionable

### Constraints / Assumptions

- Do not redesign the product surface in this phase.
- Do not expand scope into multi-staff, marketplace/discovery, loyalty, or customer accounts.
- Google Calendar is the only calendar integration to fully harden in this phase.
- Preserve the explicit `/demo` route for showcase/demo use rather than mixing demo logic into generic live routes.

---

## Explicitly Out of Scope for V1

Multiple staff, group bookings, packages/bundles/discount codes, TikTok/Meta native booking, marketplace/discovery, loyalty points, SMS (email only), Google Maps iframe embed, tab state in URL hash, customer accounts (guest checkout only), waitlist, FAQ tab.

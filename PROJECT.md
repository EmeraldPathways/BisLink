# Your Business in a Link — Project Summary

## What This Project Is

A SaaS product that gives real-world service businesses (personal trainers, salons, yoga instructors, consultants, etc.) a single shareable link (e.g. `yourbusinessinalink.com/studioeleven`) that acts as their entire commercial presence: bookings, products, reviews, about page, and contact info.

Designed to be dropped in a TikTok or Instagram bio and convert cold social traffic into paying customers.

**Closest competitors:** Stan Store / Beacons.ai — both serve digital creators only. This targets real-world service businesses with scheduling complexity.

**Pricing model:** Flat subscription, no per-booking fees.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| UI Components | shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Google OAuth + Email magic link) |
| Realtime | Supabase Realtime (live dashboard) |
| File Storage | Supabase Storage |
| Serverless | Google Cloud Functions |
| Calendar Sync | Google Calendar API + Microsoft Graph API |
| Payments | Stripe Connect Express |
| Email | Resend + React Email |
| Hosting | Vercel |
| DNS/CDN | Cloudflare |
| Animations | Framer Motion |

---

## Design System

### Fonts
- **Display/headings:** Cormorant Garamond (400, 600) — hero name, sheet headings, pull quotes
- **UI/body:** DM Sans (300, 400, 500, 600) — all interface text, buttons, labels

### CSS Variables (`app/globals.css`)
All canonical variables use `--color-*` prefix. Shorthand aliases are also defined for component compatibility.

| Token | Value | Usage |
|---|---|---|
| `--color-void` | `#0C0B09` | Hero/dark backgrounds |
| `--color-gold` | `#C9A45C` | Primary accent — active states, ratings, badges |
| `--color-gold-dark` | `#8B6B1A` | Avatar gradient end |
| `--color-gold-muted` | `#F2EDE3` | Sand chips / credential pills |
| `--color-bg` | `#FAFAF8` | App background |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-surface-2` | `#F7F4EF` | Summary boxes |
| `--color-surface-3` | `#F4F4F2` | Light grey surface |
| `--color-border` | `#EBEBEB` | Default borders |
| `--color-border-dark` | `#2E2A26` | Hero divider |
| `--color-text-hero` | `#F7F3ED` | Primary text on dark hero |
| `--color-text-hero-2` | `#9E9890` | Secondary text on dark hero |
| `--color-text-hero-3` | `#666666` | Tertiary text on dark hero |
| `--color-text-primary` | `#111111` | Primary body text |
| `--color-text-secondary` | `#888888` | Secondary body text |
| `--color-text-tertiary` | `#AAAAAA` | Hints/placeholders |
| `--color-success` | `#4ADE80` | Live availability dot |

Shorthand aliases (mapped in `globals.css`):
`--void`, `--gold`, `--gold-dark`, `--gold-muted`, `--bg`, `--border`, `--border-hero`, `--hero-text-1/2/3`, `--text-1` through `--text-7`, `--green`, `--surface-2`, `--surface-3`

### Hero Section
Dark gradient: `linear-gradient(165deg, #0C0B09 0%, #1C1610 55%, #0F0D0B 100%)` with two radial gold glow orbs. Elements fade-up on load with staggered Framer Motion delays (0ms → 280ms).

---

## Directory Structure

```
app/
  layout.tsx                    Root layout with globals.css
  page.tsx                      Landing/marketing page
  globals.css                   Design tokens + CSS variable aliases
  [slug]/page.tsx               Public business page (ISR, 60s revalidation)
  (auth)/login/                 Login page
  (dashboard)/
    dashboard/                  Today view — live bookings + stats
    calendar/                   Weekly calendar grid
    services/                   Add/edit/reorder services
    products/                   Add/edit/reorder products (max 10)
    availability/               Working hours + blocked times
    customers/                  CRM — booking history, spend
    link/                       Customise public page bio/about/contact
    payouts/                    Stripe Connect + revenue chart
  (onboarding)/onboarding/      5-step onboarding wizard

components/
  public/
    PublicPage.tsx              Main wrapper — tab state, cart, modals
    HeroSection.tsx             Dark hero with avatar, name, bio, rating, location
    TabBar.tsx                  5-tab navigation bar (gold underline indicator)
    tabs/
      BookingsTab.tsx           Service list
      ProductsTab.tsx           2-col product grid + category filter pills
      ReviewsTab.tsx            Rating summary + review cards
      AboutTab.tsx              Profile card, stats, bio, credentials, specialisms
      ContactTab.tsx            Contact rows, message form, location card
    sheets/
      CartSheet.tsx             Floating cart bottom sheet
      ProductSheet.tsx          Product detail bottom sheet
  booking/
    BookingPage.tsx             Booking wrapper
    BookingSheet.tsx            4-step booking bottom sheet
    StepDate.tsx / StepTime.tsx / StepDetails.tsx / StepPayment.tsx / StepConfirm.tsx
    ServiceCard.tsx             Service card with badge pill

hooks/
  useCart.ts                    Cart state (in-memory, session only)
  useProducts.ts                Product filtering by category
  useAvailability.ts            Booking availability (stub)
  useBookings.ts                Booking management (stub)
  useBusiness.ts                Business profile (stub)

lib/
  demo-data.ts                  Full demo dataset (Studio Eleven fitness brand)

types/index.ts                  TypeScript types for all records
supabase/                       DB migrations and schema
emails/                         React Email templates
ybial-agents/                   AI agent layer
```

---

## Public Page — 5-Tab System

Tab bar at the bottom of the dark hero. Default active tab: `bookings`.

| Tab | Content |
|---|---|
| 🗓 Bookings | Service cards → 4-step booking sheet (date → time → details → payment) |
| 🛍 Products | 2-col product grid, category filter pills, cart sheet, product detail sheet |
| ⭐ Reviews | Star rating summary + distribution bars + individual review cards |
| 👤 About | Dark profile card + pull quote, 3-stat row, bio, credentials, specialisms |
| 💬 Contact | Contact method rows (email/phone/Instagram), send message form, location card |

---

## Database Schema

All monetary values in cents. Row Level Security enabled on all tables.

| Table | Purpose |
|---|---|
| `businesses` | Core profile, slug, Stripe/calendar tokens, bio/about/contact fields |
| `services` | Bookable services (duration, price, emoji, tag) |
| `availability` | Working hours per day of week |
| `blocked_times` | Manual time-off blocks |
| `bookings` | Customer bookings with payment and reminder status |
| `customers` | Auto-built CRM from booking history |
| `products` | Up to 10 products per business (enforced by trigger + API) |
| `reviews` | Customer reviews linked to bookings via signed JWT |

### Columns still needed on `businesses`
```sql
full_bio TEXT, quote TEXT, experience TEXT, clients_served TEXT,
specialisms TEXT[], credentials TEXT[], google_review_url TEXT,
contact_email TEXT, contact_phone TEXT, address TEXT, google_maps_url TEXT
```

---

## API Routes Still to Build

```
POST   /api/products          Create product (enforces 10-limit)
PATCH  /api/products/[id]     Update product
DELETE /api/products/[id]     Soft delete (set is_active = false)

POST   /api/reviews           Submit review (requires valid booking JWT)
PATCH  /api/reviews/[id]      Toggle is_visible (owner only)

POST   /api/contact           Forward contact form to owner via Resend
```

---

## Key Business Logic

- **Slot availability:** Generated from `availability` table, minus existing `bookings`, minus `blocked_times`, accounting for service duration + buffer time
- **Payment:** Stripe Connect Express — customer pays platform, platform transfers to business. `application_fee_amount = 0` in v1
- **Booking confirmation:** Triggered by Stripe webhook `payment_intent.succeeded` → update booking → send confirmation email → create Google Calendar event
- **Reminders:** 24h and 1h before via Resend email. Tracked by `reminder_24h_sent` / `reminder_1h_sent` booleans
- **Review collection:** Follow-up email 24h after appointment, contains signed JWT link, one review per booking
- **10-product limit:** Enforced by Postgres trigger AND the API route

---

## Onboarding Flow (`/onboarding` — 5 steps)

1. Business name, category, bio, location → auto-generates slug
2. Add first services (pre-filled examples based on category)
3. Set availability (default Mon–Fri 9am–6pm)
4. Connect Stripe (or skip)
5. Success screen with live link + share prompt

Products and About content are **not** part of onboarding — filled in from dashboard after going live.

---

## Git Branches

| Branch | Purpose |
|---|---|
| `main` | Production base |
| `tabs-update` | 5-tab public page system |
| `ui-fixes` | CSS variable bug fix, badge z-index, tab bar layout |

---

## UI Fixes Applied (branch: `ui-fixes`)

Three bugs found and fixed via browser inspection at 390px mobile viewport:

### 1. CSS Variable Naming Mismatch — `app/globals.css`
All 9 public components referenced shorthand CSS variables (`--void`, `--gold`, `--hero-text-1`, `--text-1` through `--text-7`, etc.) that were undefined — the canonical names use `--color-*` prefix. Every text element in the hero and tabs rendered near-black `#111111`, invisible on the dark background.

**Fix:** Added 20 shorthand alias variables to `:root` in `globals.css`.

### 2. Service Card Badge Clipping — `components/booking/ServiceCard.tsx`
The badge pill (`absolute right-4 top-3`) for "MOST BOOKED" / "START HERE" / "POPULAR" was partially covered by the arrow button's `bg-[#f2f2f0]` background, making it appear truncated.

**Fix:** Added `z-10` to the badge span.

### 3. Tab Bar Overflow — `components/public/TabBar.tsx`
5 tabs × `min-w-[84px]` = 420px > 390px viewport. "Contact" tab was off-screen.

**Fix:** Removed `min-w-[84px]`, letting `flex-1` distribute all 5 tabs evenly (~78px each).

---

## Current Data Status

Everything on the public page currently uses `lib/demo-data.ts` (Studio Eleven fitness brand). Supabase, Stripe, Google Calendar, and Resend integrations are scaffolded but all hooks return stub/demo data. The page is not yet wired to a live database.

---

## Explicitly Out of Scope for V1

Multiple staff, group bookings, packages/bundles/discount codes, TikTok/Meta native booking, marketplace/discovery, loyalty points, SMS (email only), product photo upload (emoji thumbnail only), Google Maps iframe embed, tab state in URL hash, customer accounts (guest checkout only), waitlist, FAQ tab.

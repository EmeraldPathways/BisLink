Project Audit and Stabilization Plan
Summary
Static review and non-mutating checks found a mix of confirmed defects and launch-blocking gaps.

Recent fixes and shipped behavior

- Owner dashboard calendar now derives visible hours from active availability instead of a hard-coded range, and slot labels render as local business hours instead of timezone-shifted synthetic dates.
- Owner dashboard service edit flow was repaired for Next 16 async `searchParams`; service cards now support delete and no longer show emoji in the list UI.
- Owner dashboard product edit flow was repaired with the same async `searchParams` handling; product cards now support delete and no longer show emoji in the list UI.
- Owner service form no longer exposes `emoji` or `tag`; owner product form no longer exposes the emoji picker. Both rely on server-side defaults where needed.
- Shared helper added for dashboard edit query parsing so product and service dashboard pages remain aligned under Next 16 route prop behavior.
- Product image uploads were verified against the live project and work correctly.
- Service image uploads were traced to remote schema drift: the linked Supabase project had the `business-media` bucket, but the live `services` table was missing `image_url`.
- Live repair was applied directly to Supabase with `ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;`, and the new column was verified afterward.

Checks already run:

Root npm run typecheck: fails because tsconfig.json hard-includes stale .next/types/**/*.ts.
Root npm run lint: unusable because no ESLint config exists and the script drops into interactive setup.
Root npm run build: fails opening .next/trace inside the synced workspace.
ybial-agents tests: pass.
Key Changes
Build and repo hygiene

Remove direct dependence on generated .next/types/**/*.ts from the root TypeScript program, or gate it so typecheck works in clean and sandboxed environments.
Add a committed ESLint config so npm run lint is non-interactive.
Treat the .next/trace failure as an operational blocker: make builds reliable in a synced folder, or document/build around a non-synced output location.
Auth flow

Implement the real Supabase auth callback in app/(auth)/callback/route.ts; it currently only redirects and never exchanges the auth code.
Wire the login page actions instead of rendering inert buttons.
Replace the current cookie-only middleware/server-client pattern with the standard Supabase SSR refresh flow. The current middleware only checks for cookie presence, and lib/supabase/server.ts no-ops cookie set/remove, which is likely to break token refresh and protected-page access.
Reviews integrity

Enforce “one review per booking” in both API and schema.
app/api/reviews/route.ts inserts a review after token validation but never checks for an existing review, and the reviews table has no uniqueness constraint on booking_id.
Availability correctness

Fix day-overlap queries in app/api/availability/route.ts.
Current live queries only load rows whose start_time falls within the selected day, so any booking or blocked window that starts before midnight and overlaps the selected date is ignored.
Align the query predicate with interval overlap logic instead of day-start filtering.
Test Plan
Tooling

npm run typecheck succeeds from a clean checkout.
npm run lint runs non-interactively.
npm run build succeeds in the intended local environment.
Auth

Google/magic-link sign-in completes through the callback and lands on a protected page with a valid session.
Expired/refreshed sessions continue to work across dashboard navigation.
Reviews

First valid review for a booking succeeds.
Second review attempt for the same booking is rejected cleanly.
Invalid token still returns 403.
Availability

A booking or blocked interval spanning midnight suppresses slots on both affected dates.
Same-day bookings and blocks still behave as before.
Assumptions
The review scope includes confirmed defects plus incomplete live-flow wiring that will break intended behavior.
The .next/trace build error may be workspace-specific, but it is still a real delivery risk for this repo in its current location.
I did not count “demo/stubbed data still being used” as a bug by itself unless it directly breaks an advertised flow.

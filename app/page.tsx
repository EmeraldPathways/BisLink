import Link from 'next/link';
import { ArrowRight, CalendarDays, CreditCard, Link2, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <section className="relative overflow-hidden bg-[var(--color-void)] px-6 py-8 text-[var(--color-text-hero)] md:px-10 md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,164,92,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(201,164,92,0.12),transparent_22%),linear-gradient(135deg,#0C0B09_0%,#1C1610_100%)]" />
        <div className="noise-overlay absolute inset-0" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 lg:min-h-[calc(100svh-4rem)] lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-gold)]">
              BisLink
            </p>
            <h1 className="max-w-xl font-display text-6xl leading-[0.95] tracking-[-1.5px] md:text-7xl">
              BisLink puts your business in a link.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--color-text-hero-2)] md:text-lg">
              Built for trainers, salons, massage studios, consultants, and every service business that lives on social. One link. Real availability. Real payments. Real repeat customers.
            </p>
            <div className="mt-8 max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-gold)] px-6 py-4 text-sm font-semibold text-[var(--color-void)]"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-border-dark)] px-6 py-4 text-sm font-semibold text-[var(--color-text-hero)]"
                >
                  Sign In to Owner Dashboard
                </Link>
              </div>
              <div className="my-4 h-px w-28 bg-[var(--color-border-dark)]/80" />
              <Link
                href="/studio-eleven"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border-dark)]/70 px-5 py-3 text-sm font-semibold text-[var(--color-text-hero-2)] transition-colors hover:text-[var(--color-text-hero)]"
              >
                View Demo Link
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-xl">
            <div className="rounded-[34px] border border-[var(--color-border-dark)] bg-[#12100d]/80 p-4 backdrop-blur">
              <div className="rounded-[28px] bg-[var(--color-bg)] p-4 text-[var(--color-text-primary)] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
                <div className="rounded-[24px] bg-gradient-to-br from-[var(--color-void)] to-[var(--color-void-2)] p-5 text-[var(--color-text-hero)]">
                  <div className="mb-4 flex h-[64px] w-[64px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] font-display text-2xl font-semibold text-[var(--color-void)]">
                    SE
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-gold)]">
                    Personal Training
                  </p>
                  <h2 className="mt-2 font-display text-4xl">Studio Eleven</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-hero-2)]">
                    Movement coaching for real people. No fluff, no fads.
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {[
                    ['1-on-1 Training Session', '$120'],
                    ['Power Half Hour', '$65'],
                    ['Movement Assessment', '$80']
                  ].map(([label, price]) => (
                    <div key={label} className="flex items-center justify-between rounded-[18px] border border-[var(--color-border)] bg-white px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-[var(--color-text-secondary)]">Tap to pick a date and time</p>
                      </div>
                      <p className="text-sm font-semibold">{price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Link2, title: 'Built for social', body: 'A public page that looks expensive on the first tap, not like generic scheduling software.' },
          { icon: CalendarDays, title: 'Real scheduling', body: 'Availability, buffers, blocked times, and weekly calendars tuned for real-world appointments.' },
          { icon: CreditCard, title: 'Payments included', body: 'Deposits, Stripe Connect onboarding, payouts, and customer history in one flow.' },
          { icon: Sparkles, title: 'Owner operating system', body: 'Dashboard, onboarding, link editor, services, and customer records without per-booking fees.' }
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-[26px] border border-[var(--color-border)] bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.04)]">
            <Icon className="h-5 w-5 text-[var(--color-gold-dark)]" />
            <h3 className="mt-4 font-display text-3xl">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{body}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10">
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>BisLink for service businesses.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="transition-colors hover:text-[var(--color-text-primary)]">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="transition-colors hover:text-[var(--color-text-primary)]">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

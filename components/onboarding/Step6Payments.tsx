export function Step6Payments() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 6 of 7</p>
        <h2 className="mt-2 font-display text-5xl">Get paid</h2>
      </div>
      <div className="rounded-[26px] bg-[var(--color-void)] p-6 text-[var(--color-text-hero)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold)]">Stripe Connect Express</p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-hero-2)]">
          Customers pay you directly through your link. No middleman fees from us, with payouts and revenue tracked in one place.
        </p>
        <div className="mt-5 flex gap-3">
          <button className="rounded-2xl bg-[var(--color-gold)] px-4 py-3 text-sm font-semibold text-[var(--color-void)]">Connect Stripe</button>
          <button className="rounded-2xl border border-[var(--color-border-dark)] px-4 py-3 text-sm font-semibold text-white">Skip for now</button>
        </div>
      </div>
    </div>
  );
}

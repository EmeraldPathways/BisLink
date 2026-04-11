import { CheckCircle } from 'lucide-react';

export function Step7Done() {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[var(--color-void)] to-[#2a2620] text-[var(--color-gold)]">
        <CheckCircle className="h-9 w-9" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 7 of 7</p>
        <h2 className="mt-2 font-display text-5xl">You&apos;re live</h2>
      </div>
      <div className="rounded-[22px] bg-[var(--color-surface-2)] px-4 py-5">
        <p className="text-sm text-[var(--color-text-secondary)]">Your new public link</p>
        <p className="mt-2 text-lg font-semibold">yourbusinessinalink.com/studio-eleven</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button className="rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white">Copy Link</button>
        <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold">Open Link</button>
        <button className="rounded-2xl border border-[var(--color-border)] px-5 py-3 text-sm font-semibold">Go to Dashboard</button>
      </div>
    </div>
  );
}

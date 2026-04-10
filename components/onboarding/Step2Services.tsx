import { demoCredentials, demoSpecialisms } from '@/lib/demo-data';

export function Step2Services() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gold-dark)]">Step 2 of 6</p>
        <h2 className="mt-2 font-display text-5xl">Your story</h2>
      </div>
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="Strong bodies. Clear heads. Honest coaching." placeholder="Tagline" />
      <textarea className="min-h-[160px] w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="Studio Eleven was built for people who want training that fits real life." />
      <input className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4" defaultValue="9" placeholder="Years of experience" />
      <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Credentials</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoCredentials.map((item) => (
            <span key={item.id} className="rounded-full bg-[var(--color-gold-muted)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-gold-dark)]">
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-[22px] border border-[var(--color-border)] bg-white p-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Specialisms</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoSpecialisms.map((item) => (
            <span key={item.id} className="rounded-full bg-[var(--color-surface-3)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-primary)]">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

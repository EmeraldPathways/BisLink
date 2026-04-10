import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-[32px] border border-[var(--color-border)] bg-white p-8 shadow-[0_24px_80px_rgba(12,11,9,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-gold-dark)]">Owner access</p>
        <h1 className="mt-3 font-display text-6xl leading-[0.95]">Sign in to run the business.</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          Continue with Google or send yourself a magic link. For the local demo, use the shortcut below.
        </p>
        <div className="mt-6 space-y-3">
          <button className="w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white">Continue with Google</button>
          <button className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-4 text-sm font-semibold">Email me a magic link</button>
          <Link href="/dashboard" className="block w-full rounded-2xl bg-[var(--color-gold-muted)] px-4 py-4 text-center text-sm font-semibold text-[var(--color-gold-dark)]">
            Open demo dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

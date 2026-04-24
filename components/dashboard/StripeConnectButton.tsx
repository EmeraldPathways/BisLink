'use client';

import { useState } from 'react';

export function StripeConnectButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/connect', { cache: 'no-store' });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? 'Failed to start Stripe onboarding');
      }

      window.location.href = data.url;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to start Stripe onboarding',
      );
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center justify-center rounded-2xl bg-[var(--color-void)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? 'Opening Stripe...' : 'Complete Stripe onboarding'}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

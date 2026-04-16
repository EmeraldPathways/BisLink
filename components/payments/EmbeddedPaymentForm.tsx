'use client';

import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { Stripe, StripeElements } from '@stripe/stripe-js';

export type PaymentConfirmAction = (args: { stripe: Stripe; elements: StripeElements }) => Promise<void>;

export function EmbeddedPaymentForm({
  onConfirm,
  submitLabel,
  processingLabel
}: {
  onConfirm: PaymentConfirmAction;
  submitLabel: string;
  processingLabel: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    try {
      await onConfirm({ stripe, elements });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[15px] border border-[var(--color-border)] bg-white p-4">
        <PaymentElement />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-2xl bg-[var(--color-void)] px-4 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-tertiary)]"
      >
        {submitting ? processingLabel : submitLabel}
      </button>
    </form>
  );
}

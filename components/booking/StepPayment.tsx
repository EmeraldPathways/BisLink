'use client';

import { useEffect, useMemo, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import type { StripeElements, Stripe } from '@stripe/stripe-js';
import { EmbeddedPaymentForm } from '@/components/payments/EmbeddedPaymentForm';
import { getStripeJs } from '@/lib/stripe/browser';
import { formatPrice, formatTimeLabel } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { Service } from './BookingPage';

export function StepPayment({
  business,
  service,
  date,
  time,
  details,
  onNext
}: {
  business: BusinessProfile;
  service: Service;
  date: string;
  time: string;
  details: { name: string; email: string; phone?: string };
  onBack: () => void;
  onNext: (bookingId: string) => void;
}) {
  const stripePromise = useMemo(() => getStripeJs(), []);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function createIntent() {
      setLoadingIntent(true);
      setError(null);
      setProcessingMessage(null);
      setClientSecret(null);
      setBookingId(null);

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            businessId: business.id,
            serviceId: service.id,
            startTime: new Date(`${date}T${time}:00`).toISOString(),
            customerName: details.name,
            customerEmail: details.email,
            customerPhone: details.phone
          })
        });

        const payload = (await response.json()) as { bookingId?: string; clientSecret?: string | null; error?: string };
        if (!response.ok || !payload.bookingId || !payload.clientSecret) {
          throw new Error(payload.error || 'Could not prepare payment');
        }

        setBookingId(payload.bookingId);
        setClientSecret(payload.clientSecret);
      } catch (intentError) {
        if (controller.signal.aborted) return;
        setError(intentError instanceof Error ? intentError.message : 'Could not prepare payment');
      } finally {
        if (!controller.signal.aborted) {
          setLoadingIntent(false);
        }
      }
    }

    void createIntent();

    return () => controller.abort();
  }, [business.id, date, details.email, details.name, details.phone, service.id, time]);

  async function confirmBookingPayment({ stripe, elements }: { stripe: Stripe; elements: StripeElements }) {
    if (!bookingId) {
      throw new Error('Booking is not ready yet');
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required'
    });

    if (result.error) {
      throw new Error(result.error.message || 'Payment failed');
    }

    setProcessingMessage('Payment received. Confirming your booking...');
    await waitForBookingConfirmation(bookingId);
    onNext(bookingId);
  }

  async function waitForBookingConfirmation(id: string) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await fetch(`/api/bookings/${id}`, { cache: 'no-store' });
      const payload = (await response.json()) as {
        booking?: { status: string; payment_status: string };
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'Could not confirm booking status');
      }

      if (payload.booking?.status === 'confirmed' && payload.booking.payment_status === 'paid') {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw new Error('Payment succeeded but booking confirmation is still processing. Please wait a moment and try again.');
  }

  return (
    <div>
      <h3 className="font-display text-[26px] font-semibold">Payment</h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Secured by Stripe</p>

      <div className="mt-5 flex items-center justify-between rounded-[15px] bg-[var(--color-surface-2)] px-4 py-4">
        <div>
          <p className="text-sm font-semibold">{service.name}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {format(new Date(`${date}T00:00:00`), 'EEE, d MMM')} - {formatTimeLabel(new Date(`${date}T${time}:00`), business.timezone)}
          </p>
        </div>
        <p className="text-[20px] font-bold">{formatPrice(service.price, service.currency)}</p>
      </div>

      {!stripePromise ? <p className="mt-5 text-sm text-red-600">Stripe is not configured for this environment.</p> : null}
      {loadingIntent ? <p className="mt-5 text-sm text-[var(--color-text-secondary)]">Preparing your secure payment form...</p> : null}
      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}
      {processingMessage ? <p className="mt-5 text-sm text-[var(--color-text-secondary)]">{processingMessage}</p> : null}

      {stripePromise && clientSecret ? (
        <div className="mt-5">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0C0B09',
                  colorBackground: '#FAFAF8',
                  colorText: '#111111',
                  borderRadius: '14px'
                }
              }
            }}
          >
            <EmbeddedPaymentForm
              onConfirm={confirmBookingPayment}
              submitLabel={`Pay ${formatPrice(service.price, service.currency)} - Confirm Booking`}
              processingLabel="Confirming payment..."
            />
          </Elements>
        </div>
      ) : null}
    </div>
  );
}

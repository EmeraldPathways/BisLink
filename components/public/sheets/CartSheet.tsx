'use client';

import { type RefObject, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Elements } from '@stripe/react-stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { EmbeddedPaymentForm } from '@/components/payments/EmbeddedPaymentForm';
import { useIsMobile } from '@/hooks/useBreakpoint';
import { getStripeJs } from '@/lib/stripe/browser';
import { formatPrice } from '@/lib/utils/formatting';
import type { BusinessProfile } from '@/types';
import type { CartLine } from '@/hooks/useCart';

export function CartSheet({
  open,
  business,
  items,
  total,
  onClose,
  onCheckout,
  presentation = 'default',
  containerRef
}: {
  open: boolean;
  business: BusinessProfile;
  items: CartLine[];
  total: number;
  onClose: () => void;
  onCheckout: () => void;
  presentation?: 'default' | 'demo';
  containerRef?: RefObject<HTMLDivElement>;
}) {
  const stripePromise = useMemo(() => getStripeJs(), []);
  const isMobile = useIsMobile();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingLine1, setShippingLine1] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingRegion, setShippingRegion] = useState('');
  const [shippingPostalCode, setShippingPostalCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const canCreateIntent = items.length > 0 && customerName.trim() && customerEmail.trim();
  const framed = presentation === 'demo' && !isMobile && containerRef?.current;
  const shellClassName = framed ? 'absolute inset-0 z-50' : 'fixed inset-0 z-50';
  const panelClassName = framed
    ? 'hide-scrollbar absolute bottom-0 left-0 right-0 min-h-[78%] max-h-[calc(100%-8px)] w-full overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] rounded-t-[30px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[0_-24px_64px_rgba(0,0,0,0.22)]'
    : 'hide-scrollbar absolute bottom-0 left-0 right-0 mx-auto min-h-[78dvh] max-h-[calc(100dvh-8px)] w-full max-w-[520px] overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] rounded-t-[30px] bg-white px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3 shadow-[0_-24px_64px_rgba(0,0,0,0.22)] md:max-w-[430px] md:rounded-t-[26px] md:px-4';

  async function handleCreateIntent() {
    setLoadingIntent(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          items: items.map((item) => ({ productId: item.product.id, qty: item.qty })),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          shippingAddress: shippingLine1.trim()
            ? {
                line1: shippingLine1.trim(),
                city: shippingCity.trim() || undefined,
                region: shippingRegion.trim() || undefined,
                postalCode: shippingPostalCode.trim() || undefined,
                country: shippingCountry.trim() || undefined
              }
            : undefined
        })
      });

      const payload = (await response.json()) as { clientSecret?: string | null; error?: string };
      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.error || 'Could not prepare checkout');
      }

      setClientSecret(payload.clientSecret);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Could not prepare checkout');
    } finally {
      setLoadingIntent(false);
    }
  }

  async function confirmOrderPayment({ stripe, elements }: { stripe: Stripe; elements: StripeElements }) {
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required'
    });

    if (result.error) {
      throw new Error(result.error.message || 'Payment failed');
    }

    onCheckout();
    setSuccess(true);
  }

  const sheet = (
    <AnimatePresence>
      <motion.div className={shellClassName} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          className={panelClassName}
        >
          <div className="mx-auto mb-4 h-1 w-[38px] rounded bg-[#e0e0e0]" />
          <div className="flex items-center justify-between">
            <p className="font-display text-[24px] text-[var(--text-1)]">Your Cart</p>
            <button type="button" aria-label="Close cart" className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--surface-3)]" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between rounded-[16px] bg-[var(--surface-2)] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-1)]">{item.product.name}</p>
                  <p className="text-sm text-[var(--text-3)]">
                    {item.qty} × {formatPrice(item.product.price)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--text-1)]">{formatPrice(item.product.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[15px] bg-[var(--surface-2)] px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--text-1)]">Total</span>
              <span className="text-[18px] font-bold text-[var(--text-1)]">{formatPrice(total)}</span>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {success ? (
              <div className="rounded-[16px] bg-[var(--surface-2)] px-4 py-5 text-sm text-[var(--text-2)]">
                Your payment was received. We&apos;re processing your order confirmation now.
              </div>
            ) : (
              <>
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Customer name" />
                <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Email" type="email" />
                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Phone (optional)" />
                <input value={shippingLine1} onChange={(event) => setShippingLine1(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Shipping address (optional)" />
                {shippingLine1 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <input value={shippingCity} onChange={(event) => setShippingCity(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="City" />
                    <input value={shippingRegion} onChange={(event) => setShippingRegion(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Region" />
                    <input value={shippingPostalCode} onChange={(event) => setShippingPostalCode(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Postal code" />
                    <input value={shippingCountry} onChange={(event) => setShippingCountry(event.target.value)} className="w-full rounded-[13px] border-[1.5px] border-[var(--border)] bg-[var(--bg)] px-4 py-3" placeholder="Country" />
                  </div>
                ) : null}
              </>
            )}
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          {!success && !clientSecret ? (
            <button
              onClick={handleCreateIntent}
              disabled={!stripePromise || !canCreateIntent || loadingIntent}
              className="mt-6 w-full rounded-[15px] bg-[var(--void)] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-5)]"
            >
              {loadingIntent ? 'Preparing payment...' : `Continue to payment - ${formatPrice(total, business.currency)}`}
            </button>
          ) : null}
          {!success && stripePromise && clientSecret ? (
            <div className="mt-6">
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
                  onConfirm={confirmOrderPayment}
                  submitLabel={`Pay ${formatPrice(total, business.currency)}`}
                  processingLabel="Confirming payment..."
                />
              </Elements>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return framed && containerRef?.current ? createPortal(sheet, containerRef.current) : sheet;
}

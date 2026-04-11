import Stripe from 'stripe';

let stripeClient: Stripe | null | undefined;

export function getStripe() {
  if (stripeClient !== undefined) return stripeClient;
  if (!process.env.STRIPE_SECRET_KEY) {
    stripeClient = null;
    return stripeClient;
  }

  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
  return stripeClient;
}

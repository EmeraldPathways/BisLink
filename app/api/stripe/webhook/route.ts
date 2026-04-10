import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  const stripe = getStripe();

  if (!process.env.STRIPE_WEBHOOK_SECRET || !stripe || !signature) {
    return NextResponse.json({ received: true, mode: 'demo' });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'account.updated':
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid webhook payload' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';

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
      case 'payment_intent.succeeded': {
        const supabase = createAdminClient();
        if (!supabase) break;
        const paymentIntent = event.data.object;

        if (paymentIntent.metadata?.type === 'booking') {
          await supabase.from('bookings').update({ status: 'confirmed', payment_status: 'paid' }).eq('payment_intent_id', paymentIntent.id);
        }

        if (paymentIntent.metadata?.type === 'order') {
          await supabase.from('orders').update({ status: 'paid' }).eq('payment_intent_id', paymentIntent.id);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const supabase = createAdminClient();
        if (!supabase) break;
        const paymentIntent = event.data.object;

        if (paymentIntent.metadata?.type === 'booking') {
          await supabase.from('bookings').update({ status: 'cancelled' }).eq('payment_intent_id', paymentIntent.id);
        }

        if (paymentIntent.metadata?.type === 'order') {
          await supabase.from('orders').update({ status: 'refunded' }).eq('payment_intent_id', paymentIntent.id);
        }
        break;
      }
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

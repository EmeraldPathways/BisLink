import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get('stripe-signature');

  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[Stripe webhook] Signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 500 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(intent, supabase);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(intent, supabase);
      break;
    }
    case 'account.updated': {
      const account = event.data.object as Stripe.Account;
      await handleAccountUpdated(account, supabase);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(intent: Stripe.PaymentIntent, supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const type = intent.metadata.type ?? 'booking';

  if (type === 'product_order' || type === 'order') {
    await handleProductOrder(intent, supabase);
    return;
  }

  await handleBookingPayment(intent, supabase);
}

async function handleBookingPayment(intent: Stripe.PaymentIntent, supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { customerEmail, customerName } = intent.metadata;

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', payment_status: 'paid' })
    .eq('payment_intent_id', intent.id)
    .select('id, business_id, start_time, amount_paid, customer_name, customer_email')
    .single();

  if (error || !booking) {
    console.error('[webhook] Failed to confirm booking:', intent.id, error);
    return;
  }

  await supabase.from('customers').upsert(
    {
      business_id: booking.business_id,
      name: customerName || booking.customer_name,
      email: customerEmail || booking.customer_email,
      last_booking_at: booking.start_time,
      first_booking_at: booking.start_time
    },
    { onConflict: 'business_id,email', ignoreDuplicates: false }
  );

  await supabase.rpc('increment_customer_stats', {
    p_business_id: booking.business_id,
    p_email: customerEmail || booking.customer_email,
    p_amount: booking.amount_paid ?? 0,
    p_booking_at: booking.start_time
  });

  triggerBookingLifecycle(booking.id).catch((error) => console.error('[webhook] Lifecycle trigger failed:', error));
}

async function handleProductOrder(intent: Stripe.PaymentIntent, supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const { businessId, customerName, customerEmail, lineItems } = intent.metadata;
  const items = lineItems ? JSON.parse(lineItems) : [];
  const total = Array.isArray(items) ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const now = new Date().toISOString();

  await supabase.from('customers').upsert(
    {
      business_id: businessId,
      name: customerName,
      email: customerEmail,
      last_booking_at: now,
      first_booking_at: now
    },
    { onConflict: 'business_id,email', ignoreDuplicates: false }
  );

  await supabase.rpc('increment_customer_stats', {
    p_business_id: businessId,
    p_email: customerEmail,
    p_amount: total,
    p_booking_at: now
  });

  triggerOrderLifecycle({
    businessId,
    customerName,
    customerEmail,
    items,
    total,
    paymentIntentId: intent.id
  }).catch((error) => console.error('[webhook] Order lifecycle trigger failed:', error));
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent, supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  const type = intent.metadata.type ?? 'booking';

  if (type === 'product_order' || type === 'order') {
    const { error } = await supabase.from('orders').update({ status: 'refunded' }).eq('payment_intent_id', intent.id);
    if (error) {
      console.error('[webhook] Failed to update order payment failure:', intent.id, error);
    }
    return;
  }

  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('payment_intent_id', intent.id);
  if (error) {
    console.error('[webhook] Failed to cancel booking:', intent.id, error);
  }
}

async function handleAccountUpdated(account: Stripe.Account, supabase: NonNullable<ReturnType<typeof createAdminClient>>) {
  if (!account.charges_enabled || !account.details_submitted) {
    return;
  }

  const { error } = await supabase.from('businesses').update({ stripe_onboarded: true }).eq('stripe_account_id', account.id);
  if (error) {
    console.error('[webhook] Failed to update stripe_onboarded:', account.id, error);
  }
}

async function triggerBookingLifecycle(bookingId: string) {
  const url = process.env.BOOKING_LIFECYCLE_FUNCTION_URL;
  if (!url) {
    console.warn('[webhook] BOOKING_LIFECYCLE_FUNCTION_URL not set');
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_CLOUD_FUNCTION_TOKEN ?? ''}`
    },
    body: JSON.stringify({ bookingId })
  });

  if (!res.ok) {
    throw new Error(`Lifecycle function returned ${res.status}`);
  }
}

async function triggerOrderLifecycle(payload: {
  businessId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ productId: string; name: string; emoji: string; price: number; quantity: number }>;
  total: number;
  paymentIntentId: string;
}) {
  const url = process.env.ORDER_LIFECYCLE_FUNCTION_URL;
  if (!url) {
    console.warn('[webhook] ORDER_LIFECYCLE_FUNCTION_URL not set');
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_CLOUD_FUNCTION_TOKEN ?? ''}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Order lifecycle returned ${res.status}`);
  }
}

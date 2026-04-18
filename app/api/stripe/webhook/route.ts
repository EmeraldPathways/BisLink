import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

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

async function handleBookingPayment(intent: Stripe.PaymentIntent, supabase: AdminClient) {
  const { customerEmail, customerName } = intent.metadata;
  const { data: existingBooking, error: existingBookingError } = await supabase
    .from('bookings')
    .select('id, business_id, start_time, amount_paid, customer_name, customer_email, status, payment_status, confirmation_sent, google_event_id, payment_intent_id')
    .eq('payment_intent_id', intent.id)
    .maybeSingle();

  if (existingBookingError || !existingBooking) {
    logWebhook('booking_lookup_failed', { payment_intent_id: intent.id, error: existingBookingError?.message ?? 'Booking not found' }, 'error');
    return;
  }

  const isAlreadyPaid = existingBooking.status === 'confirmed' && existingBooking.payment_status === 'paid';
  if (isAlreadyPaid) {
    logWebhook('booking_already_confirmed', {
      payment_intent_id: intent.id,
      booking_id: existingBooking.id,
      business_id: existingBooking.business_id
    });

    if (!existingBooking.confirmation_sent || !existingBooking.google_event_id) {
      triggerBookingLifecycle(existingBooking.id, intent.id).catch((error) =>
        logWebhook(
          'booking_lifecycle_trigger_failed',
          { payment_intent_id: intent.id, booking_id: existingBooking.id, business_id: existingBooking.business_id, error: toErrorMessage(error) },
          'error'
        )
      );
    }
    return;
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', payment_status: 'paid' })
    .eq('payment_intent_id', intent.id)
    .select('id, business_id, start_time, amount_paid, customer_name, customer_email')
    .single();

  if (error || !booking) {
    logWebhook('booking_confirm_failed', { payment_intent_id: intent.id, error: error?.message ?? 'Unknown booking update error' }, 'error');
    return;
  }

  const { error: customerUpsertError } = await supabase.from('customers').upsert(
    {
      business_id: booking.business_id,
      name: customerName || booking.customer_name,
      email: customerEmail || booking.customer_email,
      last_booking_at: booking.start_time,
      first_booking_at: booking.start_time
    },
    { onConflict: 'business_id,email', ignoreDuplicates: false }
  );
  if (customerUpsertError) {
    logWebhook(
      'booking_customer_upsert_failed',
      {
        payment_intent_id: intent.id,
        booking_id: booking.id,
        business_id: booking.business_id,
        error: customerUpsertError.message
      },
      'error'
    );
  }

  const { error: customerStatsError } = await supabase.rpc('increment_customer_stats', {
    p_business_id: booking.business_id,
    p_email: customerEmail || booking.customer_email,
    p_amount: booking.amount_paid ?? 0,
    p_booking_at: booking.start_time
  });
  if (customerStatsError) {
    logWebhook(
      'booking_customer_stats_failed',
      {
        payment_intent_id: intent.id,
        booking_id: booking.id,
        business_id: booking.business_id,
        error: customerStatsError.message
      },
      'error'
    );
  }

  logWebhook('booking_confirmed', {
    payment_intent_id: intent.id,
    booking_id: booking.id,
    business_id: booking.business_id
  });

  triggerBookingLifecycle(booking.id, intent.id).catch((error) =>
    logWebhook(
      'booking_lifecycle_trigger_failed',
      { payment_intent_id: intent.id, booking_id: booking.id, business_id: booking.business_id, error: toErrorMessage(error) },
      'error'
    )
  );
}

async function handleProductOrder(intent: Stripe.PaymentIntent, supabase: AdminClient) {
  const { businessId, customerName, customerEmail, customerPhone, shippingAddress, lineItems } = intent.metadata;
  const items = parseMetadataJson<Array<{ productId: string; name: string; emoji: string; price: number; quantity: number }>>(lineItems, []);
  const parsedShippingAddress = parseMetadataJson<{
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  } | null>(shippingAddress, null);
  const total = Array.isArray(items) ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const { data: existingOrder, error: existingOrderError } = await supabase
    .from('orders')
    .select('id, business_id, confirmation_sent')
    .eq('payment_intent_id', intent.id)
    .maybeSingle();

  if (existingOrderError) {
    logWebhook('order_lookup_failed', { payment_intent_id: intent.id, error: existingOrderError.message }, 'error');
    return;
  }

  if (existingOrder?.confirmation_sent) {
    logWebhook('order_already_processed', {
      payment_intent_id: intent.id,
      order_id: existingOrder.id,
      business_id: existingOrder.business_id
    });
    return;
  }

  if (!businessId || !customerEmail || !Array.isArray(items) || !items.length) {
    logWebhook(
      'order_payload_invalid',
      {
        payment_intent_id: intent.id,
        business_id: businessId ?? null,
        has_customer_email: Boolean(customerEmail),
        has_items: Array.isArray(items) && items.length > 0
      },
      'error'
    );
    return;
  }

  triggerOrderLifecycle({
    orderId: existingOrder?.id ?? null,
    businessId,
    customerName,
    customerEmail,
    customerPhone: customerPhone || null,
    shippingAddress: parsedShippingAddress,
    items,
    total,
    paymentIntentId: intent.id
  }).catch((error) =>
    logWebhook(
      'order_lifecycle_trigger_failed',
      { payment_intent_id: intent.id, order_id: existingOrder?.id ?? null, business_id: businessId, error: toErrorMessage(error) },
      'error'
    )
  );
}

async function handlePaymentFailed(intent: Stripe.PaymentIntent, supabase: AdminClient) {
  const type = intent.metadata.type ?? 'booking';

  if (type === 'product_order' || type === 'order') {
    const { error } = await supabase.from('orders').update({ status: 'refunded' }).eq('payment_intent_id', intent.id);
    if (error) {
      logWebhook('order_payment_failed_update_failed', { payment_intent_id: intent.id, error: error.message }, 'error');
    }
    return;
  }

  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('payment_intent_id', intent.id);
  if (error) {
    logWebhook('booking_cancel_failed', { payment_intent_id: intent.id, error: error.message }, 'error');
  }
}

async function handleAccountUpdated(account: Stripe.Account, supabase: AdminClient) {
  if (!account.charges_enabled || !account.details_submitted) {
    return;
  }

  const { error } = await supabase.from('businesses').update({ stripe_onboarded: true }).eq('stripe_account_id', account.id);
  if (error) {
    logWebhook('stripe_account_update_failed', { stripe_account_id: account.id, error: error.message }, 'error');
  }
}

async function triggerBookingLifecycle(bookingId: string, paymentIntentId?: string) {
  const url = process.env.BOOKING_LIFECYCLE_FUNCTION_URL;
  if (!url) {
    logWebhook('booking_lifecycle_missing_config', { payment_intent_id: paymentIntentId ?? null, booking_id: bookingId }, 'warn');
    return;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_CLOUD_FUNCTION_TOKEN ?? ''}`
    },
    body: JSON.stringify({ bookingId, paymentIntentId })
  });

  if (!res.ok) {
    throw new Error(`Lifecycle function returned ${res.status}`);
  }
}

async function triggerOrderLifecycle(payload: {
  orderId: string | null;
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  } | null;
  items: Array<{ productId: string; name: string; emoji: string; price: number; quantity: number }>;
  total: number;
  paymentIntentId: string;
}) {
  const url = process.env.ORDER_LIFECYCLE_FUNCTION_URL;
  if (!url) {
    logWebhook('order_lifecycle_missing_config', { payment_intent_id: payload.paymentIntentId, business_id: payload.businessId }, 'warn');
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

function logWebhook(event: string, payload: Record<string, unknown>, level: 'log' | 'warn' | 'error' = 'log') {
  console[level]('[webhook]', JSON.stringify({ event, ...payload }));
}

function parseMetadataJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

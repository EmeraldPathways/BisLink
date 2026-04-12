import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const config = {
  api: {
    bodyParser: false,
  },
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(intent, supabase)
      break
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(intent, supabase)
      break
    }
    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      await handleAccountUpdated(account, supabase)
      break
    }
    default:
      // Return 200 for unhandled events — prevents Stripe retrying indefinitely
      break
  }

  return NextResponse.json({ received: true })
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function handlePaymentSucceeded(
  intent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>
) {
  const type = intent.metadata.type ?? 'booking'

  if (type === 'product_order') {
    await handleProductOrder(intent, supabase)
  } else {
    await handleBookingPayment(intent, supabase)
  }
}

// ─── Booking payment ──────────────────────────────────────────────────────────

async function handleBookingPayment(
  intent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>
) {
  const { customerEmail, customerName } = intent.metadata

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed', payment_status: 'paid' })
    .eq('payment_intent_id', intent.id)
    .select('id, business_id, start_time, amount_paid, customer_name, customer_email')
    .single()

  if (error || !booking) {
    console.error('[webhook] Failed to confirm booking:', intent.id, error)
    return
  }

  // Upsert customer record
  await supabase.from('customers').upsert(
    {
      business_id: booking.business_id,
      name: customerName,
      email: customerEmail,
      last_booking_at: booking.start_time,
      first_booking_at: booking.start_time,
    },
    { onConflict: 'business_id,email', ignoreDuplicates: false }
  )

  await supabase.rpc('increment_customer_stats', {
    p_business_id: booking.business_id,
    p_email: customerEmail,
    p_amount: booking.amount_paid ?? 0,
    p_booking_at: booking.start_time,
  })

  // Fire and forget — webhook must return fast
  triggerBookingLifecycle(booking.id).catch((err) =>
    console.error('[webhook] Lifecycle trigger failed:', err)
  )
}

// ─── Product order ────────────────────────────────────────────────────────────

async function handleProductOrder(
  intent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>
) {
  const { businessId, customerName, customerEmail, lineItems } = intent.metadata
  const items = JSON.parse(lineItems) as {
    productId: string
    name: string
    emoji: string
    price: number
    quantity: number
  }[]

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const now = new Date().toISOString()

  await supabase.from('customers').upsert(
    {
      business_id: businessId,
      name: customerName,
      email: customerEmail,
      last_booking_at: now,
      first_booking_at: now,
    },
    { onConflict: 'business_id,email', ignoreDuplicates: false }
  )

  await supabase.rpc('increment_customer_stats', {
    p_business_id: businessId,
    p_email: customerEmail,
    p_amount: total,
    p_booking_at: now,
  })

  triggerOrderLifecycle({
    businessId,
    customerName,
    customerEmail,
    items,
    total,
    paymentIntentId: intent.id,
  }).catch((err) => console.error('[webhook] Order lifecycle trigger failed:', err))
}

// ─── Payment failed ───────────────────────────────────────────────────────────

async function handlePaymentFailed(
  intent: Stripe.PaymentIntent,
  supabase: ReturnType<typeof createClient>
) {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('payment_intent_id', intent.id)

  if (error) {
    console.error('[webhook] Failed to cancel booking:', intent.id, error)
  }
}

// ─── Stripe Connect onboarding complete ──────────────────────────────────────

async function handleAccountUpdated(
  account: Stripe.Account,
  supabase: ReturnType<typeof createClient>
) {
  if (account.charges_enabled && account.details_submitted) {
    const { error } = await supabase
      .from('businesses')
      .update({ stripe_onboarded: true })
      .eq('stripe_account_id', account.id)

    if (error) {
      console.error('[webhook] Failed to update stripe_onboarded:', account.id, error)
    }
  }
}

// ─── Cloud Function triggers ──────────────────────────────────────────────────

async function triggerBookingLifecycle(bookingId: string) {
  const url = process.env.BOOKING_LIFECYCLE_FUNCTION_URL
  if (!url) {
    console.warn('[webhook] BOOKING_LIFECYCLE_FUNCTION_URL not set')
    return
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_CLOUD_FUNCTION_TOKEN ?? ''}`,
    },
    body: JSON.stringify({ bookingId }),
  })

  if (!res.ok) throw new Error(`Lifecycle function returned ${res.status}`)
}

async function triggerOrderLifecycle(payload: {
  businessId: string
  customerName: string
  customerEmail: string
  items: { productId: string; name: string; emoji: string; price: number; quantity: number }[]
  total: number
  paymentIntentId: string
}) {
  const url = process.env.ORDER_LIFECYCLE_FUNCTION_URL
  if (!url) {
    console.warn('[webhook] ORDER_LIFECYCLE_FUNCTION_URL not set')
    return
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GOOGLE_CLOUD_FUNCTION_TOKEN ?? ''}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`Order lifecycle returned ${res.status}`)
}

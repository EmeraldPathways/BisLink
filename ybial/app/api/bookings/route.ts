import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const BookingSchema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { businessId, serviceId, startTime, customerName, customerEmail, customerPhone } =
      parsed.data

    const supabase = createClient()

    // 1. Fetch business + service in parallel
    const [{ data: business, error: bizError }, { data: service, error: svcError }] =
      await Promise.all([
        supabase
          .from('businesses')
          .select('id, stripe_account_id, stripe_onboarded, timezone')
          .eq('id', businessId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('services')
          .select('id, name, duration_minutes, buffer_after, price, currency')
          .eq('id', serviceId)
          .eq('business_id', businessId)
          .eq('is_active', true)
          .single(),
      ])

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }
    if (svcError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    if (!business.stripe_onboarded || !business.stripe_account_id) {
      return NextResponse.json({ error: 'Business payments not configured' }, { status: 400 })
    }

    // 2. Calculate end time
    const start = new Date(startTime)
    const end = new Date(start.getTime() + service.duration_minutes * 60 * 1000)

    // 3. Check for overlapping confirmed/pending bookings
    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('business_id', businessId)
      .in('status', ['pending', 'confirmed'])
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString())

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
    }

    // 4. Check against blocked times
    const { data: blocked } = await supabase
      .from('blocked_times')
      .select('id')
      .eq('business_id', businessId)
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString())

    if (blocked && blocked.length > 0) {
      return NextResponse.json({ error: 'Slot is blocked' }, { status: 409 })
    }

    // 5. Create Stripe PaymentIntent on the connected account
    const paymentIntent = await stripe.paymentIntents.create({
      amount: service.price,
      currency: service.currency,
      automatic_payment_methods: { enabled: true },
      application_fee_amount: 0, // v1: no platform cut
      transfer_data: {
        destination: business.stripe_account_id,
      },
      metadata: {
        type: 'booking',
        businessId,
        serviceId,
        customerEmail,
        customerName,
        startTime,
      },
    })

    // 6. Insert pending booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        business_id: businessId,
        service_id: serviceId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone ?? null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'pending',
        payment_status: 'unpaid',
        payment_intent_id: paymentIntent.id,
        amount_paid: service.price,
        currency: service.currency,
      })
      .select('id')
      .single()

    if (bookingError || !booking) {
      // Clean up the PaymentIntent if booking insert fails
      await stripe.paymentIntents.cancel(paymentIntent.id)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err) {
    console.error('[POST /api/bookings]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

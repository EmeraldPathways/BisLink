import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { writeAppLog } from '@/lib/app-logs';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { getStripe } from '@/lib/stripe/client';

const schema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(req, 'bookings'), 10, 60_000);
    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many booking attempts. Please try again shortly.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const stripe = getStripe();
    if (!stripe) {
      await writeAppLog({
        level: 'warn',
        source: 'api.bookings',
        event: 'stripe_not_configured',
        message: 'Stripe is not configured for booking creation',
        context: { business_id: parsed.data.businessId }
      });
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const { businessId, serviceId, startTime, customerName, customerEmail, customerPhone } = parsed.data;
    const supabase = createAdminClient() ?? createClient();

    const [{ data: business, error: bizError }, { data: service, error: svcError }] = await Promise.all([
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
        .single()
    ]);

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }
    if (svcError || !service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    if (!business.stripe_onboarded || !business.stripe_account_id) {
      return NextResponse.json({ error: 'Business payments not configured' }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration_minutes * 60 * 1000);

    const { data: conflicts } = await supabase
      .from('bookings')
      .select('id')
      .eq('business_id', businessId)
      .in('status', ['pending', 'confirmed'])
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString());

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });
    }

    const { data: blocked } = await supabase
      .from('blocked_times')
      .select('id')
      .eq('business_id', businessId)
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString());

    if (blocked && blocked.length > 0) {
      return NextResponse.json({ error: 'Slot is blocked' }, { status: 409 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: service.price,
      currency: service.currency,
      automatic_payment_methods: { enabled: true },
      application_fee_amount: 0,
      transfer_data: {
        destination: business.stripe_account_id
      },
      metadata: {
        type: 'booking',
        businessId,
        serviceId,
        customerEmail,
        customerName,
        customerPhone: customerPhone ?? '',
        startTime
      }
    });

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
        review_token: crypto.randomUUID()
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      await stripe.paymentIntents.cancel(paymentIntent.id);
      await writeAppLog({
        level: 'error',
        source: 'api.bookings',
        event: 'booking_create_failed',
        message: 'Failed to persist booking after creating payment intent',
        context: {
          business_id: businessId,
          service_id: serviceId,
          payment_intent_id: paymentIntent.id,
          error: bookingError?.message ?? 'Booking insert returned no row'
        }
      });
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('[POST /api/bookings]', error);
    await writeAppLog({
      level: 'error',
      source: 'api.bookings',
      event: 'unexpected_error',
      message: 'Unhandled error in POST /api/bookings',
      context: { error: error instanceof Error ? error.message : String(error) }
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

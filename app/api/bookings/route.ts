import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { mergeDateAndTime } from '@/lib/utils/availability';
import { demoAvailability, demoBlockedTimes, demoBookings, demoBusiness, demoServices } from '@/lib/demo-data';
import { getStripe } from '@/lib/stripe/client';

const schema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional()
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { businessId, serviceId, startTime, customerName, customerEmail, customerPhone } = parsed.data;
  const stripe = getStripe();
  const supabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseReady || businessId === demoBusiness.id) {
    const service = demoServices.find((item) => item.id === serviceId && item.business_id === businessId && item.is_active);
    if (!service) return NextResponse.json({ error: 'Service not found or inactive' }, { status: 400 });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration_minutes * 60000);
    const weekday = start.getDay();
    const availability = demoAvailability.find((item) => item.day_of_week === weekday && item.business_id === businessId);
    if (!availability) return NextResponse.json({ error: 'Outside availability hours' }, { status: 400 });

    const slotStart = mergeDateAndTime(start.toISOString().slice(0, 10), availability.start_time);
    const slotEnd = mergeDateAndTime(start.toISOString().slice(0, 10), availability.end_time);
    if (start < slotStart || end > slotEnd) return NextResponse.json({ error: 'Outside availability hours' }, { status: 400 });

    const overlaps = demoBookings.some((booking) => {
      if (booking.business_id !== businessId || booking.status === 'cancelled') return false;
      return start < new Date(booking.end_time) && end > new Date(booking.start_time);
    });
    if (overlaps) return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });

    const blocked = demoBlockedTimes.some((item) => start < new Date(item.end_time) && end > new Date(item.start_time));
    if (blocked) return NextResponse.json({ error: 'Outside availability hours' }, { status: 400 });

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: service.price,
        currency: service.currency,
        automatic_payment_methods: { enabled: true },
        application_fee_amount: 0,
        metadata: { businessId, serviceId, startTime, customerName, customerEmail, customerPhone: customerPhone ?? '' }
      });

      return NextResponse.json({
        bookingId: crypto.randomUUID(),
        clientSecret: paymentIntent.client_secret
      });
    }

    return NextResponse.json({
      bookingId: crypto.randomUUID(),
      clientSecret: 'pi_mock_secret_demo'
    });
  }

  const supabase = createClient();
  const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).eq('business_id', businessId).eq('is_active', true).maybeSingle();
  if (!service) return NextResponse.json({ error: 'Service not found or inactive' }, { status: 400 });

  const start = new Date(startTime);
  const end = new Date(start.getTime() + service.duration_minutes * 60000);
  const weekday = start.getDay();
  const [{ data: availability }, { data: bookings }, { data: blockedTimes }, { data: business }] = await Promise.all([
    supabase.from('availability').select('start_time,end_time').eq('business_id', businessId).eq('day_of_week', weekday).eq('is_active', true).maybeSingle(),
    supabase.from('bookings').select('start_time,end_time,status').eq('business_id', businessId).neq('status', 'cancelled'),
    supabase.from('blocked_times').select('start_time,end_time').eq('business_id', businessId),
    supabase.from('businesses').select('stripe_account_id,currency').eq('id', businessId).maybeSingle()
  ]);

  if (!availability) return NextResponse.json({ error: 'Outside availability hours' }, { status: 400 });

  const windowStart = mergeDateAndTime(start.toISOString().slice(0, 10), availability.start_time);
  const windowEnd = mergeDateAndTime(start.toISOString().slice(0, 10), availability.end_time);
  if (start < windowStart || end > windowEnd) return NextResponse.json({ error: 'Outside availability hours' }, { status: 400 });

  const overlaps = (bookings ?? []).some((booking) => start < new Date(booking.end_time) && end > new Date(booking.start_time));
  if (overlaps) return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });

  const blocked = (blockedTimes ?? []).some((item) => start < new Date(item.end_time) && end > new Date(item.start_time));
  if (blocked) return NextResponse.json({ error: 'Outside availability hours' }, { status: 400 });

  const paymentIntent = stripe
    ? await stripe.paymentIntents.create({
        amount: service.price,
        currency: business?.currency ?? service.currency ?? 'usd',
        automatic_payment_methods: { enabled: true },
        application_fee_amount: 0,
        transfer_data: business?.stripe_account_id ? { destination: business.stripe_account_id } : undefined,
        metadata: { businessId, serviceId, startTime, customerName, customerEmail, customerPhone: customerPhone ?? '' }
      })
    : null;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      business_id: businessId,
      service_id: serviceId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'pending',
      payment_status: 'unpaid',
      payment_intent_id: paymentIntent?.id,
      amount_paid: service.price,
      currency: business?.currency ?? service.currency ?? 'usd'
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    bookingId: booking.id,
    clientSecret: paymentIntent?.client_secret ?? 'pi_mock_secret_demo'
  });
}

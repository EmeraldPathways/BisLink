import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { demoBookings, demoBusiness, demoReviews } from '@/lib/demo-data';

const schema = z.object({
  bookingId: z.string().min(1),
  token: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(4).max(1200)
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { bookingId, token, rating, text } = parsed.data;
  const supabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const demoBooking = demoBookings.find((booking) => booking.id === bookingId);

  if (!supabaseReady || demoBooking?.business_id === demoBusiness.id) {
    if (!demoBooking || demoBooking.review_token !== token) {
      return NextResponse.json({ error: 'Invalid review token' }, { status: 403 });
    }

    return NextResponse.json({
      review: {
        id: crypto.randomUUID(),
        booking_id: bookingId,
        business_id: demoBooking.business_id,
        customer_name: demoBooking.customer_name,
        customer_email: demoBooking.customer_email,
        rating,
        text,
        is_verified: true,
        is_published: true,
        created_at: new Date().toISOString()
      },
      totalReviews: demoReviews.filter((review) => review.is_published).length + 1
    });
  }

  const supabase = createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('id,business_id,customer_name,customer_email,review_token')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking || booking.review_token !== token) {
    return NextResponse.json({ error: 'Invalid review token' }, { status: 403 });
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: booking.id,
      business_id: booking.business_id,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      rating,
      text,
      is_verified: true,
      is_published: true
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: aggregate } = await supabase
    .from('reviews')
    .select('rating')
    .eq('business_id', booking.business_id)
    .eq('is_published', true);

  return NextResponse.json({
    review,
    totalReviews: aggregate?.length ?? 1
  });
}

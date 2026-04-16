import { z } from 'zod';
import { NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { createAdminClient, createClient } from '@/lib/supabase/server';

const schema = z.object({
  bookingId: z.string().min(1),
  token: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(4).max(1200)
});

export async function POST(req: Request) {
  const rateLimit = checkRateLimit(getRateLimitKey(req, 'reviews'), 5, 60_000);
  if (!rateLimit.ok) {
    return NextResponse.json({ error: 'Too many review submissions. Please try again shortly.' }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { bookingId, token, rating, text } = parsed.data;
  const supabase = createAdminClient() ?? createClient();
  const { data: booking } = await supabase
    .from('bookings')
    .select('id,business_id,customer_name,customer_email,review_token')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking || booking.review_token !== token) {
    return NextResponse.json({ error: 'Invalid review token' }, { status: 403 });
  }

  const { data: existingReview } = await supabase.from('reviews').select('id').eq('booking_id', booking.id).limit(1).maybeSingle();
  if (existingReview) {
    return NextResponse.json({ error: 'Review already submitted for this booking' }, { status: 409 });
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

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Review already submitted for this booking' }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count: totalReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', booking.business_id)
    .eq('is_published', true);

  return NextResponse.json({
    review,
    totalReviews: totalReviews ?? 0
  });
}

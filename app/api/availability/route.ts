import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateAvailableSlots } from '@/lib/utils/availability';
import { demoAvailability, demoBlockedTimes, demoBookings, demoBusiness, demoServices } from '@/lib/demo-data';

const query = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = query.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { businessId, serviceId, date } = parsed.data;
  const supabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseReady || businessId === demoBusiness.id) {
    const service = demoServices.find((item) => item.id === serviceId && item.business_id === businessId && item.is_active);
    if (!service) return NextResponse.json({ error: 'Service not found or inactive' }, { status: 400 });

    const weekday = new Date(`${date}T00:00:00`).getDay();
    const availability = demoAvailability.find((item) => item.business_id === businessId && item.day_of_week === weekday && item.is_active) ?? null;
    const available = calculateAvailableSlots(
      availability,
      service.duration_minutes,
      service.buffer_after,
      demoBookings
        .filter((booking) => booking.business_id === businessId && booking.status !== 'cancelled')
        .map((booking) => ({ start_time: new Date(booking.start_time), end_time: new Date(booking.end_time) })),
      demoBlockedTimes.filter((blocked) => blocked.business_id === businessId).map((blocked) => ({
        start_time: new Date(blocked.start_time),
        end_time: new Date(blocked.end_time)
      })),
      new Date(`${date}T00:00:00`),
      demoBusiness.timezone
    );

    return NextResponse.json({ available, timezone: demoBusiness.timezone });
  }

  const supabase = createClient();
  const [{ data: service }, { data: business }] = await Promise.all([
    supabase.from('services').select('*').eq('id', serviceId).eq('business_id', businessId).eq('is_active', true).maybeSingle(),
    supabase.from('businesses').select('timezone').eq('id', businessId).maybeSingle()
  ]);

  if (!service) return NextResponse.json({ error: 'Service not found or inactive' }, { status: 400 });

  const weekday = new Date(`${date}T00:00:00`).getDay();
  const [{ data: availability }, { data: bookings }, { data: blockedTimes }] = await Promise.all([
    supabase.from('availability').select('start_time,end_time').eq('business_id', businessId).eq('day_of_week', weekday).eq('is_active', true).maybeSingle(),
    supabase
      .from('bookings')
      .select('start_time,end_time')
      .eq('business_id', businessId)
      .neq('status', 'cancelled')
      .gte('start_time', `${date}T00:00:00`)
      .lt('start_time', `${date}T23:59:59`),
    supabase
      .from('blocked_times')
      .select('start_time,end_time')
      .eq('business_id', businessId)
      .gte('start_time', `${date}T00:00:00`)
      .lt('start_time', `${date}T23:59:59`)
  ]);

  const available = calculateAvailableSlots(
    availability,
    service.duration_minutes,
    service.buffer_after ?? 0,
    (bookings ?? []).map((booking) => ({ start_time: new Date(booking.start_time), end_time: new Date(booking.end_time) })),
    (blockedTimes ?? []).map((blocked) => ({ start_time: new Date(blocked.start_time), end_time: new Date(blocked.end_time) })),
    new Date(`${date}T00:00:00`),
    business?.timezone ?? demoBusiness.timezone
  );

  return NextResponse.json({ available, timezone: business?.timezone ?? demoBusiness.timezone });
}

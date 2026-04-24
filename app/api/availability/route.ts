import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { calculateAvailableSlots } from '@/lib/utils/availability';

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
  const supabase = createAdminClient() ?? (await createClient());
  const [{ data: service }, { data: business }] = await Promise.all([
    supabase
      .from('services')
      .select('id,business_id,duration_minutes,buffer_after,is_active')
      .eq('id', serviceId)
      .eq('business_id', businessId)
      .eq('is_active', true)
      .maybeSingle(),
    supabase.from('businesses').select('id,timezone,is_active').eq('id', businessId).eq('is_active', true).maybeSingle()
  ]);

  if (!business) return NextResponse.json({ error: 'Business not found or inactive' }, { status: 404 });
  if (!service) return NextResponse.json({ error: 'Service not found or inactive' }, { status: 404 });

  const weekday = new Date(`${date}T00:00:00`).getDay();
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const [{ data: availability }, { data: bookings }, { data: blockedTimes }] = await Promise.all([
    supabase.from('availability').select('start_time,end_time').eq('business_id', businessId).eq('day_of_week', weekday).eq('is_active', true).maybeSingle(),
    supabase
      .from('bookings')
      .select('start_time,end_time')
      .eq('business_id', businessId)
      .neq('status', 'cancelled')
      .lt('start_time', dayEnd.toISOString())
      .gt('end_time', dayStart.toISOString()),
    supabase
      .from('blocked_times')
      .select('start_time,end_time')
      .eq('business_id', businessId)
      .lt('start_time', dayEnd.toISOString())
      .gt('end_time', dayStart.toISOString())
  ]);

  const available = calculateAvailableSlots(
    availability,
    service.duration_minutes,
    service.buffer_after ?? 0,
    (bookings ?? []).map((booking) => ({ start_time: new Date(booking.start_time), end_time: new Date(booking.end_time) })),
    (blockedTimes ?? []).map((blocked) => ({ start_time: new Date(blocked.start_time), end_time: new Date(blocked.end_time) })),
    dayStart,
    business.timezone ?? 'America/New_York'
  );

  return NextResponse.json({ available, timezone: business.timezone ?? 'America/New_York' });
}

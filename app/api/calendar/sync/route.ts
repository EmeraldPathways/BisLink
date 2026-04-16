import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createGoogleCalendarEvent } from '@/lib/google/calendar';

const schema = z.object({ bookingId: z.string().uuid() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = schema.safeParse({ bookingId: url.searchParams.get('bookingId') });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const event = await createGoogleCalendarEvent(parsed.data.bookingId);
    return NextResponse.redirect(new URL(`/dashboard?calendarEvent=${encodeURIComponent(event.id)}`, url.origin));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Calendar sync failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const event = await createGoogleCalendarEvent(parsed.data.bookingId);
    return NextResponse.json({ eventId: event.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Calendar sync failed' }, { status: 500 });
  }
}

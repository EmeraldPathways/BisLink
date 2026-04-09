import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createGoogleCalendarEvent } from '@/lib/google/calendar';

const schema = z.object({ bookingId: z.string().uuid() });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const event = await createGoogleCalendarEvent();
  return NextResponse.json({ eventId: event.id });
}

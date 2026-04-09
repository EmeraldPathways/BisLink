import { z } from 'zod';
import { NextResponse } from 'next/server';

const query = z.object({ businessId: z.string(), serviceId: z.string(), date: z.string() });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = query.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  return NextResponse.json({ available: ['07:00', '08:00', '09:00', '10:00'], timezone: 'America/New_York' });
}

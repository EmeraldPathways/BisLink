import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  reason: z.string().trim().max(120).optional().or(z.literal(''))
});

export async function POST(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (new Date(parsed.data.end_time) <= new Date(parsed.data.start_time)) {
    return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
  }

  const { supabase, business } = owner;
  const { data, error } = await supabase
    .from('blocked_times')
    .insert({
      business_id: business.id,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      reason: parsed.data.reason || null
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blockedTime: data });
}

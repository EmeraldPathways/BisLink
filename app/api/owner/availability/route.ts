import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  is_active: z.boolean(),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
});

export async function POST(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (
    parsed.data.is_active &&
    (!parsed.data.start_time || !parsed.data.end_time)
  ) {
    return NextResponse.json(
      { error: 'Start and end time are required for active days' },
      { status: 400 },
    );
  }

  const { supabase, business } = owner;
  const { data, error } = await supabase
    .from('availability')
    .upsert(
      {
        business_id: business.id,
        day_of_week: parsed.data.day_of_week,
        is_active: parsed.data.is_active,
        start_time: parsed.data.start_time
          ? `${parsed.data.start_time}:00`
          : '09:00:00',
        end_time: parsed.data.end_time
          ? `${parsed.data.end_time}:00`
          : '17:00:00',
      },
      { onConflict: 'business_id,day_of_week' },
    )
    .select('*')
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ availability: data });
}

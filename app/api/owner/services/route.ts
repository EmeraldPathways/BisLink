import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  emoji: z.string().trim().min(1).max(8),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).default(''),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  price: z.coerce.number().int().min(0).max(10000000),
  tag: z.string().trim().max(40).optional().or(z.literal('')),
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

  const { supabase, business } = owner;
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id);

  const { data, error } = await supabase
    .from('services')
    .insert({
      business_id: business.id,
      emoji: parsed.data.emoji,
      name: parsed.data.name,
      description: parsed.data.description,
      duration_minutes: parsed.data.duration_minutes,
      price: parsed.data.price,
      currency: business.currency,
      is_active: true,
      sort_order: count ?? 0,
      tag: parsed.data.tag || null,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ service: data });
}

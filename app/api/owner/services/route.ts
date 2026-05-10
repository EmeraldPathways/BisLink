import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { isMissingColumnError } from '@/lib/supabase/schema-compat';

const schema = z.object({
  emoji: z.string().trim().min(1).max(8),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).default(''),
  duration_minutes: z.coerce.number().int().min(5).max(480),
  price: z.coerce.number().int().min(0).max(10000000),
  tag: z.string().trim().max(40).optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
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

  const insertPayload = {
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
    image_url: parsed.data.image_url || null,
  };

  let { data, error } = await supabase
    .from('services')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error && isMissingColumnError(error, 'services', 'image_url')) {
    const { image_url: _imageUrl, ...legacyPayload } = insertPayload;
    ({ data, error } = await supabase.from('services').insert(legacyPayload).select('*').single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/services');
  revalidatePath(`/${business.slug}`);

  return NextResponse.json({ service: data });
}

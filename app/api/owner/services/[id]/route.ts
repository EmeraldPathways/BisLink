import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { isMissingColumnError } from '@/lib/supabase/schema-compat';

const schema = z.object({
  emoji: z.string().trim().min(1).max(8).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  duration_minutes: z.coerce.number().int().min(5).max(480).optional(),
  price: z.coerce.number().int().min(0).max(10000000).optional(),
  tag: z.string().trim().max(40).optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    updates[key] = (key === 'tag' || key === 'image_url') && value === '' ? null : value;
  }

  const { supabase, business } = owner;
  let { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .eq('business_id', business.id)
    .select('*')
    .single();

  if (error && 'image_url' in updates && isMissingColumnError(error, 'services', 'image_url')) {
    const { image_url: _imageUrl, ...legacyUpdates } = updates;
    ({ data, error } = await supabase.from('services').update(legacyUpdates).eq('id', id).eq('business_id', business.id).select('*').single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/services');
  revalidatePath(`/${business.slug}`);

  return NextResponse.json({ service: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const owner = await requireOwnerBusiness();
  if (!owner)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { supabase, business } = owner;
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('business_id', business.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/services');
  revalidatePath(`/${business.slug}`);

  return NextResponse.json({ success: true });
}

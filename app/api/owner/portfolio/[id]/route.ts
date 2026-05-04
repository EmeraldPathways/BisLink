import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  title: z.string().trim().max(80).optional().or(z.literal('')),
  description: z.string().trim().max(180).optional().or(z.literal('')),
  media_type: z.enum(['image', 'video_link']).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  external_url: z.string().url().optional().or(z.literal('')),
  sort_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional()
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if ((key === 'title' || key === 'description' || key === 'image_url' || key === 'external_url') && value === '') {
      updates[key] = null;
    } else {
      updates[key] = value;
    }
  }

  const { data, error } = await owner.supabase
    .from('portfolio_items')
    .update(updates)
    .eq('id', id)
    .eq('business_id', owner.business.id)
    .select('id,business_id,title,description,media_type,image_url,external_url,sort_order,is_active,created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/link');
  revalidatePath(`/${owner.business.slug}`);

  return NextResponse.json({ item: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await owner.supabase.from('portfolio_items').delete().eq('id', id).eq('business_id', owner.business.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/link');
  revalidatePath(`/${owner.business.slug}`);

  return NextResponse.json({ success: true });
}

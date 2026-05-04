import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  title: z.string().trim().max(80).optional().or(z.literal('')),
  description: z.string().trim().max(180).optional().or(z.literal('')),
  media_type: z.enum(['image', 'video_link']).default('image'),
  image_url: z.string().url().optional().or(z.literal('')),
  external_url: z.string().url().optional().or(z.literal('')),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true)
});

export async function GET() {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await owner.supabase
    .from('portfolio_items')
    .select('id,business_id,title,description,media_type,image_url,external_url,sort_order,is_active,created_at')
    .eq('business_id', owner.business.id)
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await owner.supabase
    .from('portfolio_items')
    .insert({
      business_id: owner.business.id,
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      media_type: parsed.data.media_type,
      image_url: parsed.data.image_url || null,
      external_url: parsed.data.external_url || null,
      sort_order: parsed.data.sort_order,
      is_active: parsed.data.is_active
    })
    .select('id,business_id,title,description,media_type,image_url,external_url,sort_order,is_active,created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/link');
  revalidatePath(`/${owner.business.slug}`);

  return NextResponse.json({ item: data });
}

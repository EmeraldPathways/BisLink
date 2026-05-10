import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { getDefaultProductEmoji } from '@/lib/product-emoji';

const schema = z.object({
  emoji: z.string().trim().min(1).max(8).optional().default(getDefaultProductEmoji()),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).default(''),
  category: z.string().trim().max(80).optional().or(z.literal('')),
  price: z.coerce.number().int().min(0).max(10000000),
  original_price: z.coerce.number().int().min(0).max(10000000).optional(),
  badge: z.string().trim().max(40).optional().or(z.literal('')),
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
  const [{ count: totalCount }, { count: activeCount }] = await Promise.all([
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('is_active', true),
  ]);

  if ((activeCount ?? 0) >= 10) {
    return NextResponse.json(
      { error: 'Maximum of 10 active products per business' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      business_id: business.id,
      emoji: parsed.data.emoji,
      name: parsed.data.name,
      description: parsed.data.description,
      category: parsed.data.category || null,
      price: parsed.data.price,
      original_price: parsed.data.original_price ?? null,
      badge: parsed.data.badge || null,
      image_url: parsed.data.image_url || null,
      is_active: true,
      in_stock: true,
      is_digital: false,
      sort_order: totalCount ?? 0,
      rating: 0,
      review_count: 0,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/products');
  revalidatePath(`/${business.slug}`);

  return NextResponse.json({ product: data });
}

import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  emoji: z.string().trim().min(1).max(8).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(80).optional().or(z.literal('')),
  price: z.coerce.number().int().min(0).max(10000000).optional(),
  original_price: z.coerce
    .number()
    .int()
    .min(0)
    .max(10000000)
    .optional()
    .nullable(),
  badge: z.string().trim().max(40).optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().optional(),
  in_stock: z.boolean().optional(),
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

  const { supabase, business } = owner;

  if (parsed.data.is_active === true) {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('is_active', true);
    if ((count ?? 0) >= 10) {
      const { data: existing } = await supabase
        .from('products')
        .select('is_active')
        .eq('id', id)
        .eq('business_id', business.id)
        .single();
      if (!existing?.is_active) {
        return NextResponse.json(
          { error: 'Maximum of 10 active products per business' },
          { status: 400 },
        );
      }
    }
  }

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if ((key === 'badge' || key === 'category' || key === 'image_url') && value === '') {
      updates[key] = null;
    } else {
      updates[key] = value;
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .eq('business_id', business.id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/products');
  revalidatePath(`/${business.slug}`);

  return NextResponse.json({ product: data });
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
    .from('products')
    .delete()
    .eq('id', id)
    .eq('business_id', business.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/products');
  revalidatePath(`/${business.slug}`);

  return NextResponse.json({ success: true });
}

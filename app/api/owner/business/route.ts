import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOwnerBusiness } from '@/lib/owner-api';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(120),
  bio: z.string().trim().max(1000).default(''),
  tagline: z.string().trim().max(140).optional().or(z.literal('')),
  full_bio: z.string().trim().max(4000).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  address: z.string().trim().max(240).optional().or(z.literal('')),
  instagram_handle: z.string().trim().max(120).optional().or(z.literal('')),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function PATCH(req: NextRequest) {
  const owner = await requireOwnerBusiness();
  if (!owner)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { supabase, business } = owner;
  if (parsed.data.slug !== business.slug) {
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', parsed.data.slug)
      .neq('id', business.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 409 },
      );
    }
  }

  const payload = {
    ...parsed.data,
    tagline: parsed.data.tagline || null,
    full_bio: parsed.data.full_bio || null,
    location: parsed.data.location || null,
    address: parsed.data.address || null,
    instagram_handle: parsed.data.instagram_handle || null,
  };

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', business.id)
    .select('*')
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business: data });
}

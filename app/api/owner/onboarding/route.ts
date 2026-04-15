import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils/slugify';

const serviceSchema = z.object({
  emoji: z.string().trim().min(1).max(8),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).default(''),
  duration_minutes: z.number().int().min(5).max(480),
  price: z.number().int().min(0).max(10000000),
  tag: z.string().trim().max(40).optional().nullable()
});

const availabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_active: z.boolean(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/)
});

const schema = z.object({
  business: z.object({
    name: z.string().trim().min(1).max(120),
    category: z.string().trim().min(1).max(120),
    bio: z.string().trim().max(1000).default(''),
    location: z.string().trim().max(120).default(''),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(64)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional()
  }),
  services: z.array(serviceSchema).min(1).max(10),
  availability: z.array(availabilitySchema).length(7)
});

export async function GET() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: existing } = await supabase
    .from('businesses')
    .select('id,name,category,bio,location,slug,currency,services(*),availability(*)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ onboarding: existing ?? null });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Supabase admin client is not configured' }, { status: 500 });
  }

  const input = parsed.data;
  const desiredSlug = input.business.slug || generateSlug(input.business.name);

  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id,slug')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: slugConflict } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', desiredSlug)
    .neq('owner_id', user.id)
    .maybeSingle();

  if (slugConflict) {
    return NextResponse.json({ error: 'Slug is already taken' }, { status: 409 });
  }

  const businessPayload = {
    owner_id: user.id,
    name: input.business.name,
    category: input.business.category,
    bio: input.business.bio,
    location: input.business.location || null,
    slug: desiredSlug,
    currency: 'usd',
    is_active: true
  };

  let businessId = existingBusiness?.id;
  if (businessId) {
    const { error } = await admin.from('businesses').update(businessPayload).eq('id', businessId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data, error } = await admin.from('businesses').insert(businessPayload).select('id').single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Failed to create business' }, { status: 500 });
    businessId = data.id;
  }

  await admin.from('services').delete().eq('business_id', businessId);
  const { error: servicesError } = await admin.from('services').insert(
    input.services.map((service, index) => ({
      business_id: businessId,
      emoji: service.emoji,
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      currency: 'usd',
      is_active: true,
      sort_order: index,
      tag: service.tag || null
    }))
  );
  if (servicesError) return NextResponse.json({ error: servicesError.message }, { status: 500 });

  await admin.from('availability').delete().eq('business_id', businessId);
  const { error: availabilityError } = await admin.from('availability').insert(
    input.availability.map((item) => ({
      business_id: businessId,
      day_of_week: item.day_of_week,
      is_active: item.is_active,
      start_time: `${item.start_time}:00`,
      end_time: `${item.end_time}:00`
    }))
  );
  if (availabilityError) return NextResponse.json({ error: availabilityError.message }, { status: 500 });

  const { data: business } = await admin.from('businesses').select('id,slug').eq('id', businessId).single();
  return NextResponse.json({ business });
}

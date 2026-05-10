import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BUSINESS_THEME_KEYS } from '@/lib/business-themes';
import { requireOwnerBusiness } from '@/lib/owner-api';
import { getPublicPageMigrationMessage, isMissingColumnError } from '@/lib/supabase/schema-compat';

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(120),
  theme_key: z.enum(BUSINESS_THEME_KEYS),
  bio: z.string().trim().max(1000).default(''),
  photo_url: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  bookings_image_url: z.string().url().optional().or(z.literal('')),
  bookings_title: z.string().trim().max(80).optional().or(z.literal('')),
  bookings_subtitle: z.string().trim().max(180).optional().or(z.literal('')),
  products_image_url: z.string().url().optional().or(z.literal('')),
  products_title: z.string().trim().max(80).optional().or(z.literal('')),
  products_subtitle: z.string().trim().max(180).optional().or(z.literal('')),
  about_image_url: z.string().url().optional().or(z.literal('')),
  about_title: z.string().trim().max(80).optional().or(z.literal('')),
  about_subtitle: z.string().trim().max(180).optional().or(z.literal('')),
  contact_image_url: z.string().url().optional().or(z.literal('')),
  contact_title: z.string().trim().max(80).optional().or(z.literal('')),
  contact_subtitle: z.string().trim().max(180).optional().or(z.literal('')),
  tagline: z.string().trim().max(140).optional().or(z.literal('')),
  full_bio: z.string().trim().max(4000).optional().or(z.literal('')),
  primary_cta_label: z.string().trim().max(40).optional().or(z.literal('')),
  announcement_enabled: z.boolean().optional(),
  announcement_text: z.string().trim().max(180).optional().or(z.literal('')),
  location: z.string().trim().max(120).optional().or(z.literal('')),
  address: z.string().trim().max(240).optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  instagram_handle: z.string().trim().max(120).optional().or(z.literal('')),
  tiktok_handle: z.string().trim().max(120).optional().or(z.literal('')),
  youtube_url: z.string().url().optional().or(z.literal('')),
  whatsapp_number: z.string().trim().max(40).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  google_review_url: z.string().url().optional().or(z.literal('')),
  years_experience: z.coerce.number().int().min(0).max(100).optional().nullable(),
  stat_one_label: z.string().trim().max(40).optional().or(z.literal('')),
  stat_one_value: z.string().trim().max(40).optional().or(z.literal('')),
  stat_two_label: z.string().trim().max(40).optional().or(z.literal('')),
  stat_two_value: z.string().trim().max(40).optional().or(z.literal('')),
  stat_three_label: z.string().trim().max(40).optional().or(z.literal('')),
  stat_three_value: z.string().trim().max(40).optional().or(z.literal('')),
  custom_primary_color: z.string().trim().regex(/^#([0-9A-Fa-f]{6})$/, 'Use a valid hex colour').optional().or(z.literal('')),
  custom_font_pairing: z.enum(['theme-default', 'editorial', 'modern', 'friendly', 'premium']).optional(),
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

  const payload = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value || null];
      }
      return [key, value];
    }),
  );

  const { data, error } = await supabase
    .from('businesses')
    .update(payload)
    .eq('id', business.id)
    .select('*')
    .single();
  if (error) {
    if (
      isMissingColumnError(error, 'businesses', 'announcement_enabled') ||
      isMissingColumnError(error, 'businesses', 'cover_image_url') ||
      isMissingColumnError(error, 'businesses', 'bookings_title')
    ) {
      return NextResponse.json({ error: getPublicPageMigrationMessage() }, { status: 500 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ business: data });
}

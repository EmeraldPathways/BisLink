import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { isBusinessThemeKey, resolveBusinessTheme } from '@/lib/business-themes';
import { createAdminClient, createClient, getUserOrNull } from '@/lib/supabase/server';
import type { BusinessProfile } from '@/types';

type OwnerContext = {
  user: User;
  business: BusinessProfile;
};

async function resolveCurrentOwnerBusiness(): Promise<OwnerContext | { user: User; business: null } | null> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const user = await getUserOrNull(supabase);

  if (!user) return null;

  const businessQuery = (admin ?? supabase).from('businesses').select('*').eq('owner_id', user.id).order('created_at', { ascending: true }).limit(2);
  const { data: businesses, error } = await businessQuery;

  if (error) throw error;
  if (!businesses?.length) return { user, business: null };

  if (businesses.length > 1) {
    console.error('[owner] Multiple businesses found for owner; using earliest row', {
      ownerId: user.id,
      businessIds: businesses.map((business) => business.id)
    });
  }

  return {
    user,
    business: normalizeBusiness(businesses[0] as Record<string, unknown>)
  };
}

export function normalizeBusiness(record: Record<string, unknown>): BusinessProfile {
  const theme = resolveBusinessTheme(
    isBusinessThemeKey(record.theme_key) ? record.theme_key : null
  );

  return {
    id: String(record.id),
    owner_id: String(record.owner_id),
    slug: String(record.slug),
    name: String(record.name),
    category: String(record.category),
    theme_key: theme.key,
    bio: typeof record.bio === 'string' ? record.bio : '',
    tagline: asNullableString(record.tagline),
    full_bio: asNullableString(record.full_bio),
    photo_url: asNullableString(record.photo_url),
    cover_image_url: asNullableString(record.cover_image_url),
    location: asNullableString(record.location),
    address: asNullableString(record.address),
    parking_notes: asNullableString(record.parking_notes),
    google_maps_url: asNullableString(record.google_maps_url),
    website_url: asNullableString(record.website_url),
    instagram_handle: asNullableString(record.instagram_handle),
    tiktok_handle: asNullableString(record.tiktok_handle),
    youtube_url: asNullableString(record.youtube_url),
    whatsapp_number: asNullableString(record.whatsapp_number),
    email: asNullableString(record.email) ?? asNullableString(record.contact_email),
    contact_email: asNullableString(record.contact_email),
    phone: asNullableString(record.phone) ?? asNullableString(record.contact_phone),
    years_experience: typeof record.years_experience === 'number' ? record.years_experience : null,
    google_review_url: asNullableString(record.google_review_url),
    primary_cta_label: asNullableString(record.primary_cta_label),
    announcement_enabled: Boolean(record.announcement_enabled),
    announcement_text: asNullableString(record.announcement_text),
    custom_primary_color: asNullableString(record.custom_primary_color),
    custom_font_pairing: asNullableString(record.custom_font_pairing),
    stat_one_label: asNullableString(record.stat_one_label),
    stat_one_value: asNullableString(record.stat_one_value),
    stat_two_label: asNullableString(record.stat_two_label),
    stat_two_value: asNullableString(record.stat_two_value),
    stat_three_label: asNullableString(record.stat_three_label),
    stat_three_value: asNullableString(record.stat_three_value),
    timezone: typeof record.timezone === 'string' && record.timezone ? record.timezone : 'America/New_York',
    currency: typeof record.currency === 'string' && record.currency ? record.currency : 'usd',
    stripe_account_id: asNullableString(record.stripe_account_id),
    stripe_onboarded: Boolean(record.stripe_onboarded),
    is_active: record.is_active == null ? true : Boolean(record.is_active),
    google_cal_token: record.google_cal_token ?? null,
    microsoft_cal_token: record.microsoft_cal_token ?? null
  };
}

function asNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

export const getCurrentOwnerBusiness = cache(async () => {
  const context = await resolveCurrentOwnerBusiness();

  if (!context?.user) {
    redirect('/login');
  }

  if (!context.business) {
    redirect('/onboarding');
  }

  return context;
});

export async function getCurrentOwnerBusinessForRequest() {
  return resolveCurrentOwnerBusiness();
}

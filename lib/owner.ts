import { cache } from 'react';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { BusinessProfile } from '@/types';

type OwnerContext = {
  user: User;
  business: BusinessProfile;
};

async function resolveCurrentOwnerBusiness(): Promise<OwnerContext | { user: User; business: null } | null> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true })
    .limit(2);

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

function normalizeBusiness(record: Record<string, unknown>): BusinessProfile {
  return {
    id: String(record.id),
    owner_id: String(record.owner_id),
    slug: String(record.slug),
    name: String(record.name),
    category: String(record.category),
    bio: typeof record.bio === 'string' ? record.bio : '',
    tagline: asNullableString(record.tagline),
    full_bio: asNullableString(record.full_bio),
    photo_url: asNullableString(record.photo_url),
    location: asNullableString(record.location),
    address: asNullableString(record.address),
    parking_notes: asNullableString(record.parking_notes),
    website_url: asNullableString(record.website_url),
    instagram_handle: asNullableString(record.instagram_handle),
    tiktok_handle: asNullableString(record.tiktok_handle),
    whatsapp_number: asNullableString(record.whatsapp_number),
    email: asNullableString(record.email) ?? asNullableString(record.contact_email),
    phone: asNullableString(record.phone) ?? asNullableString(record.contact_phone),
    years_experience: typeof record.years_experience === 'number' ? record.years_experience : null,
    google_review_url: asNullableString(record.google_review_url),
    timezone: typeof record.timezone === 'string' && record.timezone ? record.timezone : 'America/New_York',
    currency: typeof record.currency === 'string' && record.currency ? record.currency : 'usd',
    stripe_account_id: asNullableString(record.stripe_account_id),
    stripe_onboarded: Boolean(record.stripe_onboarded),
    is_active: record.is_active == null ? true : Boolean(record.is_active)
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

import { createAdminClient, createClient } from '@/lib/supabase/server';
import type { UserSupportContext } from '@/lib/agents/types';
import { listServices } from '@/lib/service-schema';

function buildPublicUrl(slug: string | null) {
  if (!slug) return null;
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    'https://bislink.app';
  return `${baseUrl.replace(/\/$/, '')}/${slug}`;
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function getUserSupportContext(
  userId: string
): Promise<UserSupportContext> {
  const supabase = createAdminClient() ?? (await createClient());

  const { data: businessRow, error } = await supabase
    .from('businesses')
    .select(
      'id,name,slug,photo_url,cover_image_url,website_url,instagram_handle,tiktok_handle,youtube_url,whatsapp_number,email,contact_email,stripe_onboarded,is_active'
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(userId).catch(() => ({
    data: { user: null }
  }));

  if (!businessRow) {
    return {
      userId,
      email: authUser.user?.email ?? null,
      businessId: null,
      businessName: null,
      publicUrl: null,
      pagePublished: false,
      hasProfileImage: false,
      hasBannerImage: false,
      serviceCount: 0,
      hasAvailability: false,
      stripeConnected: false,
      productCount: 0,
      hasContactLinks: false,
      hasSocialLinks: false,
      subscriptionStatus: null
    };
  }

  const businessId = String(businessRow.id);
  const [servicesResult, availabilityCountResult, productCountResult] = await Promise.all([
    listServices(supabase, businessId),
    supabase
      .from('availability')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_active', true),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('is_active', true)
  ]);

  const serviceCount = servicesResult.data?.filter((service) => service.is_active).length ?? 0;
  const hasContactLinks =
    hasText(businessRow.contact_email) ||
    hasText(businessRow.email) ||
    hasText(businessRow.website_url) ||
    hasText(businessRow.whatsapp_number);
  const hasSocialLinks =
    hasText(businessRow.instagram_handle) ||
    hasText(businessRow.tiktok_handle) ||
    hasText(businessRow.youtube_url);

  return {
    userId,
    email: authUser.user?.email ?? null,
    businessId,
    businessName: businessRow.name ?? null,
    publicUrl: buildPublicUrl(typeof businessRow.slug === 'string' ? businessRow.slug : null),
    pagePublished: Boolean(businessRow.is_active),
    hasProfileImage: hasText(businessRow.photo_url),
    hasBannerImage: hasText(businessRow.cover_image_url),
    serviceCount,
    hasAvailability: Boolean(availabilityCountResult.count && availabilityCountResult.count > 0),
    stripeConnected: Boolean(businessRow.stripe_onboarded),
    productCount: productCountResult.count ?? 0,
    hasContactLinks,
    hasSocialLinks,
    subscriptionStatus: null
  };
}

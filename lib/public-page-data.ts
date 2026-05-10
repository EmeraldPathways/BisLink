import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isMissingRelationError } from '@/lib/supabase/schema-compat';
import { listServices } from '@/lib/service-schema';
import { normalizeBusiness } from '@/lib/owner';
import {
  normalizeCredential,
  normalizePortfolioItem,
  normalizeProduct,
  normalizeReview,
  normalizeService,
  normalizeSpecialism
} from '@/lib/dashboard-data';
import type { PublicPageData } from '@/types';

export async function getPublicBusinessPageBySlug(slug: string): Promise<PublicPageData | null> {
  const supabase = createAdminClient() ?? (await createClient());
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!business) return null;

  const [servicesResult, { data: products }, { data: reviews }, { data: credentials }, { data: specialisms }, portfolioResult] = await Promise.all([
    listServices(supabase, String(business.id), { onlyActive: true }),
    supabase
      .from('products')
      .select('id,business_id,name,description,price,original_price,category,badge,emoji,image_url,is_active,in_stock,is_digital,digital_url,sort_order,rating,review_count')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .eq('in_stock', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('reviews')
      .select('id,business_id,booking_id,customer_name,customer_email,rating,text,is_verified,is_published,created_at')
      .eq('business_id', business.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase.from('credentials').select('id,business_id,label,sort_order').eq('business_id', business.id).order('sort_order', { ascending: true }),
    supabase.from('specialisms').select('id,business_id,label,sort_order').eq('business_id', business.id).order('sort_order', { ascending: true }),
    supabase
      .from('portfolio_items')
      .select('id,business_id,title,description,media_type,image_url,external_url,sort_order,is_active,created_at')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(6)
  ]);

  if (portfolioResult.error && !isMissingRelationError(portfolioResult.error, 'portfolio_items')) {
    throw portfolioResult.error;
  }
  if (servicesResult.error) {
    throw servicesResult.error;
  }

  return {
    business: normalizeBusiness(business as Record<string, unknown>),
    services: (servicesResult.data ?? []).map(normalizeService),
    products: (products ?? []).map(normalizeProduct),
    reviews: (reviews ?? []).map(normalizeReview),
    credentials: (credentials ?? []).map(normalizeCredential),
    specialisms: (specialisms ?? []).map(normalizeSpecialism),
    portfolioItems: (portfolioResult.data ?? []).map(normalizePortfolioItem)
  };
}

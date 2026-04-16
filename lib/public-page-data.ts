import { createAdminClient, createClient } from '@/lib/supabase/server';
import { normalizeBusiness } from '@/lib/owner';
import {
  normalizeCredential,
  normalizeProduct,
  normalizeReview,
  normalizeService,
  normalizeSpecialism
} from '@/lib/dashboard-data';
import type { PublicPageData } from '@/types';

export async function getPublicBusinessPageBySlug(slug: string): Promise<PublicPageData | null> {
  const supabase = createAdminClient() ?? createClient();
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!business) return null;

  const [{ data: services }, { data: products }, { data: reviews }, { data: credentials }, { data: specialisms }] = await Promise.all([
    supabase
      .from('services')
      .select('id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('id,business_id,name,description,price,original_price,category,badge,emoji,image_url,is_active,in_stock,is_digital,digital_url,sort_order,rating,review_count')
      .eq('business_id', business.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('reviews')
      .select('id,business_id,booking_id,customer_name,customer_email,rating,text,is_verified,is_published,created_at')
      .eq('business_id', business.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase.from('credentials').select('id,business_id,label,sort_order').eq('business_id', business.id).order('sort_order', { ascending: true }),
    supabase.from('specialisms').select('id,business_id,label,sort_order').eq('business_id', business.id).order('sort_order', { ascending: true })
  ]);

  return {
    business: normalizeBusiness(business as Record<string, unknown>),
    services: (services ?? []).map(normalizeService),
    products: (products ?? []).map(normalizeProduct),
    reviews: (reviews ?? []).map(normalizeReview),
    credentials: (credentials ?? []).map(normalizeCredential),
    specialisms: (specialisms ?? []).map(normalizeSpecialism)
  };
}

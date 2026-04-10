import { createClient } from '@supabase/supabase-js';
import type { Booking, Business, Customer, Service } from '../types';

const supabaseUrl = process.env.SUPABASE_URL ?? 'https://example.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'service-role-key';

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export async function getBusinessWithOwner(
  businessId: string
): Promise<{ business: Business; ownerEmail: string; ownerFirstName: string } | null> {
  const { data: business, error } = await supabaseAdmin.from('businesses').select('*').eq('id', businessId).maybeSingle<Business>();
  if (error || !business) return null;

  const userResult = await supabaseAdmin.auth.admin.getUserById(business.owner_id);
  const ownerEmail = userResult.data.user?.email ?? '';
  const ownerFirstName = deriveFirstName(
    (userResult.data.user?.user_metadata?.first_name as string | undefined) ??
      (userResult.data.user?.user_metadata?.full_name as string | undefined) ??
      ownerEmail
  );

  return { business, ownerEmail, ownerFirstName };
}

export async function getBookingsInRange(businessId: string, from: Date, to: Date): Promise<Booking[]> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('business_id', businessId)
    .gte('start_time', from.toISOString())
    .lt('start_time', to.toISOString())
    .order('start_time', { ascending: true });

  if (error) return [];
  return (data as Booking[] | null) ?? [];
}

export async function getLastLoginAt(userId: string): Promise<Date | null> {
  const userResult = await supabaseAdmin.auth.admin.getUserById(userId);
  const raw =
    userResult.data.user?.last_sign_in_at ??
    ((userResult.data.user?.app_metadata?.last_login_at as string | undefined) ?? null);
  return raw ? new Date(raw) : null;
}

export async function getLinkVisitCount(businessId: string, days: number): Promise<number> {
  try {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from('link_visits')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', from);
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getServicesForBusiness(businessId: string): Promise<Service[]> {
  const { data, error } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) return [];
  return (data as Service[] | null) ?? [];
}

export async function getCustomersForBusiness(businessId: string): Promise<Customer[]> {
  const { data, error } = await supabaseAdmin.from('customers').select('*').eq('business_id', businessId);
  if (error) return [];
  return (data as Customer[] | null) ?? [];
}

function deriveFirstName(value: string | null | undefined): string {
  if (!value) return 'there';
  return value.trim().split(/\s+/)[0] || 'there';
}

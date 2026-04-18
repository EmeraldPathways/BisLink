import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getCurrentOwnerBusinessForRequest } from '@/lib/owner';

export async function requireOwnerBusiness() {
  const context = await getCurrentOwnerBusinessForRequest();
  if (!context?.user || !context.business) {
    return null;
  }

  return {
    supabase: createAdminClient() ?? createClient(),
    user: context.user,
    business: context.business
  };
}

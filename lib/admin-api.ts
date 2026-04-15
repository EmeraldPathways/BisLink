import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getAdminUserForRequest } from '@/lib/admin';

export async function requireAdminApiUser() {
  const context = await getAdminUserForRequest();
  if (!context?.user || !context.isAdmin) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    throw new Error('Supabase admin client is not configured');
  }

  return {
    user: context.user,
    supabase: createClient(),
    admin
  };
}

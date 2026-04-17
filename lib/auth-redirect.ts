import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

type RedirectContext = {
  userId: string;
  email: string | null | undefined;
};

export async function getPostAuthRedirectPath() {
  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    return null;
  }

  return resolvePostAuthRedirectPathForUser({
    userId: user.id,
    email: user.email,
    lookupClient: supabase
  });
}

export async function resolvePostAuthRedirectPathForUser({
  userId,
  email,
  lookupClient
}: RedirectContext & { lookupClient?: any }) {
  if (isAdminEmail(email)) {
    return '/admin';
  }

  const admin = createAdminClient();
  const businessLookupClient = admin ?? lookupClient ?? createClient();
  const businessLookup = businessLookupClient
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: business, error } = await businessLookup;
  if (error) {
    throw error;
  }

  return business ? '/dashboard' : '/onboarding';
}

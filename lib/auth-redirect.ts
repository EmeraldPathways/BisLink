import { createAdminClient, createClient, getUserOrNull } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

type RedirectContext = {
  userId: string;
  email: string | null | undefined;
};

export async function getPostAuthRedirectPath() {
  const supabase = await createClient();
  const user = await getUserOrNull(supabase);

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
  const businessLookupClient = admin ?? lookupClient ?? (await createClient());
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

  if (!business) {
    return '/onboarding';
  }

  const [servicesResult, availabilityResult] = await Promise.all([
    businessLookupClient
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id),
    businessLookupClient
      .from('availability')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business.id)
  ]);

  if (servicesResult.error) {
    throw servicesResult.error;
  }

  if (availabilityResult.error) {
    throw availabilityResult.error;
  }

  const hasOnboardingSetup =
    (servicesResult.count ?? 0) > 0 && (availabilityResult.count ?? 0) > 0;

  return hasOnboardingSetup ? '/dashboard' : '/onboarding';
}

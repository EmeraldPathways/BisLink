import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient, getUserOrNull } from '@/lib/supabase/server';
import { ADMIN_EMAIL, isAdminEmail } from '@/lib/admin-config';

export { ADMIN_EMAIL, isAdminEmail } from '@/lib/admin-config';

export async function getAdminUserForRequest(): Promise<{ user: User; isAdmin: boolean } | null> {
  const supabase = createClient();
  const user = await getUserOrNull(supabase);

  if (!user) return null;

  return {
    user,
    isAdmin: isAdminEmail(user.email)
  };
}

export async function requireAdminUser() {
  const context = await getAdminUserForRequest();

  if (!context?.user) {
    redirect('/admin/login');
  }

  if (!context.isAdmin) {
    redirect('/dashboard');
  }

  return context.user;
}

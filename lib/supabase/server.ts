import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server components can be read-only; middleware/route handlers still persist cookies.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        } catch {
          // Server components can be read-only; middleware/route handlers still persist cookies.
        }
      }
    }
  });
}

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function getUserOrNull(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error) {
      if (isAuthSessionMissingError(error)) {
        return null;
      }

      throw error;
    }

    return user ?? null;
  } catch (error) {
    if (isAuthSessionMissingError(error)) {
      return null;
    }

    throw error;
  }
}

function isAuthSessionMissingError(error: unknown) {
  return error instanceof Error && (error.name === 'AuthSessionMissingError' || error.message.includes('Auth session missing'));
}

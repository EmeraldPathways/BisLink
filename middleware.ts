import type { CookieOptions } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const dashboardPrefixes = [
    '/dashboard',
    '/calendar',
    '/services',
    '/products',
    '/customers',
    '/reviews',
    '/link',
    '/payouts',
    '/availability',
  ];
  const isDashboard = dashboardPrefixes.some((prefix) =>
    path.startsWith(prefix),
  );
  const isOnboarding = path.startsWith('/onboarding');
  const isAdmin = path.startsWith('/admin');
  const isAdminLogin = path === '/admin/login';
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isDashboard && !isOnboarding && !isAdmin) return NextResponse.next();
  if (!hasSupabaseConfig || !supabaseUrl || !supabaseAnonKey)
    return NextResponse.next();

  const response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  let user = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      (error.name !== 'AuthSessionMissingError' &&
        !error.message.includes('Auth session missing'))
    ) {
      throw error;
    }
  }

  if (!user) {
    if (isAdminLogin || isOnboarding) {
      return response;
    }

    const loginUrl = new URL(isAdmin ? '/admin/login' : '/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin) {
    if (isAdminLogin && isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (!isAdminLogin && !isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/admin/:path*',
    '/calendar/:path*',
    '/services/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/reviews/:path*',
    '/link/:path*',
    '/payouts/:path*',
    '/availability/:path*',
  ],
};

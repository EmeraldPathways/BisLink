import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdminEmail } from '@/lib/admin';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith('/dashboard');
  const isOnboarding = path.startsWith('/onboarding');
  const isAdmin = path.startsWith('/admin');
  const isAdminLogin = path === '/admin/login';
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!isDashboard && !isOnboarding && !isAdmin) return NextResponse.next();
  if (!hasSupabaseConfig) return NextResponse.next();

  const response = NextResponse.next({
    request: {
      headers: req.headers
    }
  });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
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

export const config = { matcher: ['/dashboard/:path*', '/onboarding/:path*', '/admin/:path*'] };

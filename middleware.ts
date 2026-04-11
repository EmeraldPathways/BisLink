import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith('/dashboard');
  const isOnboarding = path.startsWith('/onboarding');
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!isDashboard && !isOnboarding) return NextResponse.next();
  if (!hasSupabaseConfig) return NextResponse.next();

  const accessToken = req.cookies.get('sb-access-token')?.value ?? req.cookies.get('sb:token')?.value;
  if (!accessToken) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*', '/onboarding/:path*'] };

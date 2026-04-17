import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { resolvePostAuthRedirectPathForUser } from '@/lib/auth-redirect';

export async function GET(req: NextRequest) {
  const fallbackLoginUrl = new URL('/login', req.url);
  const response = NextResponse.redirect(new URL('/dashboard', req.url));

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

  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      fallbackLoginUrl.searchParams.set('error', error.message);
      return NextResponse.redirect(fallbackLoginUrl);
    }
  }

  let user = null;

  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (error) {
    if (!(error instanceof Error) || (error.name !== 'AuthSessionMissingError' && !error.message.includes('Auth session missing'))) {
      throw error;
    }
  }

  if (!user) {
    fallbackLoginUrl.searchParams.set('error', 'Authentication session could not be established.');
    return NextResponse.redirect(fallbackLoginUrl);
  }

  const redirectPath = await resolvePostAuthRedirectPathForUser({
    userId: user.id,
    email: user.email,
    lookupClient: supabase
  });

  return NextResponse.redirect(new URL(redirectPath, req.url), {
    headers: response.headers
  });
}

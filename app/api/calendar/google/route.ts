import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  encodeGoogleOAuthState,
  getGoogleOAuthRedirectUri,
} from '@/lib/google/oauth';
import { getCurrentOwnerBusinessForRequest } from '@/lib/owner';

export async function GET(req: NextRequest) {
  const context = await getCurrentOwnerBusinessForRequest();
  if (!context?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!context.business) {
    return NextResponse.json({ url: '/onboarding' });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google Calendar is not configured' },
      { status: 500 },
    );
  }

  const next = req.nextUrl.searchParams.get('next') ?? '/calendar';
  const nonce = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleOAuthRedirectUri(),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    state: encodeGoogleOAuthState({ next, nonce }),
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  if (req.nextUrl.searchParams.get('format') === 'json') {
    const response = NextResponse.json({ url });
    response.cookies.set('google_oauth_state', nonce, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/calendar/google/callback',
      maxAge: 60 * 10,
    });
    return response;
  }

  const response = NextResponse.redirect(url);
  response.cookies.set('google_oauth_state', nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/calendar/google/callback',
    maxAge: 60 * 10,
  });
  return response;
}

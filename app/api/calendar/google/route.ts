import { NextRequest, NextResponse } from 'next/server';
import { encodeGoogleOAuthState, getGoogleOAuthRedirectUri } from '@/lib/google/oauth';

export async function GET(req: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google Calendar is not configured' }, { status: 500 });
  }

  const businessId = req.nextUrl.searchParams.get('businessId') ?? undefined;
  const next = req.nextUrl.searchParams.get('next') ?? '/calendar';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleOAuthRedirectUri(),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    state: encodeGoogleOAuthState({ businessId, next })
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

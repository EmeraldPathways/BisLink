import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  decodeGoogleOAuthState,
  getGoogleOAuthRedirectUri,
} from '@/lib/google/oauth';
import {
  createAdminClient,
  createClient,
  getUserOrNull,
} from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const state = decodeGoogleOAuthState(req.nextUrl.searchParams.get('state'));
  const nextPath = sanitizeNextPath(state.next);
  const stateCookie = req.cookies.get('google_oauth_state')?.value;

  if (error) {
    return redirectToCalendar(
      appUrl,
      `${nextPath}?googleCalendar=error&reason=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return redirectToCalendar(
      appUrl,
      `${nextPath}?googleCalendar=error&reason=missing_code`,
    );
  }

  if (
    !state.nonce ||
    !stateCookie ||
    state.nonce !== stateCookie
  ) {
    return redirectToCalendar(
      appUrl,
      `${nextPath}?googleCalendar=error&reason=invalid_state`,
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return redirectToCalendar(
      appUrl,
      `${nextPath}?googleCalendar=error&reason=missing_admin`,
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const businessId = await getBusinessIdForCurrentUser();

    if (!businessId) {
      return redirectToCalendar(
        appUrl,
        `${nextPath}?googleCalendar=error&reason=missing_business`,
      );
    }

    const tokenPayload = {
      access_token: tokens.access_token ?? undefined,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date:
        tokens.expiry_date ??
        (tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined),
      token_type: tokens.token_type ?? undefined,
      scope: tokens.scope ?? undefined,
    };

    const { error: updateError } = await admin
      .from('businesses')
      .update({ google_cal_token: tokenPayload })
      .eq('id', businessId);
    if (updateError) {
      console.error('[google callback] Failed to save tokens:', updateError);
      return redirectToCalendar(
        appUrl,
        `${nextPath}?googleCalendar=error&reason=save_failed`,
      );
    }

    return redirectToCalendar(appUrl, `${nextPath}?googleCalendar=connected`);
  } catch (tokenError) {
    console.error('[google callback] Token exchange failed:', tokenError);
    return redirectToCalendar(
      appUrl,
      `${nextPath}?googleCalendar=error&reason=token_exchange_failed`,
    );
  }
}

async function getBusinessIdForCurrentUser() {
  const supabase = await createClient();
  const user = await getUserOrNull(supabase);

  if (!user) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const { data: business, error } = await admin
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (error || !business) {
    return null;
  }

  return business.id as string;
}

function sanitizeNextPath(nextPath?: string) {
  if (
    !nextPath?.startsWith('/') ||
    nextPath.startsWith('//') ||
    nextPath.includes('\\')
  ) {
    return '/calendar';
  }

  return nextPath;
}

function redirectToCalendar(appUrl: string, path: string) {
  const response = NextResponse.redirect(new URL(path, appUrl));
  response.cookies.set('google_oauth_state', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/calendar/google/callback',
    maxAge: 0,
  });
  return response;
}

async function exchangeCodeForTokens(code: string) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!googleClientId || !googleClientSecret) {
    throw new Error('Google Calendar is not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: getGoogleOAuthRedirectUri(),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with ${response.status}`);
  }

  return (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };
}

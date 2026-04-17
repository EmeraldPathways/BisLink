import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient, getUserOrNull } from '@/lib/supabase/server';
import { decodeGoogleOAuthState, getGoogleOAuthRedirectUri } from '@/lib/google/oauth';

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const state = decodeGoogleOAuthState(req.nextUrl.searchParams.get('state'));
  const nextPath = sanitizeNextPath(state.next);

  if (error) {
    return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=error&reason=${encodeURIComponent(error)}`, appUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=error&reason=missing_code`, appUrl));
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=error&reason=missing_admin`, appUrl));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const businessId = state.businessId ?? (await getBusinessIdForCurrentUser());

    if (!businessId) {
      return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=error&reason=missing_business`, appUrl));
    }

    const tokenPayload = {
      access_token: tokens.access_token ?? undefined,
      refresh_token: tokens.refresh_token ?? undefined,
      expiry_date: tokens.expiry_date ?? (tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined),
      token_type: tokens.token_type ?? undefined,
      scope: tokens.scope ?? undefined
    };

    const { error: updateError } = await admin.from('businesses').update({ google_cal_token: tokenPayload }).eq('id', businessId);
    if (updateError) {
      console.error('[google callback] Failed to save tokens:', updateError);
      return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=error&reason=save_failed`, appUrl));
    }

    return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=connected`, appUrl));
  } catch (tokenError) {
    console.error('[google callback] Token exchange failed:', tokenError);
    return NextResponse.redirect(new URL(`${nextPath}?googleCalendar=error&reason=token_exchange_failed`, appUrl));
  }
}

async function getBusinessIdForCurrentUser() {
  const supabase = createClient();
  const user = await getUserOrNull(supabase);

  if (!user) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const { data: business, error } = await admin.from('businesses').select('id').eq('owner_id', user.id).maybeSingle();
  if (error || !business) {
    return null;
  }

  return business.id as string;
}

function sanitizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith('/')) {
    return '/calendar';
  }

  return nextPath;
}

async function exchangeCodeForTokens(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleOAuthRedirectUri(),
      grant_type: 'authorization_code'
    })
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

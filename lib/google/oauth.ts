type OAuthState = {
  next?: string;
  nonce?: string;
};

export function hasGoogleCalendarRefreshToken(
  token: unknown,
): token is { refresh_token: string } {
  return Boolean(
    token &&
      typeof token === 'object' &&
      'refresh_token' in token &&
      typeof (token as { refresh_token?: unknown }).refresh_token ===
        'string' &&
      (token as { refresh_token: string }).refresh_token.trim(),
  );
}

export function getGoogleOAuthRedirectUri() {
  const fallback = 'http://localhost:3000/api/calendar/google/callback';
  const configured = process.env.GOOGLE_REDIRECT_URI ?? fallback;

  if (configured.endsWith('/api/calendar/google')) {
    return `${configured}/callback`;
  }

  return configured;
}

export function encodeGoogleOAuthState(state: OAuthState) {
  return Buffer.from(JSON.stringify(state)).toString('base64url');
}

export function decodeGoogleOAuthState(value: string | null): OAuthState {
  if (!value) return {};

  try {
    const decoded = Buffer.from(value, 'base64url').toString('utf8');
    return JSON.parse(decoded) as OAuthState;
  } catch {
    return {};
  }
}

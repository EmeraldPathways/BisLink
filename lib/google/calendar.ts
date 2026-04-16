import { createAdminClient } from '@/lib/supabase/server';

type GoogleTokenPayload = {
  access_token?: string;
  refresh_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
};

export async function createGoogleCalendarEvent(bookingId: string) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error('Supabase admin client is not configured');
  }

  const { data: booking, error } = await admin
    .from('bookings')
    .select(`
      id,
      start_time,
      end_time,
      customer_name,
      customer_email,
      customer_phone,
      google_event_id,
      business:businesses (
        id,
        name,
        timezone,
        google_cal_token
      ),
      service:services (
        name,
        duration_minutes
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    throw new Error('Booking not found');
  }

  if (booking.google_event_id) {
    return { id: booking.google_event_id };
  }

  const business = booking.business as unknown as { id: string; name: string; timezone: string; google_cal_token: GoogleTokenPayload | null };
  const service = booking.service as unknown as { name: string; duration_minutes: number };

  if (!business.google_cal_token?.refresh_token && !business.google_cal_token?.access_token) {
    throw new Error('Google Calendar is not connected for this business');
  }

  const tokens = await ensureFreshGoogleToken(admin, business.id, business.google_cal_token);
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: `${service.name} - ${booking.customer_name}`,
      description: [
        `Customer: ${booking.customer_name}`,
        `Email: ${booking.customer_email}`,
        booking.customer_phone ? `Phone: ${booking.customer_phone}` : null,
        `Service: ${service.name} (${service.duration_minutes} min)`
      ]
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: booking.start_time, timeZone: business.timezone },
      end: { dateTime: booking.end_time, timeZone: business.timezone },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Calendar event creation failed: ${response.status} ${details}`);
  }

  const event = (await response.json()) as { id?: string };
  if (!event.id) {
    throw new Error('Google Calendar did not return an event id');
  }

  await admin.from('bookings').update({ google_event_id: event.id }).eq('id', bookingId);
  return { id: event.id };
}

async function ensureFreshGoogleToken(admin: NonNullable<ReturnType<typeof createAdminClient>>, businessId: string, token: GoogleTokenPayload) {
  const now = Date.now();
  if (token.access_token && token.expiry_date && token.expiry_date > now + 60_000) {
    return token;
  }

  if (!token.refresh_token) {
    if (token.access_token) {
      return token;
    }

    throw new Error('Google Calendar refresh token is missing');
  }

  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token'
    })
  });

  if (!refreshResponse.ok) {
    const details = await refreshResponse.text();
    throw new Error(`Google token refresh failed: ${refreshResponse.status} ${details}`);
  }

  const refreshed = (await refreshResponse.json()) as {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
  };

  const updatedToken = {
    ...token,
    access_token: refreshed.access_token ?? token.access_token,
    expiry_date: refreshed.expires_in ? now + refreshed.expires_in * 1000 : token.expiry_date,
    token_type: refreshed.token_type ?? token.token_type,
    scope: refreshed.scope ?? token.scope
  };

  await admin.from('businesses').update({ google_cal_token: updatedToken }).eq('id', businessId);
  return updatedToken;
}

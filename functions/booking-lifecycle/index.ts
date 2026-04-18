import { HttpFunction } from '@google-cloud/functions-framework';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
let resendClient: Resend | null | undefined;

export const bookingLifecycle: HttpFunction = async (req, res) => {
  if (!isAuthorized(req.headers.authorization)) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const { bookingId } = req.body ?? {};
  if (!bookingId) {
    res.status(400).send('Missing bookingId');
    return;
  }
  const paymentIntentId = req.body?.paymentIntentId ?? null;

  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        customer_name,
        customer_email,
        customer_phone,
        amount_paid,
        currency,
        confirmation_sent,
        google_event_id,
        business:businesses (
          id,
          name,
          slug,
          timezone,
          location,
          google_cal_token
        ),
        service:services (
          id,
          name,
          duration_minutes
        )
      `)
      .eq('id', bookingId)
      .eq('status', 'confirmed')
      .single();

    if (error || !booking) {
      logLifecycle('booking_lookup_failed', { booking_id: bookingId, payment_intent_id: paymentIntentId, error: error?.message ?? 'Booking not found' }, 'error');
      res.status(404).send('Booking not found');
      return;
    }

    if (booking.confirmation_sent && booking.google_event_id) {
      logLifecycle('booking_already_processed', { booking_id: booking.id, payment_intent_id: paymentIntentId ?? null });
      res.status(200).send('Already processed');
      return;
    }

    const business = booking.business as unknown as {
      id: string;
      name: string;
      slug: string;
      timezone: string;
      location: string | null;
      google_cal_token: {
        access_token?: string;
        refresh_token?: string;
        expiry_date?: number;
      } | null;
    };
    const service = booking.service as unknown as { id: string; name: string; duration_minutes: number };

    const [emailResult, calResult] = await Promise.allSettled([
      booking.confirmation_sent ? Promise.resolve() : sendConfirmationEmail(booking, business, service),
      booking.google_event_id ? Promise.resolve(booking.google_event_id) : createCalendarEvent(booking, business, service)
    ]);

    if (emailResult.status === 'rejected') {
      logLifecycle('booking_confirmation_email_failed', { booking_id: booking.id, payment_intent_id: paymentIntentId, business_id: business.id, error: toErrorMessage(emailResult.reason) }, 'error');
    }
    if (calResult.status === 'rejected') {
      logLifecycle('booking_calendar_failed', { booking_id: booking.id, payment_intent_id: paymentIntentId, business_id: business.id, error: toErrorMessage(calResult.reason) }, 'error');
    }

    const updates: Record<string, unknown> = {};
    const emailSent = booking.confirmation_sent || emailResult.status === 'fulfilled';
    if (emailSent !== booking.confirmation_sent) {
      updates.confirmation_sent = emailSent;
    }
    const googleEventId = booking.google_event_id || (calResult.status === 'fulfilled' ? calResult.value : null);
    if (googleEventId && googleEventId !== booking.google_event_id) {
      updates.google_event_id = googleEventId;
    }

    if (Object.keys(updates).length) {
      const { error: updateError } = await supabase.from('bookings').update(updates).eq('id', bookingId);
      if (updateError) {
        logLifecycle('booking_update_failed', { booking_id: booking.id, payment_intent_id: paymentIntentId, business_id: business.id, error: updateError.message }, 'error');
      }
    }

    logLifecycle('booking_processed', {
      booking_id: booking.id,
      payment_intent_id: paymentIntentId,
      business_id: business.id,
      confirmation_sent: emailSent,
      google_event_id: googleEventId
    });

    res.status(200).json({
      bookingId,
      paymentIntentId,
      emailSent,
      calendarCreated: Boolean(googleEventId),
      googleEventId
    });
  } catch (error) {
    logLifecycle('booking_unhandled_error', { booking_id: bookingId, payment_intent_id: paymentIntentId, error: toErrorMessage(error) }, 'error');
    res.status(500).send('Internal error');
  }
};

async function sendConfirmationEmail(
  booking: {
    start_time: string;
    customer_name: string;
    customer_email: string;
    amount_paid: number | null;
  },
  business: { name: string; slug: string; timezone: string; location: string | null },
  service: { name: string; duration_minutes: number }
) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('Email configuration is missing');
  }

  const resend = getResend();
  if (!resend) {
    throw new Error('Resend configuration is missing');
  }

  const start = new Date(booking.start_time);
  const formattedDate = start.toLocaleDateString('en-US', {
    timeZone: business.timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = start.toLocaleTimeString('en-US', {
    timeZone: business.timezone,
    hour: 'numeric',
    minute: '2-digit'
  });
  const price = booking.amount_paid ? `$${Math.floor(booking.amount_paid / 100)}` : 'Paid';

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: booking.customer_email,
    subject: `Booking confirmed - ${service.name} on ${formattedDate}`,
    html: buildConfirmationEmail({
      customerName: booking.customer_name,
      serviceName: service.name,
      date: formattedDate,
      time: formattedTime,
      duration: service.duration_minutes,
      location: business.location,
      price,
      businessSlug: business.slug
    })
  });
}

function buildConfirmationEmail(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  location: string | null;
  price: string;
  businessSlug: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;">
    <div style="background:linear-gradient(165deg,#0C0B09 0%,#1C1610 55%,#0F0D0B 100%);padding:32px 32px 28px;">
      <h1 style="margin:0;color:#F7F3ED;font-size:26px;font-weight:600;letter-spacing:-0.3px;">You're booked!</h1>
      <p style="margin:6px 0 0;color:#9E9890;font-size:14px;">Confirmation for ${data.customerName}</p>
    </div>
    <div style="padding:28px 32px;">
      <div style="background:#F7F4EF;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #EAE5DC;">
          <span style="color:#888;font-size:13px;">Service</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.serviceName}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #EAE5DC;">
          <span style="color:#888;font-size:13px;">Date</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.date}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:${data.location ? '14px' : '0'};padding-bottom:${data.location ? '14px' : '0'};${data.location ? 'border-bottom:1px solid #EAE5DC;' : ''}">
          <span style="color:#888;font-size:13px;">Time</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.time} · ${data.duration} min</span>
        </div>
        ${data.location ? `
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #EAE5DC;">
          <span style="color:#888;font-size:13px;">Location</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.location}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;margin-top:${data.location ? '0' : '14px'};padding-top:${data.location ? '0' : '14px'};${data.location ? '' : 'border-top:1px solid #EAE5DC;'}">
          <span style="color:#111;font-size:14px;font-weight:700;">Total paid</span>
          <span style="color:#111;font-size:14px;font-weight:700;">${data.price}</span>
        </div>
      </div>
      <a href="${process.env.APP_URL}/${data.businessSlug}"
         style="display:block;text-align:center;background:#0C0B09;color:#ffffff;text-decoration:none;padding:14px;border-radius:12px;font-size:14px;font-weight:500;">
        View booking page
      </a>
    </div>
  </div>
</body>
</html>`.trim();
}

async function createCalendarEvent(
  booking: {
    start_time: string;
    end_time: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
  },
  business: {
    id: string;
    timezone: string;
    google_cal_token: {
      access_token?: string;
      refresh_token?: string;
      expiry_date?: number;
    } | null;
  },
  service: { name: string; duration_minutes: number }
): Promise<string | null> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth configuration is missing');
  }

  if (!business.google_cal_token) {
    return null;
  }

  const token = business.google_cal_token;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: token.expiry_date
  });

  oauth2Client.on('tokens', async (newTokens) => {
    const updated = {
      ...token,
      access_token: newTokens.access_token ?? token.access_token,
      expiry_date: newTokens.expiry_date ?? token.expiry_date
    };
    await supabase.from('businesses').update({ google_cal_token: updated }).eq('id', business.id);
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
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
    }
  });

  return event.data.id ?? null;
}

function isAuthorized(authorizationHeader?: string): boolean {
  const expectedToken = process.env.GOOGLE_CLOUD_FUNCTION_TOKEN;
  if (!expectedToken) {
    console.warn('[booking-lifecycle] GOOGLE_CLOUD_FUNCTION_TOKEN is not set; allowing request');
    return true;
  }

  if (!authorizationHeader) {
    return false;
  }

  const normalized = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : authorizationHeader;
  return normalized === expectedToken;
}

function logLifecycle(event: string, payload: Record<string, unknown>, level: 'log' | 'warn' | 'error' = 'log') {
  console[level]('[booking-lifecycle]', JSON.stringify({ event, ...payload }));
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getResend() {
  if (resendClient !== undefined) return resendClient;
  if (!process.env.RESEND_API_KEY) {
    resendClient = null;
    return resendClient;
  }

  resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

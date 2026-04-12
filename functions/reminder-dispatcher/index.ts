import { HttpFunction } from '@google-cloud/functions-framework';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export const reminderDispatcher: HttpFunction = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const now = new Date();
    const [h24Result, h1Result, followupResult] = await Promise.allSettled([
      dispatch24hReminders(now),
      dispatch1hReminders(now),
      dispatchFollowups(now)
    ]);

    const summary = {
      reminders24h: settled(h24Result),
      reminders1h: settled(h1Result),
      followups: settled(followupResult)
    };

    console.log('[reminder-dispatcher]', JSON.stringify(summary));
    res.status(200).json(summary);
  } catch (error) {
    console.error('[reminder-dispatcher] Unhandled error:', error);
    res.status(500).send('Internal error');
  }
};

async function dispatch24hReminders(now: Date): Promise<number> {
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      customer_name,
      customer_email,
      business:businesses ( name, slug, location, timezone ),
      service:services ( name, duration_minutes )
    `)
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .gte('start_time', windowStart.toISOString())
    .lte('start_time', windowEnd.toISOString());

  if (error) {
    throw error;
  }
  if (!bookings || bookings.length === 0) {
    return 0;
  }

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendReminderEmail(booking, '24h');
      await supabase.from('bookings').update({ reminder_24h_sent: true }).eq('id', booking.id);
      sent++;
    } catch (error) {
      console.error('[24h reminder] Failed for booking:', booking.id, error);
    }
  }

  return sent;
}

async function dispatch1hReminders(now: Date): Promise<number> {
  const windowStart = new Date(now.getTime() + 45 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 75 * 60 * 1000);
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      start_time,
      customer_name,
      customer_email,
      business:businesses ( name, slug, location, timezone ),
      service:services ( name, duration_minutes )
    `)
    .eq('status', 'confirmed')
    .eq('reminder_1h_sent', false)
    .gte('start_time', windowStart.toISOString())
    .lte('start_time', windowEnd.toISOString());

  if (error) {
    throw error;
  }
  if (!bookings || bookings.length === 0) {
    return 0;
  }

  let sent = 0;
  for (const booking of bookings) {
    try {
      await sendReminderEmail(booking, '1h');
      await supabase.from('bookings').update({ reminder_1h_sent: true }).eq('id', booking.id);
      sent++;
    } catch (error) {
      console.error('[1h reminder] Failed for booking:', booking.id, error);
    }
  }

  return sent;
}

async function dispatchFollowups(now: Date): Promise<number> {
  const windowStart = new Date(now.getTime() - 25 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() - 23 * 60 * 60 * 1000);
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      customer_name,
      customer_email,
      review_token,
      business:businesses ( id, name, slug, google_review_url )
    `)
    .eq('status', 'confirmed')
    .eq('followup_sent', false)
    .gte('end_time', windowStart.toISOString())
    .lte('end_time', windowEnd.toISOString());

  if (error) {
    throw error;
  }
  if (!bookings || bookings.length === 0) {
    return 0;
  }

  let sent = 0;
  for (const booking of bookings) {
    try {
      const reviewToken = booking.review_token || generateReviewToken(booking.id);
      if (!booking.review_token) {
        await supabase.from('bookings').update({ review_token: reviewToken }).eq('id', booking.id);
      }
      await sendFollowupEmail(booking, reviewToken);
      await supabase.from('bookings').update({ followup_sent: true }).eq('id', booking.id);
      sent++;
    } catch (error) {
      console.error('[followup] Failed for booking:', booking.id, error);
    }
  }

  return sent;
}

async function sendReminderEmail(booking: any, type: '24h' | '1h') {
  const business = booking.business as any;
  const service = booking.service as any;
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

  const subject = type === '24h' ? `Reminder: ${service.name} tomorrow at ${formattedTime}` : `Starting in 1 hour: ${service.name} at ${formattedTime}`;
  const heading = type === '24h' ? 'See you tomorrow!' : 'See you in an hour!';

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: booking.customer_email,
    subject,
    html: buildReminderEmail({
      serviceName: service.name,
      date: formattedDate,
      time: formattedTime,
      duration: service.duration_minutes,
      location: business.location ?? null,
      heading
    })
  });
}

async function sendFollowupEmail(booking: any, reviewToken: string) {
  const business = booking.business as any;
  const reviewUrl = business.google_review_url
    ? business.google_review_url
    : `${process.env.APP_URL}/${business.slug}/review?bookingId=${booking.id}&token=${reviewToken}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: booking.customer_email,
    subject: `How was your session with ${business.name}?`,
    html: buildFollowupEmail({
      customerName: booking.customer_name,
      businessName: business.name,
      reviewUrl
    })
  });
}

function buildReminderEmail(data: {
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  location: string | null;
  heading: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;">
    <div style="background:linear-gradient(165deg,#0C0B09 0%,#1C1610 55%,#0F0D0B 100%);padding:32px;">
      <h1 style="margin:0;color:#F7F3ED;font-size:24px;font-weight:600;">${data.heading}</h1>
      <p style="margin:6px 0 0;color:#9E9890;font-size:14px;">Here's your booking reminder</p>
    </div>
    <div style="padding:28px 32px;">
      <div style="background:#F7F4EF;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EAE5DC;">
          <span style="color:#888;font-size:13px;">Service</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.serviceName}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EAE5DC;">
          <span style="color:#888;font-size:13px;">Date</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.date}</span>
        </div>
        <div style="display:flex;justify-content:space-between;${data.location ? 'margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EAE5DC;' : ''}">
          <span style="color:#888;font-size:13px;">Time</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.time} · ${data.duration} min</span>
        </div>
        ${data.location ? `
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#888;font-size:13px;">Location</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.location}</span>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

function buildFollowupEmail(data: {
  customerName: string;
  businessName: string;
  reviewUrl: string;
}) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;">
    <div style="background:linear-gradient(165deg,#0C0B09 0%,#1C1610 55%,#0F0D0B 100%);padding:32px;">
      <h1 style="margin:0;color:#F7F3ED;font-size:24px;font-weight:600;">Hope it went well!</h1>
      <p style="margin:6px 0 0;color:#9E9890;font-size:14px;">Your session with ${data.businessName}</p>
    </div>
    <div style="padding:28px 32px;text-align:center;">
      <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">Hi ${data.customerName}, we'd love to hear how your session went. It only takes 30 seconds.</p>
      <a href="${data.reviewUrl}"
         style="display:inline-block;background:#0C0B09;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:500;margin-bottom:24px;">
        Leave a review
      </a>
    </div>
  </div>
</body>
</html>`.trim();
}

function generateReviewToken(bookingId: string): string {
  if (!process.env.REVIEW_TOKEN_SECRET) {
    return crypto.randomUUID();
  }

  const payload = Buffer.from(JSON.stringify({ bookingId, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.REVIEW_TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function settled(result: PromiseSettledResult<number>): { count?: number; error?: string } {
  if (result.status === 'fulfilled') {
    return { count: result.value };
  }

  return { error: String(result.reason) };
}

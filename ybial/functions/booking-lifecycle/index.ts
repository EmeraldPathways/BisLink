import { HttpFunction } from '@google-cloud/functions-framework'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { google } from 'googleapis'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

export const bookingLifecycle: HttpFunction = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const { bookingId } = req.body

  if (!bookingId) {
    res.status(400).send('Missing bookingId')
    return
  }

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
      .single()

    if (error || !booking) {
      console.error('[lifecycle] Booking not found or not confirmed:', bookingId, error)
      res.status(404).send('Booking not found')
      return
    }

    // Idempotency — bail if already processed
    if (booking.confirmation_sent) {
      console.log('[lifecycle] Already processed:', bookingId)
      res.status(200).send('Already processed')
      return
    }

    const business = booking.business as any
    const service = booking.service as any

    // Run email + calendar in parallel — one failing doesn't block the other
    const [emailResult, calResult] = await Promise.allSettled([
      sendConfirmationEmail(booking, business, service),
      createCalendarEvent(booking, business, service),
    ])

    if (emailResult.status === 'rejected') {
      console.error('[lifecycle] Email failed:', emailResult.reason)
    }
    if (calResult.status === 'rejected') {
      console.error('[lifecycle] Calendar failed:', calResult.reason)
    }

    // Update flags based on what succeeded
    const updates: Record<string, unknown> = {
      confirmation_sent: emailResult.status === 'fulfilled',
    }
    if (calResult.status === 'fulfilled' && calResult.value) {
      updates.google_event_id = calResult.value
    }

    await supabase.from('bookings').update(updates).eq('id', bookingId)

    res.status(200).json({
      bookingId,
      emailSent: emailResult.status === 'fulfilled',
      calendarCreated: calResult.status === 'fulfilled',
    })
  } catch (err) {
    console.error('[lifecycle] Unhandled error:', err)
    res.status(500).send('Internal error')
  }
}

// ─── Confirmation email ───────────────────────────────────────────────────────

async function sendConfirmationEmail(booking: any, business: any, service: any) {
  const start = new Date(booking.start_time)

  const formattedDate = start.toLocaleDateString('en-US', {
    timeZone: business.timezone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = start.toLocaleTimeString('en-US', {
    timeZone: business.timezone,
    hour: 'numeric',
    minute: '2-digit',
  })
  const price = booking.amount_paid
    ? `$${Math.floor(booking.amount_paid / 100)}`
    : 'Paid'

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: booking.customer_email,
    subject: `Booking confirmed — ${service.name} on ${formattedDate}`,
    html: buildConfirmationEmail({
      customerName: booking.customer_name,
      businessName: business.name,
      serviceName: service.name,
      date: formattedDate,
      time: formattedTime,
      duration: service.duration_minutes,
      location: business.location,
      price,
      businessSlug: business.slug,
    }),
  })
}

function buildConfirmationEmail(data: {
  customerName: string
  businessName: string
  serviceName: string
  date: string
  time: string
  duration: number
  location: string | null
  price: string
  businessSlug: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;">
    <div style="background:linear-gradient(165deg,#0C0B09 0%,#1C1610 55%,#0F0D0B 100%);padding:32px 32px 28px;">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#C9A45C,#8B6B1A);margin-bottom:16px;display:inline-flex;align-items:center;justify-content:center;">
        <span style="color:#0C0B09;font-size:20px;font-weight:700;">✓</span>
      </div>
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
      <p style="color:#888;font-size:13px;text-align:center;margin:0 0 24px;">
        We'll send you a reminder 24 hours before your session.
      </p>
      <a href="${process.env.APP_URL}/${data.businessSlug}"
         style="display:block;text-align:center;background:#0C0B09;color:#ffffff;text-decoration:none;padding:14px;border-radius:12px;font-size:14px;font-weight:500;">
        View booking page
      </a>
    </div>
    <div style="padding:0 32px 28px;text-align:center;">
      <p style="color:#CCC;font-size:11px;margin:0;">Powered by Your Business in a Link</p>
    </div>
  </div>
</body>
</html>`.trim()
}

// ─── Google Calendar ──────────────────────────────────────────────────────────

async function createCalendarEvent(
  booking: any,
  business: any,
  service: any
): Promise<string | null> {
  if (!business.google_cal_token) return null

  const token = business.google_cal_token as {
    access_token: string
    refresh_token: string
    expiry_date: number
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  )

  oauth2Client.setCredentials({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: token.expiry_date,
  })

  // Persist refreshed token back to Supabase automatically
  oauth2Client.on('tokens', async (newTokens) => {
    const updated = {
      ...token,
      access_token: newTokens.access_token ?? token.access_token,
      expiry_date: newTokens.expiry_date ?? token.expiry_date,
    }
    await supabase
      .from('businesses')
      .update({ google_cal_token: updated })
      .eq('id', business.id)
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const event = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `${service.name} — ${booking.customer_name}`,
      description: [
        `Customer: ${booking.customer_name}`,
        `Email: ${booking.customer_email}`,
        booking.customer_phone ? `Phone: ${booking.customer_phone}` : null,
        `Service: ${service.name} (${service.duration_minutes} min)`,
      ]
        .filter(Boolean)
        .join('\n'),
      start: { dateTime: booking.start_time, timeZone: business.timezone },
      end: { dateTime: booking.end_time, timeZone: business.timezone },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    },
  })

  return event.data.id ?? null
}

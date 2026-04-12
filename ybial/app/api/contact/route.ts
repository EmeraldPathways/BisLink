import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

const ContactSchema = z.object({
  businessId: z.string().uuid(),
  senderName: z.string().min(1).max(100),
  senderEmail: z.string().email(),
  message: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { businessId, senderName, senderEmail, message } = parsed.data
    const supabase = createClient()

    // Fetch business contact email
    const { data: business, error } = await supabase
      .from('businesses')
      .select('name, contact_email, slug')
      .eq('id', businessId)
      .eq('is_active', true)
      .single()

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // contact_email falls back to the owner's auth email if not set
    // Fetch owner email from auth if contact_email is null
    let recipientEmail = business.contact_email

    if (!recipientEmail) {
      const { data: owner } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .single()

      if (owner) {
        const { data: userData } = await supabase.auth.admin.getUserById(owner.owner_id)
        recipientEmail = userData?.user?.email ?? null
      }
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'No contact email configured' }, { status: 400 })
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: recipientEmail,
      replyTo: senderEmail,
      subject: `New message from ${senderName} via your booking page`,
      html: buildContactEmail({
        businessName: business.name,
        senderName,
        senderEmail,
        message,
        businessSlug: business.slug,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildContactEmail(data: {
  businessName: string
  senderName: string
  senderEmail: string
  message: string
  businessSlug: string
}) {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;">
    <div style="background:linear-gradient(165deg,#0C0B09 0%,#1C1610 55%,#0F0D0B 100%);padding:32px;">
      <h1 style="margin:0;color:#F7F3ED;font-size:22px;font-weight:600;">New message</h1>
      <p style="margin:6px 0 0;color:#9E9890;font-size:14px;">Via your booking page</p>
    </div>
    <div style="padding:28px 32px;">
      <div style="background:#F7F4EF;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EAE5DC;">
          <span style="color:#888;font-size:13px;">From</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.senderName}</span>
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span style="color:#888;font-size:13px;">Email</span>
          <span style="color:#111;font-size:13px;font-weight:500;">${data.senderEmail}</span>
        </div>
      </div>
      <div style="background:#F7F4EF;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="color:#888;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Message</p>
        <p style="color:#111;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${data.message}</p>
      </div>
      <a href="mailto:${data.senderEmail}"
         style="display:block;text-align:center;background:#0C0B09;color:#ffffff;text-decoration:none;padding:14px;border-radius:12px;font-size:14px;font-weight:500;">
        Reply to ${data.senderName}
      </a>
    </div>
    <div style="padding:0 32px 28px;text-align:center;">
      <p style="color:#CCC;font-size:11px;margin:0;">Powered by Your Business in a Link</p>
    </div>
  </div>
</body>
</html>`.trim()
}

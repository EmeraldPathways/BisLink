import { HttpFunction } from '@google-cloud/functions-framework';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export const orderLifecycle: HttpFunction = async (req, res) => {
  if (!isAuthorized(req.headers.authorization)) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const { businessId, customerName, customerEmail, items, total, paymentIntentId } = req.body;
  if (!businessId || !customerEmail || !items || !paymentIntentId) {
    res.status(400).send('Missing required fields');
    return;
  }

  try {
    const { data: existing } = await supabase.from('orders').select('id').eq('payment_intent_id', paymentIntentId).single();
    if (existing) {
      res.status(200).send('Already processed');
      return;
    }

    const { data: business } = await supabase.from('businesses').select('name, slug, currency').eq('id', businessId).single();
    if (!business) {
      res.status(404).send('Business not found');
      return;
    }

    await supabase.from('orders').insert({
      business_id: businessId,
      customer_name: customerName,
      customer_email: customerEmail,
      items,
      total_amount: total,
      currency: business.currency ?? 'usd',
      payment_intent_id: paymentIntentId,
      status: 'paid'
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: customerEmail,
      subject: `Order confirmed - ${business.name}`,
      html: buildOrderEmail({
        businessName: business.name,
        items,
        total,
        businessSlug: business.slug
      })
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[order-lifecycle]', error);
    res.status(500).send('Internal error');
  }
};

function buildOrderEmail(data: {
  businessName: string;
  items: { name: string; emoji: string; price: number; quantity: number }[];
  total: number;
  businessSlug: string;
}) {
  const lineItemsHtml = data.items
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EAE5DC;">
        <span style="color:#111;font-size:13px;">${item.emoji} ${item.name} x ${item.quantity}</span>
        <span style="color:#111;font-size:13px;font-weight:500;">$${Math.floor((item.price * item.quantity) / 100)}</span>
      </div>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #EBEBEB;">
    <div style="background:linear-gradient(165deg,#0C0B09 0%,#1C1610 55%,#0F0D0B 100%);padding:32px;">
      <h1 style="margin:0;color:#F7F3ED;font-size:24px;font-weight:600;">Order confirmed!</h1>
      <p style="margin:6px 0 0;color:#9E9890;font-size:14px;">${data.businessName}</p>
    </div>
    <div style="padding:28px 32px;">
      <div style="background:#F7F4EF;border-radius:12px;padding:20px;margin-bottom:24px;">
        ${lineItemsHtml}
        <div style="display:flex;justify-content:space-between;padding-top:4px;">
          <span style="color:#111;font-size:14px;font-weight:700;">Total</span>
          <span style="color:#111;font-size:14px;font-weight:700;">$${Math.floor(data.total / 100)}</span>
        </div>
      </div>
      <a href="${process.env.APP_URL}/${data.businessSlug}"
         style="display:block;text-align:center;background:#0C0B09;color:#ffffff;text-decoration:none;padding:14px;border-radius:12px;font-size:14px;font-weight:500;">
        Back to ${data.businessName}
      </a>
    </div>
  </div>
  </body>
</html>`.trim();
}

function isAuthorized(authorizationHeader?: string): boolean {
  const expectedToken = process.env.GOOGLE_CLOUD_FUNCTION_TOKEN;
  if (!expectedToken) {
    console.warn('[order-lifecycle] GOOGLE_CLOUD_FUNCTION_TOKEN is not set; allowing request');
    return true;
  }

  if (!authorizationHeader) {
    return false;
  }

  const normalized = authorizationHeader.startsWith('Bearer ') ? authorizationHeader.slice(7) : authorizationHeader;
  return normalized === expectedToken;
}

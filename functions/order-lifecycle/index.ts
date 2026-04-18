import { HttpFunction } from '@google-cloud/functions-framework';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
let resendClient: Resend | null | undefined;

export const orderLifecycle: HttpFunction = async (req, res) => {
  if (!isAuthorized(req.headers.authorization)) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const { orderId, businessId, customerName, customerEmail, customerPhone, shippingAddress, items, total, paymentIntentId } = req.body;
  if (!businessId || !customerEmail || !items || !paymentIntentId) {
    res.status(400).send('Missing required fields');
    return;
  }

  try {
    const { data: existing } = await supabase
      .from('orders')
      .select('id, business_id, customer_email, total_amount, created_at, confirmation_sent')
      .eq('payment_intent_id', paymentIntentId)
      .maybeSingle();

    const { data: business } = await supabase.from('businesses').select('name, slug, currency').eq('id', businessId).single();
    if (!business) {
      res.status(404).send('Business not found');
      return;
    }

    let persistedOrderId = existing?.id ?? orderId ?? null;
    let orderCreatedAt = existing?.created_at ?? new Date().toISOString();

    if (!existing) {
      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
          business_id: businessId,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone ?? null,
          items,
          total_amount: total,
          currency: business.currency ?? 'usd',
          payment_intent_id: paymentIntentId,
          shipping_address: shippingAddress ?? null,
          status: 'paid',
          confirmation_sent: false
        })
        .select('id, created_at')
        .single();

      if (insertError || !insertedOrder) {
        logOrderLifecycle('order_insert_failed', { payment_intent_id: paymentIntentId, business_id: businessId, error: insertError?.message ?? 'Insert failed' }, 'error');
        res.status(500).send('Failed to persist order');
        return;
      }

      persistedOrderId = insertedOrder.id;
      orderCreatedAt = insertedOrder.created_at ?? orderCreatedAt;
    }

    let emailSent = Boolean(existing?.confirmation_sent);
    if (!existing?.confirmation_sent) {
      if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
        logOrderLifecycle('order_email_missing_config', { payment_intent_id: paymentIntentId, order_id: persistedOrderId, business_id: businessId }, 'warn');
      } else {
        const resend = getResend();
        if (!resend) {
          throw new Error('Resend configuration is missing');
        }
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: customerEmail,
          subject: `Order confirmed - ${business.name}`,
          html: buildOrderEmail({
            businessName: business.name,
            items,
            total,
            businessSlug: business.slug
          })
        });
        emailSent = true;
      }

      if (emailSent) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ confirmation_sent: true })
          .eq('payment_intent_id', paymentIntentId);

        if (updateError) {
          logOrderLifecycle(
            'order_confirmation_flag_failed',
            { payment_intent_id: paymentIntentId, order_id: persistedOrderId, business_id: businessId, error: updateError.message },
            'error'
          );
        }
      }
    }

    logOrderLifecycle('order_processed', {
      payment_intent_id: paymentIntentId,
      order_id: persistedOrderId,
      business_id: businessId,
      confirmation_sent: emailSent
    });

    res.status(200).json({ success: true, orderId: persistedOrderId, alreadyExisted: Boolean(existing), emailSent, orderCreatedAt });
  } catch (error) {
    logOrderLifecycle('order_unhandled_error', { payment_intent_id: req.body?.paymentIntentId ?? null, business_id: req.body?.businessId ?? null, error: toErrorMessage(error) }, 'error');
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

function logOrderLifecycle(event: string, payload: Record<string, unknown>, level: 'log' | 'warn' | 'error' = 'log') {
  console[level]('[order-lifecycle]', JSON.stringify({ event, ...payload }));
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

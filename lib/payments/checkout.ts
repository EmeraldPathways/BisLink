import { z } from 'zod';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { writeAppLog } from '@/lib/app-logs';
import { getStripe } from '@/lib/stripe/client';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10)
});

export const checkoutSchema = z.object({
  businessId: z.string().uuid(),
  items: z.array(itemSchema).min(1).max(10),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().trim().max(40).optional(),
  shippingAddress: z
    .object({
      line1: z.string().trim().max(200).optional(),
      city: z.string().trim().max(120).optional(),
      region: z.string().trim().max(120).optional(),
      postalCode: z.string().trim().max(40).optional(),
      country: z.string().trim().max(120).optional()
    })
    .optional()
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CheckoutResult =
  | { ok: true; clientSecret: string | null; total: number; paymentIntentId: string | null }
  | { ok: false; status: number; error: string; details?: unknown };

export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, status: 500, error: 'Stripe is not configured' };
  }

  const { businessId, items, customerName, customerEmail, customerPhone, shippingAddress } = input;
  const supabase = createAdminClient() ?? (await createClient());

  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, stripe_account_id, stripe_onboarded, currency')
    .eq('id', businessId)
    .eq('is_active', true)
    .maybeSingle();

  if (bizError || !business) {
    return { ok: false, status: 404, error: 'Business not found' };
  }

  let stripeReady = Boolean(business.stripe_onboarded && business.stripe_account_id);
  if (!stripeReady && business.stripe_account_id) {
    try {
      const account = await stripe.accounts.retrieve(business.stripe_account_id);
      stripeReady = Boolean(account.charges_enabled && account.details_submitted);

      if (stripeReady && !business.stripe_onboarded) {
        const admin = createAdminClient();
        if (admin) {
          await admin
            .from('businesses')
            .update({ stripe_onboarded: true })
            .eq('id', business.id);
        }
      }
    } catch {
      stripeReady = false;
    }
  }

  if (!stripeReady || !business.stripe_account_id) {
    return { ok: false, status: 400, error: 'Business payments not configured' };
  }

  const productIds = items.map((item) => item.productId);
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, price, in_stock, is_active, emoji')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .in('id', productIds);

  if (prodError || !products) {
    return { ok: false, status: 500, error: 'Failed to fetch products' };
  }

  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) {
      return { ok: false, status: 404, error: `Product not found: ${item.productId}` };
    }

    if (!product.in_stock) {
      return { ok: false, status: 409, error: `${product.name} is out of stock` };
    }
  }

  const lineItems = items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      emoji: product.emoji,
      price: product.price,
      quantity: item.quantity
    };
  });

  const total = lineItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: business.currency ?? 'usd',
    automatic_payment_methods: { enabled: true },
    application_fee_amount: 0,
    transfer_data: {
      destination: business.stripe_account_id
    },
    metadata: {
      type: 'product_order',
      businessId
    }
  });

  const baseOrderPayload = {
    business_id: businessId,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone ?? null,
    items: lineItems,
    total_amount: total,
    currency: business.currency ?? 'usd',
    payment_intent_id: paymentIntent.id,
    shipping_address: shippingAddress ?? null,
    status: 'pending'
  };

  let orderInsert = await supabase
    .from('orders')
    .insert({
      ...baseOrderPayload,
      confirmation_sent: false
    })
    .select('id')
    .single();

  if (
    orderInsert.error?.message?.toLowerCase().includes('confirmation_sent')
  ) {
    orderInsert = await supabase
      .from('orders')
      .insert(baseOrderPayload)
      .select('id')
      .single();
  }

  const { data: order, error: orderError } = orderInsert;

  if (orderError || !order) {
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => undefined);
    await writeAppLog({
      level: 'error',
      source: 'lib.payments.checkout',
      event: 'order_insert_failed',
      message: 'Failed to persist order after creating payment intent',
      context: {
        business_id: businessId,
        payment_intent_id: paymentIntent.id,
        error: orderError?.message ?? 'Order insert returned no row'
      }
    });
    return { ok: false, status: 500, error: 'Failed to persist order' };
  }

  await stripe.paymentIntents.update(paymentIntent.id, {
    metadata: {
      type: 'product_order',
      businessId,
      orderId: order.id
    }
  });

  return {
    ok: true,
    clientSecret: paymentIntent.client_secret,
    total,
    paymentIntentId: paymentIntent.id
  };
}

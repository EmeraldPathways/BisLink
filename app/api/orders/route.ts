import { z } from 'zod';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { demoBusiness, demoProducts } from '@/lib/demo-data';
import { getStripe } from '@/lib/stripe/client';

const itemSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().min(1).max(10)
});

const addressSchema = z
  .object({
    line1: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    region: z.string().min(1).optional(),
    postalCode: z.string().min(1).optional(),
    country: z.string().min(1).optional()
  })
  .optional();

const schema = z.object({
  businessId: z.string().uuid(),
  items: z.array(itemSchema).min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: addressSchema
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { businessId, items, customerName, customerEmail, customerPhone, shippingAddress } = parsed.data;
  const stripe = getStripe();
  const supabaseReady = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseReady || businessId === demoBusiness.id) {
    const matchedProducts = items
      .map((item) => {
        const product = demoProducts.find((entry) => entry.id === item.productId && entry.business_id === businessId && entry.is_active);
        return product ? { product, qty: item.qty } : null;
      })
      .filter((entry): entry is { product: (typeof demoProducts)[number]; qty: number } => Boolean(entry));

    if (matchedProducts.length !== items.length) {
      return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });
    }

    if (matchedProducts.some(({ product }) => !product.in_stock)) {
      return NextResponse.json({ error: 'One or more products are out of stock' }, { status: 400 });
    }

    const total = matchedProducts.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
    const paymentIntent = stripe
      ? await stripe.paymentIntents.create({
          amount: total,
          currency: demoBusiness.currency,
          automatic_payment_methods: { enabled: true },
          application_fee_amount: 0,
          metadata: {
            type: 'order',
            businessId,
            customerName,
            customerEmail
          }
        })
      : null;

    return NextResponse.json({
      orderId: crypto.randomUUID(),
      clientSecret: paymentIntent?.client_secret ?? 'pi_mock_secret_demo',
      amount: total
    });
  }

  const supabase = createClient();
  const { data: business } = await supabase.from('businesses').select('id,currency,stripe_account_id').eq('id', businessId).maybeSingle();
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  const productIds = items.map((item) => item.productId);
  const { data: products } = await supabase.from('products').select('*').eq('business_id', businessId).in('id', productIds).eq('is_active', true);
  if (!products || products.length !== productIds.length) {
    return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });
  }

  const mappedItems = items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? { product, qty: item.qty } : null;
  });

  if (mappedItems.some((entry) => !entry || !entry.product.in_stock)) {
    return NextResponse.json({ error: 'One or more products are out of stock' }, { status: 400 });
  }

  const normalizedItems = mappedItems.filter((entry): entry is NonNullable<(typeof mappedItems)[number]> => Boolean(entry));
  const total = normalizedItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  const paymentIntent = stripe
    ? await stripe.paymentIntents.create({
        amount: total,
        currency: business.currency ?? 'usd',
        automatic_payment_methods: { enabled: true },
        application_fee_amount: 0,
        transfer_data: business.stripe_account_id ? { destination: business.stripe_account_id } : undefined,
        metadata: {
          type: 'order',
          businessId,
          customerName,
          customerEmail
        }
      })
    : null;

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      business_id: businessId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items: normalizedItems.map(({ product, qty }) => ({ productId: product.id, qty, name: product.name, price: product.price })),
      total_amount: total,
      currency: business.currency ?? 'usd',
      status: 'pending',
      payment_intent_id: paymentIntent?.id,
      shipping_address: shippingAddress ?? null
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    orderId: order.id,
    clientSecret: paymentIntent?.client_secret ?? 'pi_mock_secret_demo',
    amount: total
  });
}

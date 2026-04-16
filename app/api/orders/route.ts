import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { checkoutSchema, createCheckoutSession } from '@/lib/payments/checkout';

const legacySchema = checkoutSchema.extend({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      qty: z.number().int().min(1).max(10)
    })
  ),
  customerPhone: z.string().optional(),
  shippingAddress: z
    .object({
      line1: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      region: z.string().min(1).optional(),
      postalCode: z.string().min(1).optional(),
      country: z.string().min(1).optional()
    })
    .optional()
});

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getRateLimitKey(req, 'orders'), 10, 60_000);
    if (!rateLimit.ok) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try again shortly.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = legacySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createCheckoutSession({
      businessId: parsed.data.businessId,
      items: parsed.data.items.map((item) => ({ productId: item.productId, quantity: item.qty })),
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      shippingAddress: parsed.data.shippingAddress
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error, details: result.details }, { status: result.status });
    }

    return NextResponse.json({
      orderId: result.paymentIntentId,
      paymentIntentId: result.paymentIntentId,
      clientSecret: result.clientSecret,
      amount: result.total
    });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

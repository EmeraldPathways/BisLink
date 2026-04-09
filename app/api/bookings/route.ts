import { z } from 'zod';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';

const schema = z.object({
  businessId: z.string().uuid(),
  serviceId: z.string(),
  startTime: z.string().datetime(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional()
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { businessId: parsed.data.businessId, serviceId: parsed.data.serviceId, startTime: parsed.data.startTime }
  });

  return NextResponse.json({ bookingId: 'pending-booking-id', clientSecret: paymentIntent.client_secret });
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkoutSchema, createCheckoutSession } from '@/lib/payments/checkout';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await createCheckoutSession(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status },
      );
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      total: result.total,
    });
  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

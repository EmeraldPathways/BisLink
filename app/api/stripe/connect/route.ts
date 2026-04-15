import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getCurrentOwnerBusinessForRequest } from '@/lib/owner';

export const dynamic = 'force-dynamic';

export async function GET() {
  const context = await getCurrentOwnerBusinessForRequest();
  if (!context?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!context.business) {
    return NextResponse.json({ url: '/onboarding' });
  }

  const stripe = getStripe();
  const { business } = context;
  if (!stripe || !business.stripe_account_id) {
    return NextResponse.json({ url: '/payouts?connectUnavailable=1' });
  }

  const accountLink = await stripe.accountLinks.create({
    account: business.stripe_account_id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/payouts`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/payouts`,
    type: 'account_onboarding'
  });

  return NextResponse.json({ url: accountLink.url });
}

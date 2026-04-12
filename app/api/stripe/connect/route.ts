import { NextResponse } from 'next/server';
import { demoBusiness } from '@/lib/demo-data';
import { getStripe } from '@/lib/stripe/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stripe = getStripe();
  if (!stripe || !demoBusiness.stripe_account_id || demoBusiness.stripe_account_id === 'acct_demo') {
    return NextResponse.json({ url: '/dashboard/payouts?demoConnect=1' });
  }

  const accountLink = await stripe.accountLinks.create({
    account: demoBusiness.stripe_account_id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/payouts`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/payouts`,
    type: 'account_onboarding'
  });

  return NextResponse.json({ url: accountLink.url });
}

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getCurrentOwnerBusinessForRequest } from '@/lib/owner';
import { createAdminClient } from '@/lib/supabase/server';

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
  if (!stripe) {
    return NextResponse.json({ url: '/payouts?connectUnavailable=1' });
  }

  let stripeAccountId = business.stripe_account_id;
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual',
      email: context.user.email ?? business.email ?? undefined,
      business_profile: {
        name: business.name,
        product_description: business.category
      }
    });
    stripeAccountId = account.id;

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured' }, { status: 500 });
    }

    const { error } = await admin.from('businesses').update({ stripe_account_id: stripeAccountId }).eq('id', business.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/payouts`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/payouts`,
    type: 'account_onboarding'
  });

  return NextResponse.json({ url: accountLink.url });
}

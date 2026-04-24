import { NextRequest, NextResponse } from 'next/server';
import { writeAppLog } from '@/lib/app-logs';
import { getStripe } from '@/lib/stripe/client';
import { getCurrentOwnerBusinessForRequest } from '@/lib/owner';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const context = await getCurrentOwnerBusinessForRequest();
  if (!context?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!context.business) {
    return NextResponse.json({ url: '/onboarding' });
  }

  const stripe = getStripe();
  const ownerContext = context;
  const { business } = ownerContext;
  if (!stripe) {
    return NextResponse.json({ url: '/payouts?connectUnavailable=1' });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: 'Supabase admin client is not configured' },
      { status: 500 },
    );
  }

  const stripeClient = stripe;
  const adminClient = admin;
  const appUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    req.nextUrl.origin;

  async function createStripeAccount() {
    const account = await stripeClient.accounts.create({
      type: 'express',
      business_type: 'individual',
      email:
        ownerContext.user.email ??
        business.email ??
        business.contact_email ??
        undefined,
      business_profile: {
        name: business.name,
        product_description: business.category,
      },
    });

    const { error } = await adminClient
      .from('businesses')
      .update({ stripe_account_id: account.id })
      .eq('id', business.id);

    if (error) {
      throw new Error(error.message);
    }

    return account.id;
  }

  try {
    let stripeAccountId = business.stripe_account_id;

    if (stripeAccountId) {
      try {
        await stripeClient.accounts.retrieve(stripeAccountId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Stripe account lookup failed';

        await writeAppLog({
          level: 'warn',
          source: 'api/stripe/connect',
          event: 'stripe_account_lookup_failed',
          message,
          context: {
            business_id: business.id,
            stripe_account_id: stripeAccountId,
          },
        });

        stripeAccountId = null;
      }
    }

    if (!stripeAccountId) {
      stripeAccountId = await createStripeAccount();
    }

    const accountLink = await stripeClient.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/payouts`,
      return_url: `${appUrl}/payouts`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to start Stripe onboarding';

    await writeAppLog({
      level: 'error',
      source: 'api/stripe/connect',
      event: 'stripe_connect_failed',
      message,
      context: {
        business_id: business.id,
        owner_id: ownerContext.user.id,
        stripe_account_id: business.stripe_account_id,
        app_url: appUrl,
      },
    });

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { requireAdminApiUser } from '@/lib/admin-api';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adminUser = await requireAdminApiUser();
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const { data: business, error } = await adminUser.admin
    .from('businesses')
    .select('id,owner_id,name,category,email,contact_email,stripe_account_id')
    .eq('id', id)
    .single();

  if (error || !business) {
    return NextResponse.json({ error: error?.message ?? 'Business not found' }, { status: 404 });
  }

  let stripeAccountId = business.stripe_account_id;
  if (!stripeAccountId) {
    const owner = await adminUser.admin.auth.admin.getUserById(business.owner_id).catch(() => null);
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: 'individual',
      email: owner?.data.user?.email ?? business.email ?? business.contact_email ?? undefined,
      business_profile: {
        name: business.name,
        product_description: business.category
      }
    });
    stripeAccountId = account.id;

    const { error: updateError } = await adminUser.admin.from('businesses').update({ stripe_account_id: stripeAccountId }).eq('id', business.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${appUrl}/admin/businesses/${business.id}`,
    return_url: `${appUrl}/admin/businesses/${business.id}`,
    type: 'account_onboarding'
  });

  return NextResponse.json({ url: accountLink.url });
}

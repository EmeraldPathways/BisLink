import { startOfMonth, subDays } from 'date-fns';
import { ADMIN_EMAIL } from '@/lib/admin';
import { getAgentDiagnostics } from '@/lib/agent-diagnostics';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/server';
import type { AgentDiagnostics, DiagnosticCheck, DiagnosticState } from '@/types';

type RawBusiness = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  category: string;
  is_active: boolean | null;
  stripe_onboarded: boolean | null;
  stripe_account_id: string | null;
  google_cal_token: unknown;
  microsoft_cal_token: unknown;
  created_at: string | null;
  email: string | null;
  contact_email: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  currency: string | null;
};

type BusinessCountSummary = {
  services: number;
  products: number;
  reviews: number;
  customers: number;
  availability: number;
};

type ActivitySummary = {
  latestBookingAt: string | null;
  latestOrderAt: string | null;
};

export async function getAdminOverviewData() {
  const admin = createAdminClient();
  const diagnostics = await getAgentDiagnostics('quick');
  const monthStart = startOfMonth(new Date()).toISOString();
  const recentCutoff = subDays(new Date(), 30).toISOString();

  const [
    { count: totalBusinesses },
    { count: activeBusinesses },
    { count: stripeReadyBusinesses },
    { count: totalCustomers },
    { count: recentBookings },
    { count: recentOrders },
    { count: unpublishedReviews },
    { data: monthBookings },
    { data: monthOrders },
    { data: businesses }
  ] = await (admin
    ? Promise.all([
        admin.from('businesses').select('*', { count: 'exact', head: true }),
        admin.from('businesses').select('*', { count: 'exact', head: true }).eq('is_active', true),
        admin.from('businesses').select('*', { count: 'exact', head: true }).eq('stripe_onboarded', true),
        admin.from('customers').select('*', { count: 'exact', head: true }),
        admin.from('bookings').select('*', { count: 'exact', head: true }).gte('start_time', recentCutoff),
        admin.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', recentCutoff),
        admin.from('reviews').select('*', { count: 'exact', head: true }).eq('is_published', false),
        admin.from('bookings').select('amount_paid,payment_status,status').gte('start_time', monthStart),
        admin.from('orders').select('total_amount,status').gte('created_at', monthStart),
        admin.from('businesses').select('id,google_cal_token,microsoft_cal_token,stripe_account_id,stripe_onboarded')
      ])
    : Promise.resolve([
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { count: 0 },
        { data: [] },
        { data: [] },
        { data: [] }
      ]));

  const stripeBusinesses = (businesses ?? []) as Array<{
    id: string;
    google_cal_token: unknown;
    microsoft_cal_token: unknown;
    stripe_account_id: string | null;
    stripe_onboarded: boolean | null;
  }>;

  const monthlyRevenue =
    ((monthBookings ?? []) as Array<{ amount_paid: number | null; payment_status: string; status: string }>).reduce(
      (sum, booking) => sum + (booking.payment_status === 'paid' && booking.status !== 'cancelled' ? booking.amount_paid ?? 0 : 0),
      0
    ) +
    ((monthOrders ?? []) as Array<{ total_amount: number; status: string }>).reduce(
      (sum, order) => sum + (order.status === 'paid' || order.status === 'fulfilled' ? order.total_amount : 0),
      0
    );

  const payouts = await getPlatformPayoutSummary(
    stripeBusinesses
      .filter((business) => business.stripe_onboarded && business.stripe_account_id)
      .map((business) => business.stripe_account_id as string)
  );

  const supabaseAdmin = getDiagnosticsCheck(diagnostics, 'supabase.admin');
  const stripeSecret = getDiagnosticsCheck(diagnostics, 'stripe.secret_key');
  const stripeWebhook = getDiagnosticsCheck(diagnostics, 'stripe.webhook_secret');
  const googleOauth = getDiagnosticsCheck(diagnostics, 'google.oauth');
  const bookingLifecycle = getDiagnosticsCheck(diagnostics, 'lifecycle.booking');
  const orderLifecycle = getDiagnosticsCheck(diagnostics, 'lifecycle.order');
  const lifecycleToken = getDiagnosticsCheck(diagnostics, 'lifecycle.auth_token');

  return {
    metrics: {
      totalBusinesses: totalBusinesses ?? 0,
      activeBusinesses: activeBusinesses ?? 0,
      stripeReadyBusinesses: stripeReadyBusinesses ?? 0,
      stripeMissingBusinesses: Math.max((totalBusinesses ?? 0) - (stripeReadyBusinesses ?? 0), 0),
      totalCustomers: totalCustomers ?? 0,
      recentBookings: recentBookings ?? 0,
      recentOrders: recentOrders ?? 0,
      monthlyRevenue,
      unpublishedReviews: unpublishedReviews ?? 0,
      inTransitPayouts: payouts.inTransit
    },
    health: [
      { label: 'Supabase', value: supabaseAdmin?.summary ?? 'Missing', tone: toneForCheck(supabaseAdmin) },
      {
        label: 'Stripe',
        value: summarizeChecks([stripeSecret, stripeWebhook]),
        tone: toneForChecks([stripeSecret, stripeWebhook])
      },
      {
        label: 'Google Calendar',
        value: googleOauth?.summary ?? 'Missing',
        tone: toneForCheck(googleOauth)
      },
      {
        label: 'Agents',
        value: `${diagnostics.overallStatus} • ${diagnostics.summary.fail} fail / ${diagnostics.summary.warn} warn`,
        tone: diagnostics.overallStatus === 'healthy' ? ('success' as const) : ('warning' as const)
      },
      {
        label: 'Lifecycle Functions',
        value: summarizeChecks([bookingLifecycle, orderLifecycle, lifecycleToken]),
        tone: toneForChecks([bookingLifecycle, orderLifecycle, lifecycleToken])
      }
    ],
    diagnostics
  };
}

export async function getAdminAgentsData() {
  const diagnostics = await getAgentDiagnostics('full');

  return {
    diagnostics,
    cards: diagnostics.checks.map((check) => ({
      id: check.name,
      label: check.label,
      name: check.name,
      state: check.state,
      level: check.level,
      summary: check.summary,
      details: formatDiagnosticDetails(check.details),
      lastRun: diagnostics.timestamp
    }))
  };
}

export async function getAdminSettingsData() {
  const diagnostics = await getAgentDiagnostics('full');
  const supabaseAdmin = getDiagnosticsCheck(diagnostics, 'supabase.admin');
  const stripeSecret = getDiagnosticsCheck(diagnostics, 'stripe.secret_key');
  const stripeWebhook = getDiagnosticsCheck(diagnostics, 'stripe.webhook_secret');
  const resendApiKey = getDiagnosticsCheck(diagnostics, 'resend.api_key');
  const emailFrom = getDiagnosticsCheck(diagnostics, 'email.from');
  const resend = getDiagnosticsCheck(diagnostics, 'resend.email');
  const googleOAuth = getDiagnosticsCheck(diagnostics, 'google.oauth');
  const bookingLifecycle = getDiagnosticsCheck(diagnostics, 'lifecycle.booking');
  const orderLifecycle = getDiagnosticsCheck(diagnostics, 'lifecycle.order');
  const lifecycleToken = getDiagnosticsCheck(diagnostics, 'lifecycle.auth_token');

  return {
    groups: [
      {
        title: 'Authentication',
        items: [
          { label: 'Admin sign-in', value: 'Configured', state: 'configured' as DiagnosticState, details: [] },
          { label: 'Admin access model', value: 'Configured', state: 'configured' as DiagnosticState, details: [] },
          { label: 'Primary admin', value: ADMIN_EMAIL, state: 'configured' as DiagnosticState, details: [] }
        ]
      },
      {
        title: 'Integrations',
        items: [
          diagnosticSettingItem(supabaseAdmin),
          diagnosticSettingItem(stripeSecret),
          diagnosticSettingItem(stripeWebhook),
          diagnosticSettingItem(resendApiKey),
          diagnosticSettingItem(emailFrom),
          diagnosticSettingItem(resend),
          diagnosticSettingItem(googleOAuth)
        ]
      },
      {
        title: 'Operations',
        items: [
          diagnosticSettingItem(bookingLifecycle),
          diagnosticSettingItem(orderLifecycle),
          diagnosticSettingItem(lifecycleToken),
          diagnosticSettingItem(getDiagnosticsCheck(diagnostics, 'app.url')),
          {
            label: 'Agent diagnostics',
            value: diagnostics.overallStatus,
            state: diagnostics.overallStatus === 'healthy' ? ('configured' as DiagnosticState) : ('partial' as DiagnosticState),
            details: [`Last check ${new Date(diagnostics.timestamp).toLocaleString()}`]
          }
        ]
      }
    ]
  };
}

export async function getAdminBusinessesData(search?: string) {
  const admin = requireAdminClient();
  const normalizedSearch = search?.trim().toLowerCase() ?? '';
  const { data } = await admin
    .from('businesses')
    .select('id,owner_id,slug,name,category,is_active,stripe_onboarded,stripe_account_id,google_cal_token,microsoft_cal_token,created_at,email,contact_email,bio,location,timezone,currency')
    .order('created_at', { ascending: false });

  const businesses = ((data ?? []) as RawBusiness[]).filter((business) => {
    if (!normalizedSearch) return true;
    return [business.name, business.slug, business.category, business.email, business.contact_email]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedSearch));
  });

  const rows = await Promise.all(
    businesses.map(async (business) => {
      const [counts, activity, ownerEmail] = await Promise.all([
        getBusinessCounts(admin, business.id),
        getBusinessActivity(admin, business.id),
        getOwnerEmail(admin, business.owner_id, business)
      ]);

      return {
        ...business,
        ownerEmail,
        counts,
        latestActivityAt:
          activity.latestOrderAt && activity.latestBookingAt
            ? activity.latestOrderAt > activity.latestBookingAt
              ? activity.latestOrderAt
              : activity.latestBookingAt
            : activity.latestOrderAt ?? activity.latestBookingAt
      };
    })
  );

  return { businesses: rows, search: search ?? '' };
}

export async function getAdminBusinessDetailData(id: string) {
  const admin = requireAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('id,owner_id,slug,name,category,is_active,stripe_onboarded,stripe_account_id,google_cal_token,microsoft_cal_token,created_at,email,contact_email,bio,location,timezone,currency')
    .eq('id', id)
    .single();

  const typedBusiness = business as RawBusiness | null;
  if (!typedBusiness) return null;

  const [services, products, reviews, customers, bookings, orders, counts, ownerEmail] = await Promise.all([
    admin.from('services').select('*').eq('business_id', id).order('sort_order', { ascending: true }),
    admin.from('products').select('*').eq('business_id', id).order('sort_order', { ascending: true }),
    admin.from('reviews').select('*').eq('business_id', id).order('created_at', { ascending: false }).limit(20),
    admin.from('customers').select('*').eq('business_id', id).order('last_activity_at', { ascending: false, nullsFirst: false }).limit(20),
    admin.from('bookings').select('*').eq('business_id', id).order('start_time', { ascending: false }).limit(20),
    admin.from('orders').select('*').eq('business_id', id).order('created_at', { ascending: false }).limit(20),
    getBusinessCounts(admin, id),
    getOwnerEmail(admin, typedBusiness.owner_id, typedBusiness)
  ]);

  const onboarding = {
    businessInfo: Boolean(typedBusiness.name && typedBusiness.category && typedBusiness.slug),
    servicesAdded: counts.services > 0,
    availabilitySet: counts.availability > 0,
    stripeConnected: Boolean(typedBusiness.stripe_onboarded),
    profileFilled: Boolean(typedBusiness.bio && typedBusiness.location)
  };

  return {
    business: {
      ...typedBusiness,
      ownerEmail
    },
    onboarding,
    counts,
    services: services.data ?? [],
    products: products.data ?? [],
    reviews: reviews.data ?? [],
    customers: customers.data ?? [],
    bookings: bookings.data ?? [],
    orders: orders.data ?? []
  };
}

export async function getAdminSupportData() {
  const admin = requireAdminClient();
  const [reviews, businesses, refundedOrders, refundedBookings] = await Promise.all([
    admin.from('reviews').select('id,business_id,customer_name,rating,text,is_published,created_at').order('created_at', { ascending: false }).limit(25),
    admin
      .from('businesses')
      .select('id,owner_id,slug,name,category,is_active,stripe_onboarded,stripe_account_id,google_cal_token,microsoft_cal_token,created_at,email,contact_email,bio,location,timezone,currency')
      .order('created_at', { ascending: false }),
    admin.from('orders').select('id,business_id,customer_name,status,total_amount,created_at').eq('status', 'refunded').order('created_at', { ascending: false }).limit(20),
    admin
      .from('bookings')
      .select('id,business_id,customer_name,status,payment_status,amount_paid,start_time')
      .or('status.eq.cancelled,payment_status.eq.refunded')
      .order('start_time', { ascending: false })
      .limit(20)
  ]);

  const businessRows = (businesses.data ?? []) as RawBusiness[];
  const onboardingRisks = await Promise.all(
    businessRows.map(async (business) => {
      const counts = await getBusinessCounts(admin, business.id);
      const missing: string[] = [];

      if (!counts.services) missing.push('No services');
      if (!counts.availability) missing.push('No availability');
      if (!business.stripe_onboarded) missing.push('Stripe incomplete');
      if (!business.google_cal_token && !business.microsoft_cal_token) missing.push('Calendar disconnected');

      return {
        business,
        counts,
        missing
      };
    })
  );

  return {
    reviews: reviews.data ?? [],
    onboardingRisks: onboardingRisks.filter((item) => item.missing.length > 0),
    refundedOrders: refundedOrders.data ?? [],
    bookingIssues: refundedBookings.data ?? []
  };
}

export async function getAdminFinanceData() {
  const admin = requireAdminClient();
  const monthStart = startOfMonth(new Date()).toISOString();
  const weekStart = subDays(new Date(), 7).toISOString();

  const [businesses, monthBookings, monthOrders, weekBookings, weekOrders] = await Promise.all([
    admin
      .from('businesses')
      .select('id,owner_id,slug,name,category,is_active,stripe_onboarded,stripe_account_id,google_cal_token,microsoft_cal_token,created_at,email,contact_email,bio,location,timezone,currency'),
    admin.from('bookings').select('business_id,amount_paid,payment_status,status,start_time').gte('start_time', monthStart),
    admin.from('orders').select('business_id,total_amount,status,created_at').gte('created_at', monthStart),
    admin.from('bookings').select('business_id,amount_paid,payment_status,status,start_time').gte('start_time', weekStart),
    admin.from('orders').select('business_id,total_amount,status,created_at').gte('created_at', weekStart)
  ]);

  const businessRows = (businesses.data ?? []) as RawBusiness[];
  const weekRevenue = calculateRevenue(
    (weekBookings.data ?? []) as Array<{ amount_paid: number | null; payment_status: string; status: string }>,
    (weekOrders.data ?? []) as Array<{ total_amount: number; status: string }>
  );
  const monthRevenue = calculateRevenue(
    (monthBookings.data ?? []) as Array<{ amount_paid: number | null; payment_status: string; status: string }>,
    (monthOrders.data ?? []) as Array<{ total_amount: number; status: string }>
  );

  const businessRevenue = businessRows.map((business) => ({
    business,
    monthRevenue:
      ((monthBookings.data ?? []) as Array<{ business_id: string; amount_paid: number | null; payment_status: string; status: string }>).reduce(
        (sum, booking) => sum + (booking.business_id === business.id && booking.payment_status === 'paid' && booking.status !== 'cancelled' ? booking.amount_paid ?? 0 : 0),
        0
      ) +
      ((monthOrders.data ?? []) as Array<{ business_id: string; total_amount: number; status: string }>).reduce(
        (sum, order) => sum + (order.business_id === business.id && (order.status === 'paid' || order.status === 'fulfilled') ? order.total_amount : 0),
        0
      )
  }));

  const payoutSummary = await getPlatformPayoutSummary(
    businessRows.filter((business) => business.stripe_onboarded && business.stripe_account_id).map((business) => business.stripe_account_id as string)
  );

  return {
    totals: {
      weekRevenue,
      monthRevenue,
      connectedAccounts: businessRows.filter((business) => business.stripe_onboarded).length,
      inTransitPayouts: payoutSummary.inTransit
    },
    businessesNeedingAttention: businessRows.filter((business) => !business.stripe_onboarded || !business.stripe_account_id),
    topBusinesses: businessRevenue.sort((a, b) => b.monthRevenue - a.monthRevenue).slice(0, 10)
  };
}

function requireAdminClient() {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error('Supabase admin client is not configured');
  }
  return admin;
}

async function getPlatformPayoutSummary(stripeAccountIds: string[]) {
  const stripe = getStripe();
  if (!stripe || stripeAccountIds.length === 0) {
    return { inTransit: 0 };
  }

  let inTransit = 0;
  await Promise.all(
    stripeAccountIds.slice(0, 50).map(async (accountId) => {
      try {
        const payouts = await stripe.payouts.list({ limit: 5 }, { stripeAccount: accountId });
        inTransit += payouts.data.filter((payout) => payout.status === 'in_transit').length;
      } catch {
        inTransit += 0;
      }
    })
  );

  return { inTransit };
}

async function getBusinessCounts(admin: NonNullable<ReturnType<typeof createAdminClient>>, businessId: string): Promise<BusinessCountSummary> {
  const [{ count: services }, { count: products }, { count: reviews }, { count: customers }, { count: availability }] = await Promise.all([
    admin.from('services').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true),
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    admin.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', businessId),
    admin.from('availability').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('is_active', true)
  ]);

  return {
    services: services ?? 0,
    products: products ?? 0,
    reviews: reviews ?? 0,
    customers: customers ?? 0,
    availability: availability ?? 0
  };
}

async function getBusinessActivity(admin: NonNullable<ReturnType<typeof createAdminClient>>, businessId: string): Promise<ActivitySummary> {
  const [{ data: booking }, { data: order }] = await Promise.all([
    admin.from('bookings').select('start_time').eq('business_id', businessId).order('start_time', { ascending: false }).limit(1).maybeSingle(),
    admin.from('orders').select('created_at').eq('business_id', businessId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  ]);

  return {
    latestBookingAt: (booking as { start_time?: string } | null)?.start_time ?? null,
    latestOrderAt: (order as { created_at?: string } | null)?.created_at ?? null
  };
}

async function getOwnerEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  ownerId: string,
  business: Pick<RawBusiness, 'email' | 'contact_email'>
) {
  try {
    const { data } = await admin.auth.admin.getUserById(ownerId);
    return data.user?.email ?? business.email ?? business.contact_email ?? 'Unknown owner';
  } catch {
    return business.email ?? business.contact_email ?? 'Unknown owner';
  }
}

function calculateRevenue(
  bookings: Array<{ amount_paid: number | null; payment_status: string; status: string }>,
  orders: Array<{ total_amount: number; status: string }>
) {
  return (
    bookings.reduce((sum, booking) => sum + (booking.payment_status === 'paid' && booking.status !== 'cancelled' ? booking.amount_paid ?? 0 : 0), 0) +
    orders.reduce((sum, order) => sum + (order.status === 'paid' || order.status === 'fulfilled' ? order.total_amount : 0), 0)
  );
}

function getDiagnosticsCheck(diagnostics: AgentDiagnostics, name: string) {
  return diagnostics.checks.find((check) => check.name === name);
}

function summarizeChecks(checks: Array<DiagnosticCheck | undefined>) {
  const present = checks.filter((check): check is DiagnosticCheck => Boolean(check));
  if (!present.length) return 'Missing';
  if (present.every((check) => check.state === 'configured')) return 'Configured';
  if (present.some((check) => check.state === 'runtime incomplete')) return 'Configured but runtime-incomplete';
  if (present.some((check) => check.state === 'pending processing')) return 'Pending processing';
  if (present.some((check) => check.state === 'reconnect needed')) return 'Reconnect needed';
  if (present.some((check) => check.state === 'partial')) return 'Partially configured';
  if (present.some((check) => check.state === 'missing')) return 'Missing';
  return present[0]?.summary ?? 'Missing';
}

function toneForCheck(check?: DiagnosticCheck) {
  return check?.level === 'ok' ? ('success' as const) : ('warning' as const);
}

function toneForChecks(checks: Array<DiagnosticCheck | undefined>) {
  return checks.every((check) => check?.level === 'ok') ? ('success' as const) : ('warning' as const);
}

function diagnosticSettingItem(check?: DiagnosticCheck) {
  return {
    label: check?.label ?? 'Unknown check',
    value: check?.summary ?? 'Missing',
    state: check?.state ?? ('missing' as DiagnosticState),
    details: formatDiagnosticDetails(check?.details)
  };
}

function formatDiagnosticDetails(details?: Record<string, boolean | string | number | null>) {
  if (!details) return [];

  return Object.entries(details).map(([key, value]) => {
    if (typeof value === 'boolean') {
      return `${humanizeKey(key)}: ${value ? 'Yes' : 'No'}`;
    }

    return `${humanizeKey(key)}: ${value == null ? 'None' : String(value)}`;
  });
}

function humanizeKey(value: string) {
  return value.replace(/_/g, ' ');
}

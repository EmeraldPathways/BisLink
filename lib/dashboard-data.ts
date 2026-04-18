import { addDays, format, startOfWeek, subDays } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';
import { getCurrentOwnerBusiness } from '@/lib/owner';
import type {
  AvailabilityRecord,
  BlockedTimeRecord,
  BookingRecord,
  BusinessProfile,
  CredentialRecord,
  CustomerRecord,
  DashboardBookingRecord,
  DashboardStats,
  PayoutRecord,
  ProductRecord,
  PublicPageData,
  RevenuePoint,
  ReviewRecord,
  ServiceRecord,
  SpecialismRecord
} from '@/types';

const DEFAULT_CURRENCY = 'usd';

export async function getDashboardShellData() {
  return getCurrentOwnerBusiness();
}

export async function getTodayViewData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const startDate = subDays(new Date(), 31).toISOString();

  const [{ data: bookings }, { data: orders }, { count: customerCount }, { count: productCount }, { count: reviewCount }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id,business_id,service_id,customer_name,customer_email,customer_phone,start_time,end_time,status,payment_status,payment_intent_id,amount_paid,currency,review_token,notes,confirmation_sent,google_event_id')
      .eq('business_id', business.id)
      .gte('start_time', startDate)
      .order('start_time', { ascending: true }),
    supabase.from('orders').select('total_amount,status,created_at,confirmation_sent').eq('business_id', business.id).gte('created_at', startDate),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business.id),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_active', true),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('is_published', true)
  ]);

  const serviceMap = await getServiceMap(business.id);
  const dashboardBookings = enrichBookings((bookings ?? []) as BookingRecord[], serviceMap);
  const stats = buildDashboardStats(business, dashboardBookings, (orders ?? []) as Array<{ total_amount: number; status: string; created_at: string | null }>, {
    customers: customerCount ?? 0,
    products: productCount ?? 0,
    reviews: reviewCount ?? 0
  });
  const todayKey = getTimeZoneDateKey(new Date(), business.timezone);

  return {
    business,
    bookings: dashboardBookings.filter((booking) => getTimeZoneDateKey(new Date(booking.start_time), business.timezone) === todayKey),
    stats
  };
}

export async function getCalendarData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 7);
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id,business_id,service_id,customer_name,customer_email,customer_phone,start_time,end_time,status,payment_status,payment_intent_id,amount_paid,currency,review_token,notes,confirmation_sent,google_event_id')
    .eq('business_id', business.id)
    .gte('start_time', weekStart.toISOString())
    .lt('start_time', weekEnd.toISOString())
    .order('start_time', { ascending: true });

  const serviceMap = await getServiceMap(business.id);
  return { business, bookings: enrichBookings((bookings ?? []) as BookingRecord[], serviceMap) };
}

export async function getCustomersData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const { data } = await supabase
    .from('customers')
    .select('id,business_id,name,email,phone,total_bookings,total_orders,total_spent,last_booking_at,first_booking_at,last_activity_at,first_activity_at,notes')
    .eq('business_id', business.id)
    .order('last_activity_at', { ascending: false, nullsFirst: false });

  return { business, customers: ((data ?? []) as CustomerRecord[]).map(normalizeCustomer) };
}

export async function getServicesData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true });

  return { business, services: ((data ?? []) as ServiceRecord[]).map(normalizeService) };
}

export async function getProductsData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('id,business_id,name,description,price,original_price,category,badge,emoji,image_url,is_active,in_stock,is_digital,digital_url,sort_order,rating,review_count')
    .eq('business_id', business.id)
    .order('sort_order', { ascending: true });

  const products = ((data ?? []) as ProductRecord[]).map(normalizeProduct);
  return { business, products, activeProductCount: products.filter((product) => product.is_active).length };
}

export async function getReviewsData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const { data } = await supabase
    .from('reviews')
    .select('id,business_id,booking_id,customer_name,customer_email,rating,text,is_verified,is_published,created_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const reviews = ((data ?? []) as ReviewRecord[]).map(normalizeReview);
  const visible = reviews.filter((review) => review.is_published);
  return {
    business,
    reviews,
    average: visible.reduce((sum, review) => sum + review.rating, 0) / Math.max(visible.length, 1)
  };
}

export async function getAvailabilityData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const [{ data: availability }, { data: blockedTimes }] = await Promise.all([
    supabase
      .from('availability')
      .select('id,business_id,day_of_week,start_time,end_time,is_active')
      .eq('business_id', business.id)
      .order('day_of_week', { ascending: true }),
    supabase
      .from('blocked_times')
      .select('id,business_id,start_time,end_time,reason')
      .eq('business_id', business.id)
      .order('start_time', { ascending: true })
  ]);

  return {
    business,
    availability: ((availability ?? []) as AvailabilityRecord[]).map(normalizeAvailability),
    blockedTimes: ((blockedTimes ?? []) as BlockedTimeRecord[]).map(normalizeBlockedTime)
  };
}

export async function getLinkData() {
  const { business } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const [{ data: services }, { data: products }, { data: reviews }, { data: credentials }, { data: specialisms }] = await Promise.all([
    supabase
      .from('services')
      .select('id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji')
      .eq('business_id', business.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('id,business_id,name,description,price,original_price,category,badge,emoji,image_url,is_active,in_stock,is_digital,digital_url,sort_order,rating,review_count')
      .eq('business_id', business.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('reviews')
      .select('id,business_id,booking_id,customer_name,customer_email,rating,text,is_verified,is_published,created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false }),
    supabase.from('credentials').select('id,business_id,label,sort_order').eq('business_id', business.id).order('sort_order', { ascending: true }),
    supabase.from('specialisms').select('id,business_id,label,sort_order').eq('business_id', business.id).order('sort_order', { ascending: true })
  ]);

  return {
    business,
    publicPage: {
      business,
      services: ((services ?? []) as ServiceRecord[]).map(normalizeService),
      products: ((products ?? []) as ProductRecord[]).map(normalizeProduct),
      reviews: ((reviews ?? []) as ReviewRecord[]).map(normalizeReview),
      credentials: ((credentials ?? []) as CredentialRecord[]).map(normalizeCredential),
      specialisms: ((specialisms ?? []) as SpecialismRecord[]).map(normalizeSpecialism)
    } satisfies PublicPageData
  };
}

export async function getPayoutsData() {
  const { business, user } = await getCurrentOwnerBusiness();
  const supabase = createClient();
  const since = subDays(new Date(), 31).toISOString();

  const [{ data: bookings }, { data: orders }, { data: recentOrders }] = await Promise.all([
    supabase.from('bookings').select('amount_paid,payment_status,status,start_time').eq('business_id', business.id).gte('start_time', since),
    supabase.from('orders').select('total_amount,status,created_at,confirmation_sent').eq('business_id', business.id).gte('created_at', since),
    supabase
      .from('orders')
      .select('id,customer_name,customer_email,total_amount,status,created_at,confirmation_sent')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(8)
  ]);

  const paidBookings = (bookings ?? []) as Array<{ amount_paid: number | null; payment_status: string; status: string; start_time: string }>;
  const paidOrders = (orders ?? []) as Array<{ total_amount: number; status: string; created_at: string | null }>;
  const pendingOrders = ((recentOrders ?? []) as Array<{ status: string; confirmation_sent?: boolean | null }>).filter(
    (order) => (order.status === 'paid' || order.status === 'fulfilled') && order.confirmation_sent !== true
  ).length;

  return {
    business,
    contactStatus: getContactDeliveryStatus({
      businessEmail: business.contact_email ?? business.email ?? null,
      ownerEmail: user.email ?? null
    }),
    calendarStatus: getCalendarConnectionStatus(business.google_cal_token),
    orderConfirmationStatus: pendingOrders ? `${pendingOrders} pending confirmation` : 'No pending confirmations',
    payouts: await fetchPayouts(business),
    recentOrders:
      (recentOrders ?? []) as Array<{
        id: string;
        customer_name: string;
        customer_email: string;
        total_amount: number;
        status: string;
        created_at: string | null;
        confirmation_sent?: boolean | null;
      }>,
    revenue: buildRevenueSeries(business, paidBookings, paidOrders),
    totals: {
      week: revenueWithinWindow(business, paidBookings, paidOrders, 7),
      month: revenueWithinWindow(business, paidBookings, paidOrders, 31),
      allTime:
        paidBookings.filter((item) => item.payment_status === 'paid' && item.status !== 'cancelled').reduce((sum, item) => sum + (item.amount_paid ?? 0), 0) +
        paidOrders.filter((item) => item.status === 'paid' || item.status === 'fulfilled').reduce((sum, item) => sum + item.total_amount, 0)
    }
  };
}

function getCalendarConnectionStatus(token: unknown) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return 'Calendar unavailable';
  }

  if (!token) return 'Not connected';
  if (typeof token === 'object' && token && 'refresh_token' in token && (token as { refresh_token?: string | null }).refresh_token) {
    return 'Connected';
  }

  return 'Reconnect needed';
}

function getContactDeliveryStatus({
  businessEmail,
  ownerEmail
}: {
  businessEmail: string | null;
  ownerEmail: string | null;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return 'Delivery unavailable';
  }

  if (businessEmail || ownerEmail) {
    return 'Contact email configured';
  }

  return 'No recipient configured';
}

async function getServiceMap(businessId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('services')
    .select('id,business_id,name,description,duration_minutes,price,currency,max_concurrent,buffer_after,is_active,sort_order,tag,emoji')
    .eq('business_id', businessId);

  return new Map(((data ?? []) as ServiceRecord[]).map((service) => [service.id, normalizeService(service)]));
}

function enrichBookings(bookings: BookingRecord[], serviceMap: Map<string, ServiceRecord>): DashboardBookingRecord[] {
  return bookings.map((booking) => ({ ...booking, amount_paid: booking.amount_paid ?? 0, currency: booking.currency ?? DEFAULT_CURRENCY, service: serviceMap.get(booking.service_id) ?? null }));
}

function buildDashboardStats(
  business: BusinessProfile,
  bookings: DashboardBookingRecord[],
  orders: Array<{ total_amount: number; status: string; created_at: string | null }>,
  counts: { customers: number; products: number; reviews: number }
): DashboardStats {
  const todayKey = getTimeZoneDateKey(new Date(), business.timezone);
  const weekKeys = new Set(Array.from({ length: 7 }, (_, index) => getTimeZoneDateKey(subDays(new Date(), index), business.timezone)));
  const monthCutoff = subDays(new Date(), 31);
  const paidOrders = orders.filter((order) => order.status === 'paid' || order.status === 'fulfilled');

  return {
    todayBookings: bookings.filter((booking) => booking.status !== 'cancelled' && getTimeZoneDateKey(new Date(booking.start_time), business.timezone) === todayKey).length,
    todayRevenue:
      bookings
        .filter((booking) => booking.payment_status === 'paid' && booking.status !== 'cancelled' && getTimeZoneDateKey(new Date(booking.start_time), business.timezone) === todayKey)
        .reduce((sum, booking) => sum + booking.amount_paid, 0) +
      paidOrders
        .filter((order) => order.created_at && getTimeZoneDateKey(new Date(order.created_at), business.timezone) === todayKey)
        .reduce((sum, order) => sum + order.total_amount, 0),
    weekBookings: bookings.filter((booking) => booking.status !== 'cancelled' && weekKeys.has(getTimeZoneDateKey(new Date(booking.start_time), business.timezone))).length,
    weekRevenue:
      bookings
        .filter((booking) => booking.payment_status === 'paid' && booking.status !== 'cancelled' && weekKeys.has(getTimeZoneDateKey(new Date(booking.start_time), business.timezone)))
        .reduce((sum, booking) => sum + booking.amount_paid, 0) +
      paidOrders
        .filter((order) => order.created_at && weekKeys.has(getTimeZoneDateKey(new Date(order.created_at), business.timezone)))
        .reduce((sum, order) => sum + order.total_amount, 0),
    monthRevenue:
      bookings
        .filter((booking) => booking.payment_status === 'paid' && booking.status !== 'cancelled' && new Date(booking.start_time) >= monthCutoff)
        .reduce((sum, booking) => sum + booking.amount_paid, 0) +
      paidOrders
        .filter((order) => order.created_at && new Date(order.created_at) >= monthCutoff)
        .reduce((sum, order) => sum + order.total_amount, 0),
    customers: counts.customers,
    products: counts.products,
    reviews: counts.reviews
  };
}

function revenueWithinWindow(
  business: BusinessProfile,
  bookings: Array<{ amount_paid: number | null; payment_status: string; status: string; start_time: string }>,
  orders: Array<{ total_amount: number; status: string; created_at: string | null }>,
  days: number
) {
  const keys = new Set(Array.from({ length: days }, (_, index) => getTimeZoneDateKey(subDays(new Date(), index), business.timezone)));

  return (
    bookings
      .filter((booking) => booking.payment_status === 'paid' && booking.status !== 'cancelled' && keys.has(getTimeZoneDateKey(new Date(booking.start_time), business.timezone)))
      .reduce((sum, booking) => sum + (booking.amount_paid ?? 0), 0) +
    orders
      .filter((order) => (order.status === 'paid' || order.status === 'fulfilled') && order.created_at && keys.has(getTimeZoneDateKey(new Date(order.created_at), business.timezone)))
      .reduce((sum, order) => sum + order.total_amount, 0)
  );
}

function buildRevenueSeries(
  business: BusinessProfile,
  bookings: Array<{ amount_paid: number | null; payment_status: string; status: string; start_time: string }>,
  orders: Array<{ total_amount: number; status: string; created_at: string | null }>
): RevenuePoint[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = subDays(new Date(), 6 - offset);
    const key = getTimeZoneDateKey(date, business.timezone);
    const amount =
      bookings
        .filter((booking) => booking.payment_status === 'paid' && booking.status !== 'cancelled' && getTimeZoneDateKey(new Date(booking.start_time), business.timezone) === key)
        .reduce((sum, booking) => sum + (booking.amount_paid ?? 0), 0) +
      orders
        .filter((order) => (order.status === 'paid' || order.status === 'fulfilled') && order.created_at && getTimeZoneDateKey(new Date(order.created_at), business.timezone) === key)
        .reduce((sum, order) => sum + order.total_amount, 0);

    return { label: format(date, 'EEE'), amount };
  });
}

async function fetchPayouts(business: BusinessProfile): Promise<PayoutRecord[]> {
  const stripe = getStripe();
  if (!stripe || !business.stripe_onboarded || !business.stripe_account_id) return [];

  const payouts = await stripe.payouts.list({ limit: 10 }, { stripeAccount: business.stripe_account_id });
  return payouts.data.map((payout) => ({
    id: payout.id,
    amount: payout.amount,
    date: new Date((payout.arrival_date ?? payout.created) * 1000).toISOString(),
    status: payout.status === 'paid' ? 'paid' : 'in_transit'
  }));
}

function getTimeZoneDateKey(date: Date, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function normalizeService(service: ServiceRecord): ServiceRecord {
  return {
    ...service,
    description: service.description ?? '',
    currency: service.currency ?? DEFAULT_CURRENCY,
    max_concurrent: service.max_concurrent ?? 1,
    buffer_after: service.buffer_after ?? 0,
    is_active: service.is_active ?? true,
    sort_order: service.sort_order ?? 0,
    tag: service.tag ?? null,
    emoji: service.emoji ?? '✨'
  };
}

export function normalizeProduct(product: ProductRecord): ProductRecord {
  return {
    ...product,
    description: product.description ?? '',
    original_price: product.original_price ?? null,
    category: product.category ?? null,
    badge: product.badge ?? null,
    emoji: product.emoji ?? '📦',
    image_url: product.image_url ?? null,
    is_active: product.is_active ?? true,
    in_stock: product.in_stock ?? true,
    is_digital: product.is_digital ?? false,
    digital_url: product.digital_url ?? null,
    sort_order: product.sort_order ?? 0,
    rating: product.rating ?? 0,
    review_count: product.review_count ?? 0
  };
}

export function normalizeReview(review: ReviewRecord): ReviewRecord {
  return {
    ...review,
    booking_id: review.booking_id ?? null,
    customer_email: review.customer_email ?? null,
    text: review.text ?? '',
    is_verified: review.is_verified ?? false,
    is_published: review.is_published ?? true,
    created_at: review.created_at ?? new Date().toISOString()
  };
}

export function normalizeCredential(record: CredentialRecord): CredentialRecord {
  return { ...record, sort_order: record.sort_order ?? 0 };
}

export function normalizeSpecialism(record: SpecialismRecord): SpecialismRecord {
  return { ...record, sort_order: record.sort_order ?? 0 };
}

function normalizeCustomer(customer: CustomerRecord): CustomerRecord {
  return {
    ...customer,
    phone: customer.phone ?? null,
    total_bookings: customer.total_bookings ?? 0,
    total_orders: customer.total_orders ?? 0,
    total_spent: customer.total_spent ?? 0,
    last_booking_at: customer.last_booking_at ?? null,
    first_booking_at: customer.first_booking_at ?? null,
    last_activity_at: customer.last_activity_at ?? null,
    first_activity_at: customer.first_activity_at ?? null,
    notes: customer.notes ?? null
  };
}

function normalizeAvailability(record: AvailabilityRecord): AvailabilityRecord {
  return { ...record, is_active: record.is_active ?? true };
}

function normalizeBlockedTime(record: BlockedTimeRecord): BlockedTimeRecord {
  return { ...record, reason: record.reason ?? null };
}

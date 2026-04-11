import { calculateHealthScore } from './healthScore';
import {
  getBookingsInRange,
  getBusinessWithOwner,
  getCustomersForBusiness,
  getLinkVisitCount,
  getServicesForBusiness,
  supabaseAdmin
} from './supabase';
import type {
  AdvisorContext,
  Booking,
  BookingChatContext,
  Business,
  BusinessHealthScore,
  ChurnContext,
  OnboardingContext,
  OnboardingTrigger,
  SupportContext,
  SupportMessage
} from '../types';

export async function buildOnboardingContext(businessId: string, trigger: OnboardingTrigger): Promise<OnboardingContext> {
  const businessWithOwner = await getBusinessWithOwner(businessId);
  if (!businessWithOwner) {
    return {
      trigger,
      ownerFirstName: 'there',
      businessName: 'Your business',
      businessCategory: 'Service Business',
      businessLink: `${process.env.APP_URL ?? 'https://yourbusinessinalink.com'}/`,
      setupComplete: { businessInfo: false, servicesAdded: false, availabilitySet: false, stripeConnected: false },
      daysSinceSignup: 0,
      totalBookings: 0
    };
  }

  const { business, ownerFirstName } = businessWithOwner;
  const [services, bookings, availabilityCount] = await Promise.all([
    getServicesForBusiness(business.id),
    getBookingsInRange(business.id, new Date('2000-01-01'), new Date('2100-01-01')),
    countRows('availability', business.id)
  ]);
  const firstBooking = bookings[0];

  return {
    trigger,
    ownerFirstName,
    businessName: business.name,
    businessCategory: business.category,
    businessLink: businessLink(business.slug),
    setupComplete: {
      businessInfo: Boolean(business.name && business.category),
      servicesAdded: services.length > 0,
      availabilitySet: availabilityCount > 0,
      stripeConnected: business.stripe_onboarded
    },
    daysSinceSignup: daysAgo(business.created_at),
    totalBookings: bookings.length,
    firstBooking: firstBooking
      ? {
          customerName: firstBooking.customer_name,
          serviceName: (await getServiceName(business.id, firstBooking.service_id)) ?? 'Booked service',
          amount: firstBooking.amount_paid ?? 0,
          startTime: firstBooking.start_time
        }
      : undefined
  };
}

export async function buildSupportContext(
  businessId: string,
  conversationHistory: SupportMessage[],
  currentMessage: string
): Promise<SupportContext> {
  const businessWithOwner = await getBusinessWithOwner(businessId);
  if (!businessWithOwner) {
    return {
      businessId,
      ownerFirstName: 'there',
      businessName: 'Unknown business',
      businessSlug: '',
      businessLink: process.env.APP_URL ?? 'https://yourbusinessinalink.com',
      stripeOnboarded: false,
      calendarConnected: 'none',
      servicesCount: 0,
      serviceNames: [],
      upcomingBookings: [],
      recentSupportHistory: [],
      conversationHistory,
      currentMessage
    };
  }

  const { business, ownerFirstName } = businessWithOwner;
  const [services, upcomingBookings] = await Promise.all([
    getServicesForBusiness(business.id),
    getBookingsInRange(business.id, new Date(), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  ]);

  return {
    businessId: business.id,
    ownerFirstName,
    businessName: business.name,
    businessSlug: business.slug,
    businessLink: businessLink(business.slug),
    stripeOnboarded: business.stripe_onboarded,
    calendarConnected: business.google_cal_token ? 'google' : business.microsoft_cal_token ? 'microsoft' : 'none',
    servicesCount: services.length,
    serviceNames: services.map((service) => service.name),
    upcomingBookings: await Promise.all(
      upcomingBookings.slice(0, 10).map(async (booking) => ({
        customerName: booking.customer_name,
        serviceName: (await getServiceName(business.id, booking.service_id)) ?? 'Service',
        startTime: booking.start_time,
        status: booking.status
      }))
    ),
    recentSupportHistory: [],
    conversationHistory,
    currentMessage
  };
}

export async function buildChurnContext(business: Business, lastLoginAt: string | null): Promise<ChurnContext> {
  const now = new Date();
  const [bookingsLast7, bookingsLast14, allBookings, servicesCount, visitsLast7, businessWithOwner] = await Promise.all([
    getBookingsInRange(business.id, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now),
    getBookingsInRange(business.id, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), now),
    getBookingsInRange(business.id, new Date('2000-01-01'), now),
    getServicesForBusiness(business.id).then((services) => services.length),
    getLinkVisitCount(business.id, 7),
    getBusinessWithOwner(business.id)
  ]);

  const lastBooking = [...allBookings].sort((a, b) => b.start_time.localeCompare(a.start_time))[0];
  const conversionRate = visitsLast7 > 0 ? bookingsLast7.length / visitsLast7 : 0;
  const healthBase = calculateHealthScore({
    daysSinceLastLogin: lastLoginAt ? daysAgo(lastLoginAt) : 999,
    daysSinceLastBooking: lastBooking ? daysAgo(lastBooking.start_time) : null,
    bookingsLast7Days: bookingsLast7.length,
    bookingsLast14Days: bookingsLast14.length,
    stripeConnected: business.stripe_onboarded,
    calendarConnected: Boolean(business.google_cal_token || business.microsoft_cal_token),
    servicesCount,
    linkVisitsLast7Days: visitsLast7,
    linkVisitToBookingConversionRate: conversionRate,
    createdDaysAgo: daysAgo(business.created_at)
  });

  const health: BusinessHealthScore = { ...healthBase, businessId: business.id };

  return {
    business,
    health,
    ownerFirstName: businessWithOwner?.ownerFirstName ?? 'there',
    daysSinceLastLogin: lastLoginAt ? daysAgo(lastLoginAt) : 999,
    daysSinceLastBooking: lastBooking ? daysAgo(lastBooking.start_time) : null,
    totalBookingsAllTime: allBookings.length,
    bookingsLast7Days: bookingsLast7.length,
    bookingsLast14Days: bookingsLast14.length,
    linkVisitsLast7Days: visitsLast7,
    linkVisitsToBookingConversionRate: conversionRate,
    servicesCount,
    stripeConnected: business.stripe_onboarded,
    businessLink: businessLink(business.slug)
  };
}

export async function buildAdvisorContext(business: Business): Promise<AdvisorContext> {
  const now = new Date();
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [thisWeek, lastWeek, allBookings, services, customers, visitsLast7, businessWithOwner] = await Promise.all([
    getBookingsInRange(business.id, thisWeekStart, now),
    getBookingsInRange(business.id, lastWeekStart, thisWeekStart),
    getBookingsInRange(business.id, new Date('2000-01-01'), now),
    getServicesForBusiness(business.id),
    getCustomersForBusiness(business.id),
    getLinkVisitCount(business.id, 7),
    getBusinessWithOwner(business.id)
  ]);

  const bookedServiceNames = await getServiceNameMap(business.id);
  const bookedIn30Days = new Set(
    allBookings.filter((booking) => new Date(booking.start_time) >= thirtyDaysAgo).map((booking) => booking.service_id)
  );
  const returnRate = customers.length > 0 ? customers.filter((customer) => customer.total_bookings > 1).length / customers.length : 0;
  const conversionRate = visitsLast7 > 0 ? thisWeek.length / visitsLast7 : 0;

  return {
    business,
    ownerFirstName: businessWithOwner?.ownerFirstName ?? 'there',
    thisWeekBookings: thisWeek.length,
    thisWeekRevenue: sumRevenue(thisWeek),
    lastWeekBookings: lastWeek.length,
    lastWeekRevenue: sumRevenue(lastWeek),
    allTimeBookings: allBookings.length,
    allTimeRevenue: sumRevenue(allBookings),
    allTimeUniqueCustomers: new Set(allBookings.map((booking) => booking.customer_email)).size,
    mostBookedServiceThisWeek: topServiceName(thisWeek, bookedServiceNames),
    mostBookedServiceAllTime: topServiceName(allBookings, bookedServiceNames),
    emptySlotsPattern: inferEmptySlotsPattern(thisWeek),
    customerReturnRate: returnRate,
    servicesNotBookedIn30Days: services.filter((service) => !bookedIn30Days.has(service.id)).map((service) => service.name),
    linkVisitToBookingConversionRate: conversionRate,
    cancellationsThisWeek: thisWeek.filter((booking) => booking.status === 'cancelled').length,
    businessLink: businessLink(business.slug),
    topCustomers: customers
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5)
      .map((customer) => ({
        name: customer.name,
        totalBookings: customer.total_bookings,
        totalSpent: customer.total_spent,
        lastBookingDaysAgo: customer.last_booking_at ? daysAgo(customer.last_booking_at) : 999
      }))
  };
}

export async function buildBookingChatContext(
  slug: string,
  conversationHistory: Array<{ role: string; content: string }>,
  currentMessage: string
): Promise<BookingChatContext> {
  const { data: business } = await supabaseAdmin.from('businesses').select('*').eq('slug', slug).eq('is_active', true).maybeSingle<Business>();
  if (!business) {
    throw new Error('Business not found');
  }

  const [services, availability] = await Promise.all([
    getServicesForBusiness(business.id),
    supabaseAdmin.from('availability').select('day_of_week,start_time,end_time,is_active').eq('business_id', business.id).eq('is_active', true)
  ]);

  return {
    businessName: business.name,
    businessCategory: business.category,
    businessLocation: business.location,
    businessBio: business.bio,
    instagramHandle: business.instagram_handle,
    services: services.map((service) => ({
      name: service.name,
      duration: service.duration_minutes,
      price: service.price,
      description: service.description
    })),
    availabilitySummary: formatAvailabilitySummary((availability.data as Array<{ day_of_week: number; start_time: string; end_time: string }> | null) ?? []),
    conversationHistory: conversationHistory
      .filter((item): item is { role: 'user' | 'assistant'; content: string } => item.role === 'user' || item.role === 'assistant')
      .map((item) => ({ role: item.role, content: item.content })),
    currentMessage
  };
}

export async function getAllActiveBusinesses(): Promise<Business[]> {
  const { data } = await supabaseAdmin.from('businesses').select('*').eq('is_active', true);
  return (data as Business[] | null) ?? [];
}

export async function getAllActiveBusinessesWithBookings(): Promise<Business[]> {
  const businesses = await getAllActiveBusinesses();
  const result: Business[] = [];
  for (const business of businesses) {
    const bookings = await getBookingsInRange(business.id, new Date('2000-01-01'), new Date());
    if (bookings.length > 0) result.push(business);
  }
  return result;
}

async function countRows(table: string, businessId: string): Promise<number> {
  const { count } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true }).eq('business_id', businessId);
  return count ?? 0;
}

async function getServiceName(businessId: string, serviceId: string): Promise<string | null> {
  const { data } = await supabaseAdmin.from('services').select('name').eq('business_id', businessId).eq('id', serviceId).maybeSingle<{ name: string }>();
  return data?.name ?? null;
}

async function getServiceNameMap(businessId: string): Promise<Record<string, string>> {
  const services = await getServicesForBusiness(businessId);
  return Object.fromEntries(services.map((service) => [service.id, service.name]));
}

function topServiceName(bookings: Booking[], names: Record<string, string>): string | null {
  if (bookings.length === 0) return null;
  const counts = new Map<string, number>();
  for (const booking of bookings) {
    counts.set(booking.service_id, (counts.get(booking.service_id) ?? 0) + 1);
  }
  const [serviceId] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return names[serviceId] ?? null;
}

function inferEmptySlotsPattern(bookings: Booking[]): string {
  if (bookings.length === 0) return 'No bookings this week yet';
  const morningCount = bookings.filter((booking) => new Date(booking.start_time).getHours() < 12).length;
  const afternoonCount = bookings.filter((booking) => new Date(booking.start_time).getHours() >= 12).length;
  return morningCount < afternoonCount ? 'Mornings are quieter than afternoons this week' : 'Afternoons are quieter than mornings this week';
}

function sumRevenue(bookings: Booking[]): number {
  return bookings.reduce((total, booking) => total + (booking.amount_paid ?? 0), 0);
}

function businessLink(slug: string) {
  return `${process.env.APP_URL ?? 'https://yourbusinessinalink.com'}/${slug}`;
}

function daysAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)));
}

function formatAvailabilitySummary(rows: Array<{ day_of_week: number; start_time: string; end_time: string }>) {
  if (rows.length === 0) return 'Availability varies. Tap a service to check live times.';
  const byDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return rows
    .sort((a, b) => a.day_of_week - b.day_of_week)
    .map((row) => `${byDay[row.day_of_week]} ${row.start_time.slice(0, 5)}-${row.end_time.slice(0, 5)}`)
    .join(', ');
}

export async function buildChurnContextsForAllActiveBusinesses(): Promise<ChurnContext[]> {
  const businesses = await getAllActiveBusinesses();
  const contexts: ChurnContext[] = [];
  for (const business of businesses) {
    const userResult = await supabaseAdmin.auth.admin.getUserById(business.owner_id);
    const lastLoginAt = userResult.data.user?.last_sign_in_at ?? null;
    contexts.push(await buildChurnContext(business, lastLoginAt));
  }
  return contexts;
}

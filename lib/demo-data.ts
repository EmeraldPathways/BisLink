import { addDays, formatISO, set } from 'date-fns';
import type {
  AvailabilityRecord,
  BlockedTimeRecord,
  BookingRecord,
  BusinessProfile,
  CustomerRecord,
  DashboardStats,
  PayoutRecord,
  RevenuePoint,
  ServiceRecord
} from '@/types';

const businessId = '11111111-1111-1111-1111-111111111111';
const ownerId = '22222222-2222-2222-2222-222222222222';
const today = new Date();

const atTime = (base: Date, hours: number, minutes = 0) =>
  set(base, { hours, minutes, seconds: 0, milliseconds: 0 });

export const demoBusiness: BusinessProfile = {
  id: businessId,
  owner_id: ownerId,
  slug: 'studio-eleven',
  name: 'Studio Eleven',
  category: 'Personal Training',
  bio: 'Movement coaching for real people. No fluff, no fads, just honest training that gets results.',
  location: 'Brooklyn, NY',
  timezone: 'America/New_York',
  currency: 'usd',
  stripe_account_id: 'acct_demo',
  stripe_onboarded: true,
  is_active: true,
  instagram_handle: '@studioeleven',
  tiktok_handle: '@studioelevenmoves'
};

export const demoServices: ServiceRecord[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    business_id: businessId,
    name: '1-on-1 Training Session',
    description: 'Full hour tailored entirely to your goals and current fitness level.',
    duration_minutes: 60,
    price: 12000,
    currency: 'usd',
    max_concurrent: 1,
    buffer_after: 0,
    is_active: true,
    sort_order: 1,
    tag: 'Most Booked',
    emoji: '💪'
  },
  {
    id: '33333333-3333-3333-3333-333333333332',
    business_id: businessId,
    name: 'Power Half Hour',
    description: 'High-intensity focused work. 30 minutes, real results.',
    duration_minutes: 30,
    price: 6500,
    currency: 'usd',
    max_concurrent: 1,
    buffer_after: 0,
    is_active: true,
    sort_order: 2,
    tag: null,
    emoji: '⚡'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    business_id: businessId,
    name: 'Movement Assessment',
    description: 'First session? Full-body screen and a personalized plan built for you.',
    duration_minutes: 45,
    price: 8000,
    currency: 'usd',
    max_concurrent: 1,
    buffer_after: 15,
    is_active: true,
    sort_order: 3,
    tag: 'Start Here',
    emoji: '📋'
  },
  {
    id: '33333333-3333-3333-3333-333333333334',
    business_id: businessId,
    name: 'Recovery & Mobility',
    description: 'Guided stretch and reset. Perfect after a heavy week.',
    duration_minutes: 60,
    price: 8500,
    currency: 'usd',
    max_concurrent: 1,
    buffer_after: 0,
    is_active: true,
    sort_order: 4,
    tag: 'Popular',
    emoji: '🧘'
  }
];

export const demoAvailability: AvailabilityRecord[] = [1, 2, 3, 4, 5].map((day) => ({
  id: `44444444-4444-4444-4444-44444444444${day}`,
  business_id: businessId,
  day_of_week: day,
  start_time: '07:00:00',
  end_time: '18:00:00',
  is_active: true
}));

export const demoBlockedTimes: BlockedTimeRecord[] = [
  {
    id: '55555555-5555-5555-5555-555555555551',
    business_id: businessId,
    start_time: formatISO(atTime(addDays(today, 2), 12)),
    end_time: formatISO(atTime(addDays(today, 2), 13)),
    reason: 'Personal'
  }
];

export const demoBookings: BookingRecord[] = [
  {
    id: '66666666-6666-6666-6666-666666666661',
    business_id: businessId,
    service_id: demoServices[0].id,
    customer_name: 'Avery Stone',
    customer_email: 'avery@example.com',
    customer_phone: '+1 555 120 4401',
    start_time: formatISO(atTime(today, 9)),
    end_time: formatISO(atTime(today, 10)),
    status: 'confirmed',
    payment_status: 'paid',
    amount_paid: 12000,
    currency: 'usd'
  },
  {
    id: '66666666-6666-6666-6666-666666666662',
    business_id: businessId,
    service_id: demoServices[2].id,
    customer_name: 'Maya Lewis',
    customer_email: 'maya@example.com',
    customer_phone: '+1 555 302 9987',
    start_time: formatISO(atTime(today, 11)),
    end_time: formatISO(atTime(today, 11, 45)),
    status: 'confirmed',
    payment_status: 'paid',
    amount_paid: 8000,
    currency: 'usd'
  },
  {
    id: '66666666-6666-6666-6666-666666666663',
    business_id: businessId,
    service_id: demoServices[1].id,
    customer_name: 'Jordan Kim',
    customer_email: 'jordan@example.com',
    start_time: formatISO(atTime(addDays(today, 1), 8)),
    end_time: formatISO(atTime(addDays(today, 1), 8, 30)),
    status: 'completed',
    payment_status: 'paid',
    amount_paid: 6500,
    currency: 'usd'
  },
  {
    id: '66666666-6666-6666-6666-666666666664',
    business_id: businessId,
    service_id: demoServices[3].id,
    customer_name: 'Noah Patel',
    customer_email: 'noah@example.com',
    start_time: formatISO(atTime(addDays(today, 3), 15)),
    end_time: formatISO(atTime(addDays(today, 3), 16)),
    status: 'cancelled',
    payment_status: 'refunded',
    amount_paid: 8500,
    currency: 'usd'
  }
];

export const demoCustomers: CustomerRecord[] = [
  {
    id: '77777777-7777-7777-7777-777777777771',
    business_id: businessId,
    name: 'Avery Stone',
    email: 'avery@example.com',
    phone: '+1 555 120 4401',
    total_bookings: 6,
    total_spent: 72000,
    last_booking_at: demoBookings[0].start_time,
    first_booking_at: formatISO(addDays(today, -60)),
    notes: 'Prefers morning sessions.'
  },
  {
    id: '77777777-7777-7777-7777-777777777772',
    business_id: businessId,
    name: 'Maya Lewis',
    email: 'maya@example.com',
    phone: '+1 555 302 9987',
    total_bookings: 2,
    total_spent: 16000,
    last_booking_at: demoBookings[1].start_time,
    first_booking_at: formatISO(addDays(today, -12)),
    notes: 'Recovering from ankle strain.'
  },
  {
    id: '77777777-7777-7777-7777-777777777773',
    business_id: businessId,
    name: 'Jordan Kim',
    email: 'jordan@example.com',
    total_bookings: 4,
    total_spent: 26000,
    last_booking_at: demoBookings[2].start_time,
    first_booking_at: formatISO(addDays(today, -45))
  }
];

export const demoStats: DashboardStats = {
  todayBookings: 2,
  todayRevenue: 20000,
  weekBookings: 9,
  weekRevenue: 76500,
  monthRevenue: 214000,
  customers: demoCustomers.length
};

export const demoRevenue: RevenuePoint[] = [
  { label: 'Mon', amount: 12000 },
  { label: 'Tue', amount: 18500 },
  { label: 'Wed', amount: 24000 },
  { label: 'Thu', amount: 14000 },
  { label: 'Fri', amount: 8000 },
  { label: 'Sat', amount: 0 },
  { label: 'Sun', amount: 0 }
];

export const demoPayouts: PayoutRecord[] = [
  { id: 'po_1', amount: 82400, date: formatISO(addDays(today, -2)), status: 'paid' },
  { id: 'po_2', amount: 75600, date: formatISO(addDays(today, -9)), status: 'paid' },
  { id: 'po_3', amount: 91200, date: formatISO(addDays(today, 5)), status: 'in_transit' }
];

export const businessCategories = [
  'Hair & Beauty',
  'Personal Training',
  'Wellness & Massage',
  'Yoga & Pilates',
  'Nutrition & Coaching',
  'Photography',
  'Tours & Activities',
  'Consulting',
  'Legal',
  'Medical',
  'Pet Services',
  'Home Services',
  'Education',
  'Other'
];

export function getDemoBusinessBySlug(slug: string) {
  return slug === demoBusiness.slug ? demoBusiness : null;
}

export function getDemoService(serviceId: string) {
  return demoServices.find((service) => service.id === serviceId) ?? null;
}

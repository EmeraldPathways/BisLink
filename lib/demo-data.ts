import { addDays, formatISO, set, subDays } from 'date-fns';
import type {
  AvailabilityRecord,
  BlockedTimeRecord,
  BookingRecord,
  BusinessProfile,
  CredentialRecord,
  CustomerRecord,
  DashboardStats,
  OrderRecord,
  PayoutRecord,
  ProductRecord,
  RevenuePoint,
  ReviewRecord,
  ServiceRecord,
  SpecialismRecord
} from '@/types';
import { getReviewSummaryFromReviews } from '@/lib/reviews';

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
  tagline: 'Strong bodies. Clear heads. Honest coaching.',
  full_bio:
    'Studio Eleven was built for people who want training that fits real life. We coach strength, conditioning, mobility, and long-term consistency without turning fitness into a performance.\n\nEvery session is tailored to where you are right now, whether you are getting back into movement, rebuilding after injury, or pushing toward a new level.',
  location: 'Brooklyn, NY',
  address: '218 Atlantic Avenue, Brooklyn, NY 11201',
  parking_notes: 'Street parking after 6pm is usually easiest. Enter through the side gate.',
  timezone: 'America/New_York',
  currency: 'usd',
  stripe_account_id: 'acct_demo',
  stripe_onboarded: true,
  is_active: true,
  instagram_handle: '@studioeleven',
  tiktok_handle: '@studioelevenmoves',
  whatsapp_number: '+1 555 300 4400',
  email: 'hello@studioeleven.com',
  phone: '+1 555 300 4400',
  years_experience: 9,
  google_review_url: 'https://google.com/maps/reviews/demo',
  google_maps_url: 'https://www.google.com/maps/search/?api=1&query=218%20Atlantic%20Avenue%2C%20Brooklyn%2C%20NY%2011201'
};

export const demoCredentials: CredentialRecord[] = [
  { id: 'cred_1', business_id: businessId, label: 'NASM Certified', sort_order: 1 },
  { id: 'cred_2', business_id: businessId, label: 'Precision Nutrition L1', sort_order: 2 },
  { id: 'cred_3', business_id: businessId, label: 'CPR / AED', sort_order: 3 }
];

export const demoSpecialisms: SpecialismRecord[] = [
  { id: 'spec_1', business_id: businessId, label: 'Strength & Conditioning', sort_order: 1 },
  { id: 'spec_2', business_id: businessId, label: 'Beginner Friendly', sort_order: 2 },
  { id: 'spec_3', business_id: businessId, label: 'Injury Rehab', sort_order: 3 },
  { id: 'spec_4', business_id: businessId, label: 'Mobility & Recovery', sort_order: 4 }
];

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

export const demoProducts: ProductRecord[] = [
  {
    id: 'prod_1',
    business_id: businessId,
    name: 'Studio Eleven Bands',
    description: 'Heavy and medium resistance bands for warmups, mobility, and home sessions.',
    price: 3400,
    original_price: 4200,
    category: 'Equipment',
    badge: 'Best Seller',
    emoji: '🏋️',
    is_active: true,
    in_stock: true,
    is_digital: false,
    sort_order: 1,
    rating: 4.8,
    review_count: 61
  },
  {
    id: 'prod_2',
    business_id: businessId,
    name: '4-Week Reset Plan',
    description: 'Digital training plan with 4 weeks of workouts, mobility, and habit tracking.',
    price: 2900,
    category: 'Programs',
    badge: 'New',
    emoji: '📲',
    is_active: true,
    in_stock: true,
    is_digital: true,
    digital_url: 'https://example.com/download/reset-plan',
    sort_order: 2,
    rating: 4.9,
    review_count: 24
  },
  {
    id: 'prod_3',
    business_id: businessId,
    name: 'Mobility Ball Set',
    description: 'Pair of release balls for hips, feet, shoulders, and post-session recovery.',
    price: 2200,
    category: 'Recovery',
    badge: 'Limited',
    emoji: '🟠',
    is_active: true,
    in_stock: false,
    is_digital: false,
    sort_order: 3,
    rating: 4.7,
    review_count: 18
  },
  {
    id: 'prod_4',
    business_id: businessId,
    name: 'Beginner Strength Guide',
    description: 'Simple digital guide for people starting strength training from scratch.',
    price: 1900,
    category: 'Programs',
    badge: null,
    emoji: '📘',
    is_active: true,
    in_stock: true,
    is_digital: true,
    digital_url: 'https://example.com/download/strength-guide',
    sort_order: 4,
    rating: 4.6,
    review_count: 12
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
    currency: 'usd',
    review_token: 'demo-review-token'
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
    currency: 'usd',
    review_token: 'demo-review-token'
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
    currency: 'usd',
    review_token: 'demo-review-token'
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
    currency: 'usd',
    review_token: 'demo-review-token'
  }
];

export const demoOrders: OrderRecord[] = [
  {
    id: 'order_1',
    business_id: businessId,
    customer_name: 'Leah Murphy',
    customer_email: 'leah@example.com',
    items: [
      { productId: 'prod_1', qty: 1, name: 'Studio Eleven Bands', price: 3400 },
      { productId: 'prod_2', qty: 1, name: '4-Week Reset Plan', price: 2900 }
    ],
    total_amount: 6300,
    currency: 'usd',
    status: 'paid',
    payment_intent_id: 'pi_order_demo',
    created_at: formatISO(subDays(today, 2))
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
    total_orders: 1,
    total_spent: 72000,
    last_booking_at: demoBookings[0].start_time,
    first_booking_at: formatISO(addDays(today, -60)),
    last_activity_at: demoBookings[0].start_time,
    first_activity_at: formatISO(addDays(today, -60)),
    notes: 'Prefers morning sessions.'
  },
  {
    id: '77777777-7777-7777-7777-777777777772',
    business_id: businessId,
    name: 'Maya Lewis',
    email: 'maya@example.com',
    phone: '+1 555 302 9987',
    total_bookings: 2,
    total_orders: 0,
    total_spent: 16000,
    last_booking_at: demoBookings[1].start_time,
    first_booking_at: formatISO(addDays(today, -12)),
    last_activity_at: demoBookings[1].start_time,
    first_activity_at: formatISO(addDays(today, -12)),
    notes: 'Recovering from ankle strain.'
  },
  {
    id: '77777777-7777-7777-7777-777777777773',
    business_id: businessId,
    name: 'Jordan Kim',
    email: 'jordan@example.com',
    total_bookings: 4,
    total_orders: 2,
    total_spent: 32300,
    last_booking_at: demoBookings[2].start_time,
    first_booking_at: formatISO(addDays(today, -45)),
    last_activity_at: demoOrders[0].created_at,
    first_activity_at: formatISO(addDays(today, -45))
  }
];

export const demoReviews: ReviewRecord[] = [
  {
    id: 'review_1',
    business_id: businessId,
    booking_id: demoBookings[0].id,
    customer_name: 'Avery S.',
    customer_email: 'avery@example.com',
    rating: 5,
    text: 'The best coaching I have had in years. Clear programming, honest feedback, and real progress.',
    is_verified: true,
    is_published: true,
    created_at: formatISO(subDays(today, 8))
  },
  {
    id: 'review_2',
    business_id: businessId,
    booking_id: demoBookings[1].id,
    customer_name: 'Maya L.',
    customer_email: 'maya@example.com',
    rating: 5,
    text: 'Studio Eleven made training feel approachable again. Great energy and thoughtful attention to detail.',
    is_verified: true,
    is_published: true,
    created_at: formatISO(subDays(today, 13))
  },
  {
    id: 'review_3',
    business_id: businessId,
    booking_id: null,
    customer_name: 'Chris D.',
    customer_email: 'chris@example.com',
    rating: 4,
    text: 'Really good session structure and a strong recovery focus.',
    is_verified: true,
    is_published: true,
    created_at: formatISO(subDays(today, 21))
  },
  {
    id: 'review_4',
    business_id: businessId,
    booking_id: null,
    customer_name: 'Robin K.',
    customer_email: 'robin@example.com',
    rating: 5,
    text: 'I booked one session and came back the same week. Exactly the kind of coaching I wanted.',
    is_verified: true,
    is_published: true,
    created_at: formatISO(subDays(today, 32))
  }
];

export const demoReviewSummary = getReviewSummaryFromReviews(demoReviews);

export const demoStats: DashboardStats = {
  todayBookings: 2,
  todayRevenue: 20000,
  weekBookings: 9,
  weekRevenue: 76500,
  monthRevenue: 214000,
  customers: demoCustomers.length,
  products: demoProducts.length,
  reviews: demoReviews.filter((review) => review.is_published).length
};

export const demoRevenue: RevenuePoint[] = [
  { label: 'Mon', amount: 12000 },
  { label: 'Tue', amount: 18500 },
  { label: 'Wed', amount: 24000 },
  { label: 'Thu', amount: 14000 },
  { label: 'Fri', amount: 8000 },
  { label: 'Sat', amount: 6300 },
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

export const productEmojiChoices = ['📦', '🏋️', '📲', '🧃', '🧘', '📘', '🟠', '🎒', '🥤', '🧴'];

export function getDemoBusinessBySlug(slug: string) {
  return slug === demoBusiness.slug ? demoBusiness : null;
}

export function getDemoService(serviceId: string) {
  return demoServices.find((service) => service.id === serviceId) ?? null;
}

export function getDemoProduct(productId: string) {
  return demoProducts.find((product) => product.id === productId) ?? null;
}

export function getReviewBreakdown() {
  const published = demoReviews.filter((review) => review.is_published);
  const total = published.length || 1;
  return [5, 4, 3, 2, 1].map((rating) => {
    const count = published.filter((review) => review.rating === rating).length;
    return { rating, count, percent: count / total };
  });
}

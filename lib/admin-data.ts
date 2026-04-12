import {
  demoBookings,
  demoBusiness,
  demoCustomers,
  demoOrders,
  demoProducts,
  demoPayouts,
  demoReviews,
  demoServices
} from '@/lib/demo-data';

export const adminOverview = {
  appName: 'BisLink',
  environment: 'Production',
  primaryAdmin: 'info@bislink.app',
  businesses: 1,
  activeServices: demoServices.filter((item) => item.is_active).length,
  activeProducts: demoProducts.filter((item) => item.is_active).length,
  totalCustomers: demoCustomers.length,
  openReviews: demoReviews.filter((item) => !item.is_verified).length,
  monthlyRevenue: demoBookings.reduce((sum, item) => sum + item.amount_paid, 0) + demoOrders.reduce((sum, item) => sum + item.total_amount, 0),
  upcomingPayouts: demoPayouts.filter((item) => item.status === 'in_transit').length
};

export const adminHealth = [
  { label: 'Stripe', value: demoBusiness.stripe_onboarded ? 'Connected' : 'Needs attention', tone: demoBusiness.stripe_onboarded ? 'success' : 'warning' },
  { label: 'Google Calendar', value: demoBusiness.google_review_url ? 'Configured' : 'Not connected', tone: demoBusiness.google_review_url ? 'success' : 'warning' },
  { label: 'Cloud Functions', value: '3 live endpoints', tone: 'success' },
  { label: 'Scheduler', value: '15-minute reminder cron', tone: 'success' }
] as const;

export const agentAdminCards = [
  {
    id: 'booking-chat',
    name: 'Booking Chat',
    status: 'Live',
    owner: 'Customer journey',
    summary: 'Handles booking conversations and pre-qualification on public pages.',
    model: 'Anthropic',
    lastRun: 'Moments ago'
  },
  {
    id: 'advisor-weekly',
    name: 'Advisor Weekly',
    status: 'Scheduled',
    owner: 'Growth',
    summary: 'Compiles weekly business guidance and opportunity summaries.',
    model: 'Anthropic',
    lastRun: 'Today'
  },
  {
    id: 'manager-health',
    name: 'Manager Health',
    status: 'Monitoring',
    owner: 'Operations',
    summary: 'Tracks key performance signals and surfaces risk before churn or missed revenue.',
    model: 'Anthropic',
    lastRun: 'Today'
  },
  {
    id: 'support-chat',
    name: 'Support Chat',
    status: 'Ready',
    owner: 'Support',
    summary: 'Answers product questions, triages issues, and escalates where needed.',
    model: 'Anthropic',
    lastRun: 'Yesterday'
  }
];

export const adminSettingsGroups = [
  {
    title: 'Authentication',
    items: [
      { label: 'Admin sign-in', value: 'Email + password' },
      { label: 'Primary admin', value: 'info@bislink.app' },
      { label: 'Owner dashboard auth', value: 'Supabase session' }
    ]
  },
  {
    title: 'Operations',
    items: [
      { label: 'Reminder cadence', value: 'Every 15 minutes' },
      { label: 'Booking lifecycle', value: 'Google Cloud Function' },
      { label: 'Order lifecycle', value: 'Google Cloud Function' }
    ]
  },
  {
    title: 'Integrations',
    items: [
      { label: 'Supabase', value: 'Connected' },
      { label: 'Stripe', value: 'Connected' },
      { label: 'Resend', value: 'Connected' },
      { label: 'Google OAuth', value: 'Testing / verified branding' }
    ]
  }
];

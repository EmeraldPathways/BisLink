export interface Business {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  category: string;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  stripe_account_id: string | null;
  stripe_onboarded: boolean;
  google_cal_token: Record<string, unknown> | null;
  microsoft_cal_token: Record<string, unknown> | null;
  timezone: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  tag: string | null;
  emoji: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  amount_paid: number | null;
  currency: string;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string;
  total_bookings: number;
  total_spent: number;
  last_booking_at: string | null;
  first_booking_at: string | null;
}

export type OnboardingTrigger =
  | 'USER_SIGNED_UP'
  | 'NO_SERVICE_24H'
  | 'AVAILABILITY_SET'
  | 'NO_STRIPE_72H'
  | 'STRIPE_CONNECTED'
  | 'LINK_FIRST_VISITED'
  | 'FIRST_BOOKING_RECEIVED'
  | 'NO_LOGIN_48H';

export interface OnboardingContext {
  trigger: OnboardingTrigger;
  ownerFirstName: string;
  businessName: string;
  businessCategory: string;
  businessLink: string;
  setupComplete: {
    businessInfo: boolean;
    servicesAdded: boolean;
    availabilitySet: boolean;
    stripeConnected: boolean;
  };
  daysSinceSignup: number;
  totalBookings: number;
  firstBooking?: {
    customerName: string;
    serviceName: string;
    amount: number;
    startTime: string;
  };
}

export interface EmailOutput {
  subject: string;
  body: string;
  cta_text: string;
  cta_url: string;
}

export interface OnboardingAgentOutput {
  channel: 'email' | 'in_app';
  subject: string;
  body: string;
  cta_text: string;
  cta_url: string;
}

export interface SupportMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SupportContext {
  businessId: string;
  ownerFirstName: string;
  businessName: string;
  businessSlug: string;
  businessLink: string;
  stripeOnboarded: boolean;
  calendarConnected: 'google' | 'microsoft' | 'none';
  servicesCount: number;
  serviceNames: string[];
  upcomingBookings: Array<{
    customerName: string;
    serviceName: string;
    startTime: string;
    status: string;
  }>;
  recentSupportHistory: SupportMessage[];
  conversationHistory: SupportMessage[];
  currentMessage: string;
}

export interface SupportAgentOutput {
  reply: string;
  shouldEscalateToSonnet: boolean;
  shouldEscalateToHuman: boolean;
  escalationReason?: string;
  actionTaken?: string;
}

export interface BusinessHealthScore {
  businessId: string;
  score: number;
  status: 'healthy' | 'watch' | 'at_risk';
  signals: {
    positive: string[];
    negative: string[];
  };
}

export interface ChurnContext {
  business: Business;
  health: BusinessHealthScore;
  ownerFirstName: string;
  daysSinceLastLogin: number;
  daysSinceLastBooking: number | null;
  totalBookingsAllTime: number;
  bookingsLast7Days: number;
  bookingsLast14Days: number;
  linkVisitsLast7Days: number;
  linkVisitsToBookingConversionRate: number;
  servicesCount: number;
  stripeConnected: boolean;
  businessLink: string;
}

export interface ChurnAgentOutput {
  action: 'SEND_EMAIL' | 'NO_ACTION';
  reason: string;
  email: EmailOutput | null;
}

export interface AdvisorContext {
  business: Business;
  ownerFirstName: string;
  thisWeekBookings: number;
  thisWeekRevenue: number;
  lastWeekBookings: number;
  lastWeekRevenue: number;
  allTimeBookings: number;
  allTimeRevenue: number;
  allTimeUniqueCustomers: number;
  mostBookedServiceThisWeek: string | null;
  mostBookedServiceAllTime: string | null;
  emptySlotsPattern: string;
  customerReturnRate: number;
  servicesNotBookedIn30Days: string[];
  linkVisitToBookingConversionRate: number;
  cancellationsThisWeek: number;
  businessLink: string;
  topCustomers: Array<{
    name: string;
    totalBookings: number;
    totalSpent: number;
    lastBookingDaysAgo: number;
  }>;
}

export interface AdvisorAgentOutput {
  subject: string;
  body: string;
  cta_text: string;
  cta_url: string;
}

export interface BookingChatContext {
  businessName: string;
  businessCategory: string;
  businessLocation: string | null;
  businessBio: string | null;
  instagramHandle: string | null;
  services: Array<{
    name: string;
    duration: number;
    price: number;
    description: string | null;
  }>;
  availabilitySummary: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  currentMessage: string;
}

export interface BookingChatOutput {
  reply: string;
}

export type AgentHealthStatus = 'healthy' | 'degraded' | 'down';
export type AgentCheckLevel = 'ok' | 'warn' | 'fail';

export interface AgentHealthCheck {
  name: string;
  level: AgentCheckLevel;
  summary: string;
  details?: Record<string, unknown>;
}

export interface ManagerDiagnostics {
  timestamp: string;
  mode: 'quick' | 'full';
  checks: AgentHealthCheck[];
  summary: {
    ok: number;
    warn: number;
    fail: number;
  };
  overallStatus: AgentHealthStatus;
}

export interface ManagerAgentContext {
  diagnostics: ManagerDiagnostics;
}

export interface ManagerAgentOutput {
  overallStatus: AgentHealthStatus;
  summary: string;
  criticalIssues: string[];
  recommendations: string[];
}

export interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, unknown>;
  old_record: Record<string, unknown> | null;
}

export interface OnboardingWebhookPayload {
  trigger: OnboardingTrigger;
  businessId: string;
  userId: string;
}

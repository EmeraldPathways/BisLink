export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type DiagnosticLevel = 'ok' | 'warn' | 'fail';
export type DiagnosticState =
  | 'configured'
  | 'missing'
  | 'partial'
  | 'reconnect needed'
  | 'pending processing'
  | 'runtime incomplete';

export type DiagnosticCheck = {
  name: string;
  label: string;
  level: DiagnosticLevel;
  state: DiagnosticState;
  summary: string;
  details?: Record<string, boolean | string | number | null>;
};

export type AgentDiagnostics = {
  timestamp: string;
  mode: 'quick' | 'full';
  checks: DiagnosticCheck[];
  summary: {
    ok: number;
    warn: number;
    fail: number;
  };
  overallStatus: 'healthy' | 'degraded' | 'down';
};

export type BusinessProfile = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  category: string;
  bio: string;
  tagline?: string | null;
  full_bio?: string | null;
  photo_url?: string | null;
  location?: string | null;
  address?: string | null;
  parking_notes?: string | null;
  google_maps_url?: string | null;
  website_url?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  phone?: string | null;
  years_experience?: number | null;
  google_review_url?: string | null;
  contact_email?: string | null;
  timezone: string;
  currency: string;
  stripe_account_id?: string | null;
  stripe_onboarded?: boolean;
  is_active?: boolean;
  google_cal_token?: unknown;
  microsoft_cal_token?: unknown;
};

export type CredentialRecord = {
  id: string;
  business_id: string;
  label: string;
  sort_order: number;
};

export type SpecialismRecord = {
  id: string;
  business_id: string;
  label: string;
  sort_order: number;
};

export type ServiceRecord = {
  id: string;
  business_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  currency: string;
  max_concurrent: number;
  buffer_after: number;
  is_active: boolean;
  sort_order: number;
  tag: string | null;
  emoji: string;
};

export type ProductRecord = {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  category?: string | null;
  badge?: string | null;
  emoji: string;
  image_url?: string | null;
  is_active: boolean;
  in_stock: boolean;
  is_digital: boolean;
  digital_url?: string | null;
  sort_order: number;
  rating: number;
  review_count: number;
};

export type ReviewRecord = {
  id: string;
  business_id: string;
  booking_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  rating: number;
  text: string;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
};

export type OrderRecord = {
  id: string;
  business_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  items: Array<{ productId: string; qty: number; name: string; price: number }>;
  total_amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'refunded';
  confirmation_sent?: boolean;
  payment_intent_id?: string | null;
  shipping_address?: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  } | null;
  created_at: string;
};

export type PublicContactSubmission = {
  businessId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  honeypot?: string;
};

export type AvailabilityRecord = {
  id: string;
  business_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type BlockedTimeRecord = {
  id: string;
  business_id: string;
  start_time: string;
  end_time: string;
  reason?: string | null;
};

export type BookingRecord = {
  id: string;
  business_id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_intent_id?: string | null;
  amount_paid: number;
  currency: string;
  review_token?: string | null;
  review_token_expires_at?: string | null;
  notes?: string | null;
  confirmation_sent?: boolean | null;
  google_event_id?: string | null;
};

export type CustomerRecord = {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone?: string | null;
  total_bookings: number;
  total_orders?: number;
  total_spent: number;
  last_booking_at?: string | null;
  first_booking_at?: string | null;
  last_activity_at?: string | null;
  first_activity_at?: string | null;
  notes?: string | null;
};

export type PayoutRecord = {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'in_transit';
};

export type RevenuePoint = {
  label: string;
  amount: number;
};

export type DashboardStats = {
  todayBookings: number;
  todayRevenue: number;
  weekBookings: number;
  weekRevenue: number;
  monthRevenue: number;
  customers: number;
  products: number;
  reviews: number;
};

export type DashboardBookingRecord = BookingRecord & {
  service: ServiceRecord | null;
};

export type ReviewBreakdownPoint = {
  rating: number;
  count: number;
  percent: number;
};

export type PublicPageData = {
  business: BusinessProfile;
  services: ServiceRecord[];
  products: ProductRecord[];
  reviews: ReviewRecord[];
  credentials: CredentialRecord[];
  specialisms: SpecialismRecord[];
};

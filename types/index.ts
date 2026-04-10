export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export type BusinessProfile = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  category: string;
  bio: string;
  photo_url?: string | null;
  location?: string | null;
  website_url?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  timezone: string;
  currency: string;
  stripe_account_id?: string | null;
  stripe_onboarded?: boolean;
  is_active?: boolean;
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
  notes?: string | null;
};

export type CustomerRecord = {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone?: string | null;
  total_bookings: number;
  total_spent: number;
  last_booking_at?: string | null;
  first_booking_at?: string | null;
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
};

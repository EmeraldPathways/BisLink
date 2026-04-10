import type { BusinessHealthScore } from '../types';

const SIGNALS = {
  had_booking_last_7_days: 20,
  had_booking_last_14_days: 12,
  stripe_connected: 10,
  calendar_connected: 5,
  logged_in_last_3_days: 10,
  high_conversion_rate: 10,
  multiple_services: 5,
  no_booking_8_to_14_days: -15,
  no_booking_over_14_days: -25,
  no_booking_ever: -30,
  no_login_7_days: -10,
  no_login_14_days: -20,
  stripe_not_connected: -20,
  low_conversion_rate: -10,
  only_one_service: -5,
  new_account_no_booking: -15
} as const;

export function calculateHealthScore(data: {
  daysSinceLastLogin: number;
  daysSinceLastBooking: number | null;
  bookingsLast7Days: number;
  bookingsLast14Days: number;
  stripeConnected: boolean;
  calendarConnected: boolean;
  servicesCount: number;
  linkVisitsLast7Days: number;
  linkVisitToBookingConversionRate: number;
  createdDaysAgo: number;
}): BusinessHealthScore {
  let score = 0;
  const positive: string[] = [];
  const negative: string[] = [];

  if (data.bookingsLast7Days > 0) {
    score += SIGNALS.had_booking_last_7_days;
    positive.push('Recent booking activity in the last 7 days');
  } else if (data.bookingsLast14Days > 0) {
    score += SIGNALS.had_booking_last_14_days;
    positive.push('Booking activity in the last 14 days');
  }

  if (data.stripeConnected) {
    score += SIGNALS.stripe_connected;
    positive.push('Stripe is connected');
  } else {
    score += SIGNALS.stripe_not_connected;
    negative.push('Stripe is not connected');
  }

  if (data.calendarConnected) {
    score += SIGNALS.calendar_connected;
    positive.push('Calendar is connected');
  }

  if (data.daysSinceLastLogin <= 3) {
    score += SIGNALS.logged_in_last_3_days;
    positive.push('Owner logged in recently');
  } else if (data.daysSinceLastLogin >= 14) {
    score += SIGNALS.no_login_14_days;
    negative.push('No login in 14+ days');
  } else if (data.daysSinceLastLogin >= 7) {
    score += SIGNALS.no_login_7_days;
    negative.push('No login in 7+ days');
  }

  if (data.linkVisitToBookingConversionRate > 0.1) {
    score += SIGNALS.high_conversion_rate;
    positive.push('High link conversion rate');
  } else if (data.linkVisitsLast7Days > 10 && data.linkVisitToBookingConversionRate < 0.03) {
    score += SIGNALS.low_conversion_rate;
    negative.push('Low conversion despite link visits');
  }

  if (data.servicesCount >= 3) {
    score += SIGNALS.multiple_services;
    positive.push('Multiple active services');
  } else if (data.servicesCount === 1) {
    score += SIGNALS.only_one_service;
    negative.push('Only one active service');
  }

  if (data.daysSinceLastBooking === null) {
    score += SIGNALS.no_booking_ever;
    negative.push('No bookings yet');
    if (data.createdDaysAgo > 7) {
      score += SIGNALS.new_account_no_booking;
      negative.push('New account older than 7 days with no bookings');
    }
  } else if (data.daysSinceLastBooking > 14) {
    score += SIGNALS.no_booking_over_14_days;
    negative.push('No booking for more than 14 days');
  } else if (data.daysSinceLastBooking >= 8) {
    score += SIGNALS.no_booking_8_to_14_days;
    negative.push('No booking in the last 8 to 14 days');
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= 50 ? 'healthy' : score >= 20 ? 'watch' : 'at_risk';

  return {
    businessId: '',
    score,
    status,
    signals: { positive, negative }
  };
}

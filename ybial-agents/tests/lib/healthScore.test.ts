import { calculateHealthScore } from '../../src/lib/healthScore';

describe('calculateHealthScore', () => {
  it('adds positive signals correctly', () => {
    const score = calculateHealthScore({
      daysSinceLastLogin: 1,
      daysSinceLastBooking: 1,
      bookingsLast7Days: 2,
      bookingsLast14Days: 2,
      stripeConnected: true,
      calendarConnected: true,
      servicesCount: 3,
      linkVisitsLast7Days: 20,
      linkVisitToBookingConversionRate: 0.2,
      createdDaysAgo: 30
    });

    expect(score.score).toBe(60);
    expect(score.status).toBe('healthy');
  });

  it('applies negative signals and clamps at zero', () => {
    const score = calculateHealthScore({
      daysSinceLastLogin: 20,
      daysSinceLastBooking: null,
      bookingsLast7Days: 0,
      bookingsLast14Days: 0,
      stripeConnected: false,
      calendarConnected: false,
      servicesCount: 1,
      linkVisitsLast7Days: 20,
      linkVisitToBookingConversionRate: 0.01,
      createdDaysAgo: 10
    });

    expect(score.score).toBe(0);
    expect(score.status).toBe('at_risk');
  });

  it('assigns watch status at the lower threshold', () => {
    const score = calculateHealthScore({
      daysSinceLastLogin: 8,
      daysSinceLastBooking: 3,
      bookingsLast7Days: 0,
      bookingsLast14Days: 2,
      stripeConnected: true,
      calendarConnected: true,
      servicesCount: 1,
      linkVisitsLast7Days: 20,
      linkVisitToBookingConversionRate: 0.2,
      createdDaysAgo: 40
    });

    expect(score.score).toBe(22);
    expect(score.status).toBe('watch');
  });

  it('keeps healthy status at 50 and above', () => {
    const score = calculateHealthScore({
      daysSinceLastLogin: 2,
      daysSinceLastBooking: 2,
      bookingsLast7Days: 1,
      bookingsLast14Days: 1,
      stripeConnected: true,
      calendarConnected: true,
      servicesCount: 1,
      linkVisitsLast7Days: 12,
      linkVisitToBookingConversionRate: 0.15,
      createdDaysAgo: 12
    });

    expect(score.score).toBe(50);
    expect(score.status).toBe('healthy');
  });

  it('flags a new account with no bookings', () => {
    const score = calculateHealthScore({
      daysSinceLastLogin: 2,
      daysSinceLastBooking: null,
      bookingsLast7Days: 0,
      bookingsLast14Days: 0,
      stripeConnected: false,
      calendarConnected: false,
      servicesCount: 1,
      linkVisitsLast7Days: 0,
      linkVisitToBookingConversionRate: 0,
      createdDaysAgo: 8
    });

    expect(score.signals.negative).toContain('New account older than 7 days with no bookings');
  });
});

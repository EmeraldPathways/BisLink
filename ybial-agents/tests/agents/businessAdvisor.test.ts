jest.mock('../../src/lib/anthropic', () => ({
  MODELS: { SONNET: 'sonnet' },
  callWithCache: jest.fn().mockResolvedValue(
    JSON.stringify({
      subject: '3 customers came back',
      body: 'A strong week.',
      cta_text: 'Open dashboard',
      cta_url: 'https://example.com'
    })
  ),
  parseAgentJSON: jest.fn((value: string) => JSON.parse(value))
}));

import { runBusinessAdvisor } from '../../src/agents/businessAdvisor';

describe('runBusinessAdvisor', () => {
  it('returns parsed advisor output', async () => {
    const result = await runBusinessAdvisor({
      business: {
        id: 'biz_1',
        owner_id: 'user_1',
        slug: 'studio-eleven',
        name: 'Studio Eleven',
        category: 'Personal Training',
        bio: null,
        photo_url: null,
        location: null,
        instagram_handle: null,
        tiktok_handle: null,
        stripe_account_id: null,
        stripe_onboarded: true,
        google_cal_token: null,
        microsoft_cal_token: null,
        timezone: 'America/New_York',
        currency: 'usd',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      ownerFirstName: 'Andrew',
      thisWeekBookings: 3,
      thisWeekRevenue: 30000,
      lastWeekBookings: 2,
      lastWeekRevenue: 20000,
      allTimeBookings: 10,
      allTimeRevenue: 100000,
      allTimeUniqueCustomers: 6,
      mostBookedServiceThisWeek: 'Consultation',
      mostBookedServiceAllTime: 'Consultation',
      emptySlotsPattern: 'Tuesday afternoons are slow',
      customerReturnRate: 0.5,
      servicesNotBookedIn30Days: [],
      linkVisitToBookingConversionRate: 0.1,
      cancellationsThisWeek: 0,
      businessLink: 'https://example.com/studio-eleven',
      topCustomers: []
    });

    expect(result.subject).toContain('3 customers');
  });
});

jest.mock('../../src/lib/anthropic', () => ({
  MODELS: { HAIKU: 'haiku' },
  callWithCache: jest.fn(),
  parseAgentJSON: jest.fn((value: string) => JSON.parse(value))
}));

import { runChurnAgent } from '../../src/agents/churnPrevention';
import { callWithCache } from '../../src/lib/anthropic';

const context = {
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
    stripe_onboarded: false,
    google_cal_token: null,
    microsoft_cal_token: null,
    timezone: 'America/New_York',
    currency: 'usd',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  health: { businessId: 'biz_1', score: 10, status: 'at_risk' as const, signals: { positive: [], negative: ['No bookings'] } },
  ownerFirstName: 'Andrew',
  daysSinceLastLogin: 15,
  daysSinceLastBooking: null,
  totalBookingsAllTime: 0,
  bookingsLast7Days: 0,
  bookingsLast14Days: 0,
  linkVisitsLast7Days: 12,
  linkVisitsToBookingConversionRate: 0,
  servicesCount: 1,
  stripeConnected: false,
  businessLink: 'https://example.com/studio-eleven'
};

describe('runChurnAgent', () => {
  it('skips healthy accounts without calling the API', async () => {
    const result = await runChurnAgent({ ...context, health: { ...context.health, status: 'healthy', score: 60 } });
    expect(result.action).toBe('NO_ACTION');
    expect(callWithCache).not.toHaveBeenCalled();
  });

  it('generates an email for at-risk accounts', async () => {
    (callWithCache as jest.Mock).mockResolvedValue(
      JSON.stringify({
        action: 'SEND_EMAIL',
        reason: 'Needs help',
        email: {
          subject: 'A quick fix',
          body: 'Try sharing your link again.',
          cta_text: 'Open link',
          cta_url: 'https://example.com'
        }
      })
    );

    const result = await runChurnAgent(context as any);
    expect(result.action).toBe('SEND_EMAIL');
    expect((callWithCache as jest.Mock).mock.calls[0][0].userMessage).toContain('"servicesCount": 1');
  });
});

jest.mock('../../src/lib/anthropic', () => ({
  MODELS: { HAIKU: 'haiku' },
  callWithCache: jest.fn(),
  parseAgentJSON: jest.fn((value: string) => JSON.parse(value))
}));

import { runOnboardingCoach } from '../../src/agents/onboardingCoach';
import { callWithCache } from '../../src/lib/anthropic';

describe('runOnboardingCoach', () => {
  it('returns parsed email output', async () => {
    (callWithCache as jest.Mock).mockResolvedValue(
      JSON.stringify({
        channel: 'email',
        subject: 'You are live',
        body: 'A booking just landed',
        cta_text: 'Open dashboard',
        cta_url: 'https://example.com'
      })
    );

    const result = await runOnboardingCoach({
      trigger: 'FIRST_BOOKING_RECEIVED',
      ownerFirstName: 'Andrew',
      businessName: 'Studio Eleven',
      businessCategory: 'Personal Training',
      businessLink: 'https://example.com/studio-eleven',
      setupComplete: { businessInfo: true, servicesAdded: true, availabilitySet: true, stripeConnected: true },
      daysSinceSignup: 1,
      totalBookings: 1,
      firstBooking: {
        customerName: 'Avery',
        serviceName: 'Consultation',
        amount: 10000,
        startTime: new Date().toISOString()
      }
    });

    expect(result.subject).toBe('You are live');
    expect((callWithCache as jest.Mock).mock.calls[0][0].userMessage).toContain('Avery');
  });

  it('falls back safely on malformed JSON', async () => {
    (callWithCache as jest.Mock).mockResolvedValue('not json');
    const result = await runOnboardingCoach({
      trigger: 'USER_SIGNED_UP',
      ownerFirstName: 'Andrew',
      businessName: 'Studio Eleven',
      businessCategory: 'Personal Training',
      businessLink: 'https://example.com/studio-eleven',
      setupComplete: { businessInfo: false, servicesAdded: false, availabilitySet: false, stripeConnected: false },
      daysSinceSignup: 0,
      totalBookings: 0
    });

    expect(result.cta_text).toBe('Open dashboard');
  });
});

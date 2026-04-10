jest.mock('../../src/lib/anthropic', () => ({
  MODELS: { HAIKU: 'haiku' },
  callWithCache: jest.fn().mockResolvedValue('We offer 60 minute sessions. Tap any service card to start booking.')
}));

import { runBookingChat } from '../../src/agents/bookingChat';

describe('runBookingChat', () => {
  it('returns plain text reply', async () => {
    const result = await runBookingChat({
      businessName: 'Studio Eleven',
      businessCategory: 'Personal Training',
      businessLocation: 'Brooklyn, NY',
      businessBio: 'Movement coaching',
      instagramHandle: '@studio',
      services: [{ name: 'Consultation', duration: 60, price: 10000, description: null }],
      availabilitySummary: 'Mon-Fri 9:00-17:00',
      conversationHistory: [],
      currentMessage: 'How long is the first session?'
    });

    expect(result.reply).toContain('Tap any service card');
  });
});

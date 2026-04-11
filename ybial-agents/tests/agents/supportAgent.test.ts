jest.mock('../../src/lib/escalation', () => ({
  shouldEscalateToSonnet: jest.fn(),
  shouldEscalateToHuman: jest.fn(),
  detectEscalationReason: jest.fn(() => 'reason')
}));

jest.mock('../../src/lib/anthropic', () => ({
  MODELS: { HAIKU: 'haiku', SONNET: 'sonnet' },
  anthropic: {
    messages: {
      create: jest.fn()
    }
  },
  parseAgentJSON: jest.fn((value: string) => JSON.parse(value))
}));

import { runSupportAgent } from '../../src/agents/supportAgent';
import { anthropic } from '../../src/lib/anthropic';
import { shouldEscalateToHuman, shouldEscalateToSonnet } from '../../src/lib/escalation';

describe('runSupportAgent', () => {
  const baseContext = {
    businessId: 'biz_1',
    ownerFirstName: 'Andrew',
    businessName: 'Studio Eleven',
    businessSlug: 'studio-eleven',
    businessLink: 'https://example.com/studio-eleven',
    stripeOnboarded: true,
    calendarConnected: 'google' as const,
    servicesCount: 1,
    serviceNames: ['Consultation'],
    upcomingBookings: [],
    recentSupportHistory: [],
    conversationHistory: [{ role: 'user' as const, content: 'Old message', timestamp: new Date().toISOString() }],
    currentMessage: 'I need a refund'
  };

  it('selects Sonnet for escalation keywords', async () => {
    (shouldEscalateToSonnet as jest.Mock).mockReturnValue(true);
    (shouldEscalateToHuman as jest.Mock).mockReturnValue(false);
    (anthropic.messages.create as jest.Mock).mockResolvedValue({
      content: [
        {
          text: JSON.stringify({
            reply: 'This needs review.',
            shouldEscalateToSonnet: true,
            shouldEscalateToHuman: false,
            escalationReason: null,
            actionTaken: null
          })
        }
      ]
    });

    const result = await runSupportAgent(baseContext);
    expect(result.shouldEscalateToSonnet).toBe(true);
    expect((anthropic.messages.create as jest.Mock).mock.calls[0][0].model).toBe('sonnet');
    expect((anthropic.messages.create as jest.Mock).mock.calls[0][0].messages).toHaveLength(2);
  });

  it('sets human escalation when requested', async () => {
    (shouldEscalateToSonnet as jest.Mock).mockReturnValue(false);
    (shouldEscalateToHuman as jest.Mock).mockReturnValue(true);
    (anthropic.messages.create as jest.Mock).mockResolvedValue({
      content: [
        {
          text: JSON.stringify({
            reply: 'I flagged this.',
            shouldEscalateToSonnet: false,
            shouldEscalateToHuman: false,
            escalationReason: null,
            actionTaken: null
          })
        }
      ]
    });

    const result = await runSupportAgent(baseContext);
    expect(result.shouldEscalateToHuman).toBe(true);
  });
});

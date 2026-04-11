import { z } from 'zod';
import { anthropic, MODELS, parseAgentJSON } from '../lib/anthropic';
import { detectEscalationReason, shouldEscalateToHuman, shouldEscalateToSonnet } from '../lib/escalation';
import { SYSTEM_PROMPT } from '../prompts/supportAgent';
import type { SupportAgentOutput, SupportContext } from '../types';

const schema = z.object({
  reply: z.string(),
  shouldEscalateToSonnet: z.boolean(),
  shouldEscalateToHuman: z.boolean(),
  escalationReason: z.string().nullable().optional(),
  actionTaken: z.string().nullable().optional()
});

export async function runSupportAgent(context: SupportContext): Promise<SupportAgentOutput> {
  const escalateToSonnet = shouldEscalateToSonnet(context.currentMessage);
  const humanEscalation = shouldEscalateToHuman(context.currentMessage);
  const model = escalateToSonnet ? MODELS.SONNET : MODELS.HAIKU;
  const accountContext = [
    `Business: ${context.businessName}`,
    `Link: ${context.businessLink}`,
    `Stripe onboarded: ${context.stripeOnboarded}`,
    `Calendar: ${context.calendarConnected}`,
    `Services: ${context.serviceNames.join(', ') || 'none'}`,
    `Upcoming bookings: ${context.upcomingBookings.map((item) => `${item.customerName} / ${item.serviceName} / ${item.startTime} / ${item.status}`).join(' | ') || 'none'}`
  ].join('\n');

  const messages = [
    ...context.conversationHistory.map((message) => ({ role: message.role, content: message.content })),
    { role: 'user' as const, content: context.currentMessage }
  ];

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 500,
      system: [
        {
          type: 'text',
          text: `${SYSTEM_PROMPT}\n\nACCOUNT CONTEXT:\n${accountContext}`,
          cache_control: { type: 'ephemeral' }
        } as any
      ],
      messages
    } as any);

    const text = (response as any).content?.map((entry: any) => entry.text ?? '').join('\n') ?? '';
    const parsed = schema.parse(parseAgentJSON<SupportAgentOutput>(text));
    return {
      ...parsed,
      shouldEscalateToSonnet: parsed.shouldEscalateToSonnet || escalateToSonnet,
      shouldEscalateToHuman: parsed.shouldEscalateToHuman || humanEscalation,
      escalationReason: parsed.escalationReason ?? detectEscalationReason(context.currentMessage) ?? undefined,
      actionTaken: parsed.actionTaken ?? undefined
    };
  } catch (error) {
    console.error(error);
    return {
      reply: "I'm not sure — let me flag this for the team.",
      shouldEscalateToSonnet: escalateToSonnet,
      shouldEscalateToHuman: humanEscalation,
      escalationReason: detectEscalationReason(context.currentMessage) ?? undefined
    };
  }
}

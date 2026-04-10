import { z } from 'zod';
import { callWithCache, MODELS, parseAgentJSON } from '../lib/anthropic';
import { SYSTEM_PROMPT } from '../prompts/onboardingCoach';
import type { OnboardingAgentOutput, OnboardingContext } from '../types';

const schema = z.object({
  channel: z.union([z.literal('email'), z.literal('in_app')]),
  subject: z.string(),
  body: z.string(),
  cta_text: z.string(),
  cta_url: z.string()
});

export async function runOnboardingCoach(context: OnboardingContext): Promise<OnboardingAgentOutput> {
  const userMessage = [
    `Trigger: ${context.trigger}`,
    `Owner first name: ${context.ownerFirstName}`,
    `Business name: ${context.businessName}`,
    `Category: ${context.businessCategory}`,
    `Business link: ${context.businessLink}`,
    `Setup complete: ${JSON.stringify(context.setupComplete)}`,
    `Days since signup: ${context.daysSinceSignup}`,
    `Total bookings: ${context.totalBookings}`,
    `First booking: ${context.firstBooking ? JSON.stringify(context.firstBooking) : 'none'}`
  ].join('\n');

  try {
    const response = await callWithCache({
      model: MODELS.HAIKU,
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 400
    });

    return schema.parse(parseAgentJSON<OnboardingAgentOutput>(response));
  } catch (error) {
    console.error(error);
    return {
      channel: 'email',
      subject: 'Finish setting up your link',
      body: `${context.ownerFirstName}, your booking link is waiting. Head back to the dashboard and finish the next step.\n\n— The YBIAL Team`,
      cta_text: 'Open dashboard',
      cta_url: `${process.env.APP_URL ?? 'https://yourbusinessinalink.com'}/dashboard`
    };
  }
}

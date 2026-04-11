import { z } from 'zod';
import { callWithCache, MODELS, parseAgentJSON } from '../lib/anthropic';
import { SYSTEM_PROMPT } from '../prompts/churnPrevention';
import type { ChurnAgentOutput, ChurnContext } from '../types';

const schema = z.object({
  action: z.union([z.literal('SEND_EMAIL'), z.literal('NO_ACTION')]),
  reason: z.string(),
  email: z
    .object({
      subject: z.string(),
      body: z.string(),
      cta_text: z.string(),
      cta_url: z.string()
    })
    .nullable()
});

export async function runChurnAgent(context: ChurnContext): Promise<ChurnAgentOutput> {
  if (context.health.status === 'healthy') {
    return { action: 'NO_ACTION', reason: 'Account is healthy', email: null };
  }

  const response = await callWithCache({
    model: MODELS.HAIKU,
    systemPrompt: SYSTEM_PROMPT,
    userMessage: JSON.stringify(context, null, 2),
    maxTokens: 350
  });

  return schema.parse(parseAgentJSON<ChurnAgentOutput>(response));
}

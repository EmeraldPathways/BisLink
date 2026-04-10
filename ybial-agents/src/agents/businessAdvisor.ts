import { z } from 'zod';
import { callWithCache, MODELS, parseAgentJSON } from '../lib/anthropic';
import { SYSTEM_PROMPT } from '../prompts/businessAdvisor';
import type { AdvisorAgentOutput, AdvisorContext } from '../types';

const schema = z.object({
  subject: z.string(),
  body: z.string(),
  cta_text: z.string(),
  cta_url: z.string()
});

export async function runBusinessAdvisor(context: AdvisorContext): Promise<AdvisorAgentOutput> {
  const response = await callWithCache({
    model: MODELS.SONNET,
    systemPrompt: SYSTEM_PROMPT,
    userMessage: JSON.stringify(context, null, 2),
    maxTokens: 600
  });

  return schema.parse(parseAgentJSON<AdvisorAgentOutput>(response));
}

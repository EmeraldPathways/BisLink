import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? 'test-key'
});

export const MODELS = {
  HAIKU: 'claude-haiku-4-5-20251001',
  SONNET: 'claude-sonnet-4-6'
} as const;

export async function callWithCache(options: {
  model: (typeof MODELS)[keyof typeof MODELS];
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  cacheTTL?: '5min' | '1h';
}): Promise<string> {
  const { model, systemPrompt, userMessage, maxTokens, cacheTTL = '5min' } = options;

  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral', ttl: cacheTTL }
        } as any
      ],
      messages: [{ role: 'user', content: userMessage }]
    } as any);

    logUsage(model, response);
    return extractText(response);
  });
}

export function parseAgentJSON<T>(response: string): T {
  const cleaned = response
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  return JSON.parse(cleaned) as T;
}

export async function createBatch(
  requests: Array<{
    customId: string;
    model: (typeof MODELS)[keyof typeof MODELS];
    systemPrompt: string;
    userMessage: string;
    maxTokens: number;
  }>
): Promise<string> {
  const response = await withRetry(async () =>
    anthropic.messages.batches.create({
      requests: requests.map((request) => ({
        custom_id: request.customId,
        params: {
          model: request.model,
          max_tokens: request.maxTokens,
          system: [
            {
              type: 'text',
              text: request.systemPrompt,
              cache_control: { type: 'ephemeral' }
            } as any
          ],
          messages: [{ role: 'user', content: request.userMessage }]
        }
      }))
    } as any)
  );

  return (response as any).id as string;
}

export async function pollBatch(batchId: string): Promise<Array<{ customId: string; result: string }>> {
  for (;;) {
    const batch = await withRetry(async () => anthropic.messages.batches.retrieve(batchId) as any);
    if (batch.processing_status === 'ended') {
      const results = await anthropic.messages.batches.results(batchId) as any;
      const collected: Array<{ customId: string; result: string }> = [];
      for await (const entry of results) {
        collected.push({
          customId: entry.custom_id,
          result: extractText(entry.result?.message)
        });
      }
      return collected;
    }

    await sleep(2000);
  }
}

function extractText(response: any): string {
  const content = response?.content;
  if (Array.isArray(content)) {
    return content
      .filter((item) => item?.type === 'text')
      .map((item) => item.text)
      .join('\n')
      .trim();
  }

  if (response?.text) return String(response.text);
  return '';
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [1000, 2000, 4000];
  let lastError: unknown;

  for (let attempt = 0; attempt < delays.length + 1; attempt += 1) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status ?? error?.response?.status;
      const retryable = status === 429 || status === 500 || status === 529;
      if (!retryable || attempt === delays.length) break;
      await sleep(delays[attempt]);
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logUsage(model: string, response: any) {
  console.log(
    JSON.stringify({
      level: 'info',
      function: 'anthropic',
      action: 'USAGE',
      model,
      input_tokens: response?.usage?.input_tokens ?? null,
      output_tokens: response?.usage?.output_tokens ?? null,
      timestamp: new Date().toISOString()
    })
  );
}

type RunAgentCompletionArgs = {
  systemPrompt: string;
  userMessage: string;
  context?: unknown;
  model?: string;
  responseFormat?: 'json' | 'text';
};

export async function runAgentCompletion({
  systemPrompt,
  userMessage,
  context,
  model,
  responseFormat = 'text'
}: RunAgentCompletionArgs) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model:
        model ??
        process.env.OPENAI_SUPPORT_MODEL ??
        'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemPrompt }]
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: JSON.stringify(
                {
                  message: userMessage,
                  context
                },
                null,
                2
              )
            }
          ]
        }
      ],
      text:
        responseFormat === 'json'
          ? {
              format: {
                type: 'json_object'
              }
            }
          : undefined
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
  };

  return data.output_text ?? null;
}

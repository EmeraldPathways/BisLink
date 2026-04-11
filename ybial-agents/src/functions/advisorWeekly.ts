import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { MODELS, createBatch, parseAgentJSON, pollBatch } from '../lib/anthropic';
import { buildAdvisorContext, getAllActiveBusinessesWithBookings } from '../lib/contextBuilders';
import { SYSTEM_PROMPT } from '../prompts/businessAdvisor';
import { getBusinessWithOwner } from '../lib/supabase';
import { sendAgentEmail } from '../lib/resend';

export const advisorWeekly: HttpFunction = async (req, res) => {
  const secret = req.body?.secret ?? req.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (secret !== (process.env.WEBHOOK_SECRET ?? '')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let processed = 0;
  let emailsSent = 0;
  let errors = 0;

  try {
    const businesses = await getAllActiveBusinessesWithBookings();
    const contexts = await Promise.all(businesses.map((business) => buildAdvisorContext(business)));
    const batchId = await createBatch(
      contexts.map((context) => ({
        customId: context.business.id,
        model: MODELS.SONNET,
        systemPrompt: SYSTEM_PROMPT,
        userMessage: JSON.stringify(context, null, 2),
        maxTokens: 600
      }))
    );

    const results = await pollBatch(batchId);
    for (const result of results) {
      processed += 1;
      try {
        const output = parseAgentJSON<{ subject: string; body: string; cta_text: string; cta_url: string }>(result.result);
        const businessWithOwner = await getBusinessWithOwner(result.customId);
        if (businessWithOwner?.ownerEmail) {
          const emailResult = await sendAgentEmail({
            to: businessWithOwner.ownerEmail,
            subject: output.subject,
            body: output.body,
            ctaText: output.cta_text,
            ctaUrl: output.cta_url
          });
          if (emailResult.success) emailsSent += 1;
        }
      } catch (error) {
        errors += 1;
        console.error(error);
      }
    }
  } catch (error) {
    errors += 1;
    console.error(error);
  }

  res.status(200).json({ processed, emailsSent, errors });
};

http('advisorWeekly', advisorWeekly);

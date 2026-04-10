import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { z } from 'zod';
import { runOnboardingCoach } from '../agents/onboardingCoach';
import { buildOnboardingContext } from '../lib/contextBuilders';
import { sendAgentEmail } from '../lib/resend';
import { getBusinessWithOwner } from '../lib/supabase';

const payloadSchema = z.object({
  trigger: z.string(),
  businessId: z.string(),
  userId: z.string().optional().default('')
});

export const onboardingWebhook: HttpFunction = async (req, res) => {
  try {
    const secret = req.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? req.body?.secret;
    if (secret !== (process.env.WEBHOOK_SECRET ?? '')) {
      res.status(200).json({ ok: true });
      return;
    }

    const payload = payloadSchema.parse(req.body);
    const context = await buildOnboardingContext(payload.businessId, payload.trigger as any);
    const output = await runOnboardingCoach(context);
    const businessWithOwner = await getBusinessWithOwner(payload.businessId);

    if (businessWithOwner?.ownerEmail) {
      await sendAgentEmail({
        to: businessWithOwner.ownerEmail,
        subject: output.subject,
        body: output.body,
        ctaText: output.cta_text,
        ctaUrl: output.cta_url
      });
    }

    console.log(JSON.stringify({ level: 'info', function: 'onboardingWebhook', businessId: payload.businessId, action: 'PROCESSED', timestamp: new Date().toISOString() }));
  } catch (error) {
    console.error(error);
  }

  res.status(200).json({ ok: true });
};

http('onboardingWebhook', onboardingWebhook);

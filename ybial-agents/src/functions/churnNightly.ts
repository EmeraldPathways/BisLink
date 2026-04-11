import { http, type HttpFunction } from '@google-cloud/functions-framework';
import { buildChurnContextsForAllActiveBusinesses } from '../lib/contextBuilders';
import { getBusinessWithOwner } from '../lib/supabase';
import { sendAgentEmail } from '../lib/resend';
import { runChurnAgent } from '../agents/churnPrevention';

export const churnNightly: HttpFunction = async (req, res) => {
  const secret = req.body?.secret ?? req.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (secret !== (process.env.WEBHOOK_SECRET ?? '')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let processed = 0;
  let emailsSent = 0;
  let errors = 0;

  try {
    const contexts = await buildChurnContextsForAllActiveBusinesses();
    for (let index = 0; index < contexts.length; index += 50) {
      const batch = contexts.slice(index, index + 50);
      for (const context of batch) {
        processed += 1;
        try {
          const output = await runChurnAgent(context);
          if (output.action === 'SEND_EMAIL' && output.email) {
            const businessWithOwner = await getBusinessWithOwner(context.business.id);
            if (businessWithOwner?.ownerEmail) {
              const result = await sendAgentEmail({
                to: businessWithOwner.ownerEmail,
                subject: output.email.subject,
                body: output.email.body,
                ctaText: output.email.cta_text,
                ctaUrl: output.email.cta_url
              });
              if (result.success) emailsSent += 1;
            }
          }

          console.log(JSON.stringify({ level: 'info', function: 'churnNightly', businessId: context.business.id, action: output.action, timestamp: new Date().toISOString() }));
        } catch (error) {
          errors += 1;
          console.error(error);
        }
      }
    }
  } catch (error) {
    errors += 1;
    console.error(error);
  }

  res.status(200).json({ processed, emailsSent, errors });
};

http('churnNightly', churnNightly);

import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY ?? 're_test');

export async function sendAgentEmail(options: {
  to: string;
  subject: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const fromName = process.env.RESEND_FROM_NAME ?? 'Your Business in a Link';
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'hello@yourbusinessinalink.com';
  const htmlBody = buildHtmlBody(options.body, options.ctaText, options.ctaUrl);
  const idempotencyKey = `${options.to}:${options.subject}:${new Date().toISOString().slice(0, 10)}`;

  try {
    const result = await (resend.emails as any).send(
      {
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: htmlBody,
        text: [options.body, options.ctaText && options.ctaUrl ? `${options.ctaText}: ${options.ctaUrl}` : null].filter(Boolean).join('\n\n')
      },
      { idempotencyKey }
    );

    return { success: true, messageId: result?.data?.id ?? result?.id };
  } catch (error: any) {
    return { success: false, error: error?.message ?? 'Failed to send email' };
  }
}

function buildHtmlBody(body: string, ctaText?: string, ctaUrl?: string) {
  const lines = body
    .split('\n')
    .map((line) => `<p style="margin:0 0 16px;line-height:1.6;color:#111827;font-size:15px;">${escapeHtml(line)}</p>`)
    .join('');

  const cta = ctaText && ctaUrl
    ? `<p style="margin:24px 0 0;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600;">${escapeHtml(ctaText)}</a></p>`
    : '';

  return `<div style="background:#f8fafc;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;"><div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;"><p style="margin:0 0 24px;font-weight:700;color:#111827;">Your Business in a Link</p>${lines}${cta}<p style="margin:32px 0 0;color:#6b7280;font-size:13px;">Your Business in a Link · Unsubscribe</p></div></div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

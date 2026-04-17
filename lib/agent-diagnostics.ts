import type { AgentDiagnostics, DiagnosticCheck, DiagnosticLevel } from '@/types';

type ConfigCheckInput = {
  name: string;
  label: string;
  present: boolean;
  partial?: boolean;
  reconnectNeeded?: boolean;
  pending?: boolean;
  details?: Record<string, boolean | string | number | null>;
};

export async function getAgentDiagnostics(mode: 'quick' | 'full' = 'quick'): Promise<AgentDiagnostics> {
  const checks = buildChecks(mode);
  const summary = checks.reduce(
    (acc, check) => {
      acc[check.level] += 1;
      return acc;
    },
    { ok: 0, warn: 0, fail: 0 } satisfies Record<DiagnosticLevel, number>
  );

  return {
    timestamp: new Date().toISOString(),
    mode,
    checks,
    summary,
    overallStatus: summary.fail > 0 ? 'down' : summary.warn > 0 ? 'degraded' : 'healthy'
  };
}

function buildChecks(mode: 'quick' | 'full') {
  const checks: AgentDiagnostics['checks'] = [
    configCheck({
      name: 'stripe.secret_key',
      label: 'Stripe secret key',
      present: Boolean(process.env.STRIPE_SECRET_KEY),
      details: { configured: Boolean(process.env.STRIPE_SECRET_KEY) }
    }),
    configCheck({
      name: 'stripe.webhook_secret',
      label: 'Stripe webhook secret',
      present: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      details: { configured: Boolean(process.env.STRIPE_WEBHOOK_SECRET) }
    }),
    configCheck({
      name: 'supabase.admin',
      label: 'Supabase admin',
      present: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      partial: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY),
      details: {
        has_url: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        has_service_role: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
      }
    }),
    configCheck({
      name: 'resend.api_key',
      label: 'Resend API key',
      present: Boolean(process.env.RESEND_API_KEY),
      details: { has_api_key: Boolean(process.env.RESEND_API_KEY) }
    }),
    configCheck({
      name: 'email.from',
      label: 'Email from',
      present: Boolean(process.env.EMAIL_FROM),
      details: { has_sender: Boolean(process.env.EMAIL_FROM) }
    }),
    configCheck({
      name: 'resend.email',
      label: 'Resend email',
      present: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      partial: Boolean(process.env.RESEND_API_KEY || process.env.EMAIL_FROM),
      details: {
        has_api_key: Boolean(process.env.RESEND_API_KEY),
        has_sender: Boolean(process.env.EMAIL_FROM)
      }
    }),
    configCheck({
      name: 'google.oauth',
      label: 'Google OAuth',
      present: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI),
      partial: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_REDIRECT_URI),
      details: {
        has_client_id: Boolean(process.env.GOOGLE_CLIENT_ID),
        has_client_secret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        has_redirect_uri: Boolean(process.env.GOOGLE_REDIRECT_URI)
      }
    }),
    lifecycleCheck('booking'),
    lifecycleCheck('order'),
    configCheck({
      name: 'lifecycle.auth_token',
      label: 'Lifecycle auth token',
      present: Boolean(process.env.GOOGLE_CLOUD_FUNCTION_TOKEN),
      details: { configured: Boolean(process.env.GOOGLE_CLOUD_FUNCTION_TOKEN) }
    })
  ];

  if (mode === 'full') {
    checks.push(
      configCheck({
        name: 'app.url',
        label: 'App URL',
        present: Boolean(process.env.APP_URL),
        details: { configured: Boolean(process.env.APP_URL) }
      }),
      configCheck({
        name: 'google.calendar.runtime',
        label: 'Google Calendar runtime',
        present: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI),
        partial: Boolean(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_REDIRECT_URI),
        pending: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_CLOUD_FUNCTION_TOKEN),
        details: {
          calendar_configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI),
          lifecycle_token_configured: Boolean(process.env.GOOGLE_CLOUD_FUNCTION_TOKEN)
        }
      })
    );
  }

  return checks;
}

function lifecycleCheck(kind: 'booking' | 'order'): AgentDiagnostics['checks'][number] {
  const url =
    kind === 'booking'
      ? process.env.BOOKING_LIFECYCLE_FUNCTION_URL
      : process.env.ORDER_LIFECYCLE_FUNCTION_URL;

  return configCheck({
    name: `lifecycle.${kind}`,
    label: `${capitalize(kind)} lifecycle`,
    present: Boolean(url && process.env.GOOGLE_CLOUD_FUNCTION_TOKEN),
    partial: Boolean(url || process.env.GOOGLE_CLOUD_FUNCTION_TOKEN),
    pending: Boolean(url && !process.env.GOOGLE_CLOUD_FUNCTION_TOKEN),
    details: {
      has_url: Boolean(url),
      has_auth_token: Boolean(process.env.GOOGLE_CLOUD_FUNCTION_TOKEN)
    }
  });
}

function configCheck(input: ConfigCheckInput): DiagnosticCheck {
  const state = input.pending
    ? 'pending processing'
    : input.reconnectNeeded
      ? 'reconnect needed'
      : input.present
        ? 'configured'
        : input.partial
          ? 'partial'
          : 'missing';

  const level: DiagnosticLevel = input.present ? 'ok' : input.partial || input.reconnectNeeded || input.pending ? 'warn' : 'fail';
  const summary =
    state === 'configured'
      ? 'Configured'
      : state === 'partial'
        ? 'Partially configured'
        : state === 'reconnect needed'
          ? 'Reconnect needed'
          : state === 'pending processing'
            ? 'Pending processing'
            : 'Missing';

  return {
    name: input.name,
    label: input.label,
    level,
    state,
    summary,
    details: input.details
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

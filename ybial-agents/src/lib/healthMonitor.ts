import { anthropic, MODELS } from './anthropic';
import { resend } from './resend';
import { supabaseAdmin } from './supabase';
import { runBookingChat } from '../agents/bookingChat';
import { runBusinessAdvisor } from '../agents/businessAdvisor';
import { runChurnAgent } from '../agents/churnPrevention';
import { runOnboardingCoach } from '../agents/onboardingCoach';
import { runSupportAgent } from '../agents/supportAgent';
import type {
  AgentCheckLevel,
  AgentHealthCheck,
  AgentHealthStatus,
  AdvisorContext,
  BookingChatContext,
  ChurnContext,
  ManagerDiagnostics,
  OnboardingContext,
  SupportContext
} from '../types';

const REQUIRED_ENV_GROUPS = {
  core: ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'APP_URL', 'WEBHOOK_SECRET'],
  email: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'RESEND_FROM_NAME'],
  support: ['ESCALATION_EMAIL'],
  cloud: ['GOOGLE_CLOUD_PROJECT']
} as const;

export async function runDiagnostics(mode: 'quick' | 'full' = 'quick'): Promise<ManagerDiagnostics> {
  const checks: AgentHealthCheck[] = [];

  checks.push(...checkEnvGroups());
  checks.push(await checkSupabase());
  checks.push(await checkAnthropic());
  checks.push(checkResendConfig());

  if (mode === 'full') {
    checks.push(await checkAgentDryRun('bookingChat', async () => runBookingChat(buildBookingChatContext())));
    checks.push(await checkAgentDryRun('supportAgent', async () => runSupportAgent(buildSupportContext())));
    checks.push(await checkAgentDryRun('onboardingCoach', async () => runOnboardingCoach(buildOnboardingContext())));
    checks.push(await checkAgentDryRun('churnPrevention', async () => runChurnAgent(buildChurnContext())));
    checks.push(await checkAgentDryRun('businessAdvisor', async () => runBusinessAdvisor(buildAdvisorContext())));
  }

  const summary = {
    ok: checks.filter((check) => check.level === 'ok').length,
    warn: checks.filter((check) => check.level === 'warn').length,
    fail: checks.filter((check) => check.level === 'fail').length
  };

  return {
    timestamp: new Date().toISOString(),
    mode,
    checks,
    summary,
    overallStatus: determineOverallStatus(checks)
  };
}

export function determineOverallStatus(checks: AgentHealthCheck[]): AgentHealthStatus {
  const failCount = checks.filter((check) => check.level === 'fail').length;
  const warnCount = checks.filter((check) => check.level === 'warn').length;

  if (failCount > 0) {
    return 'down';
  }

  if (warnCount > 0) {
    return 'degraded';
  }

  return 'healthy';
}

function checkEnvGroups(): AgentHealthCheck[] {
  return Object.entries(REQUIRED_ENV_GROUPS).map(([group, keys]) => {
    const missing = keys.filter((key) => !process.env[key]);
    return missing.length === 0
      ? {
          name: `env.${group}`,
          level: 'ok',
          summary: `All required ${group} environment variables are set.`
        }
      : {
          name: `env.${group}`,
          level: 'fail',
          summary: `Missing ${missing.length} required ${group} environment variable(s).`,
          details: { missing }
        };
  });
}

async function checkSupabase(): Promise<AgentHealthCheck> {
  try {
    const { error, count } = await supabaseAdmin.from('businesses').select('*', { head: true, count: 'exact' });
    if (error) {
      return failure('dependency.supabase', error.message);
    }

    return {
      name: 'dependency.supabase',
      level: 'ok',
      summary: 'Supabase admin client responded successfully.',
      details: { businessesCount: count ?? 0 }
    };
  } catch (error) {
    return failure('dependency.supabase', error instanceof Error ? error.message : 'Unknown Supabase error');
  }
}

async function checkAnthropic(): Promise<AgentHealthCheck> {
  try {
    const response = await anthropic.messages.create({
      model: MODELS.HAIKU,
      max_tokens: 10,
      system: [{ type: 'text', text: 'Reply with OK only.' } as any],
      messages: [{ role: 'user', content: 'healthcheck' }]
    } as any);

    const text = (response as any).content?.map((item: any) => item.text ?? '').join(' ').trim();
    return {
      name: 'dependency.anthropic',
      level: text ? 'ok' : 'warn',
      summary: text ? 'Anthropic responded to a minimal healthcheck prompt.' : 'Anthropic responded with an empty payload.'
    };
  } catch (error) {
    return failure('dependency.anthropic', error instanceof Error ? error.message : 'Unknown Anthropic error');
  }
}

function checkResendConfig(): AgentHealthCheck {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return failure('dependency.resend', 'Resend environment variables are incomplete.');
  }

  return {
    name: 'dependency.resend',
    level: 'ok',
    summary: 'Resend configuration is present.'
  };
}

async function checkAgentDryRun(name: string, run: () => Promise<unknown>): Promise<AgentHealthCheck> {
  try {
    const output = await run();
    return {
      name: `agent.${name}`,
      level: 'ok',
      summary: 'Synthetic dry-run completed successfully.',
      details: { output }
    };
  } catch (error) {
    return failure(`agent.${name}`, error instanceof Error ? error.message : 'Unknown agent error');
  }
}

function failure(name: string, message: string): AgentHealthCheck {
  return {
    name,
    level: 'fail',
    summary: message
  };
}

function buildBookingChatContext(): BookingChatContext {
  return {
    businessName: 'Studio Eleven',
    businessCategory: 'Fitness',
    businessLocation: 'Dublin',
    businessBio: 'Strength coaching and recovery sessions.',
    instagramHandle: '@studioeleven',
    services: [{ name: 'Consultation', duration: 60, price: 9000, description: 'Private intro session.' }],
    availabilitySummary: 'Mon 09:00-17:00, Wed 09:00-17:00',
    conversationHistory: [{ role: 'user', content: 'Do you offer beginner sessions?' }],
    currentMessage: 'How long is the first appointment?'
  };
}

function buildSupportContext(): SupportContext {
  return {
    businessId: 'biz_1',
    ownerFirstName: 'Andrew',
    businessName: 'Studio Eleven',
    businessSlug: 'studio-eleven',
    businessLink: 'https://example.com/studio-eleven',
    stripeOnboarded: true,
    calendarConnected: 'google',
    servicesCount: 1,
    serviceNames: ['Consultation'],
    upcomingBookings: [],
    recentSupportHistory: [],
    conversationHistory: [{ role: 'user', content: 'A customer cannot find their booking.', timestamp: new Date().toISOString() }],
    currentMessage: 'A customer cannot find their booking.'
  };
}

function buildOnboardingContext(): OnboardingContext {
  return {
    trigger: 'NO_SERVICE_24H',
    ownerFirstName: 'Andrew',
    businessName: 'Studio Eleven',
    businessCategory: 'Fitness',
    businessLink: 'https://example.com/studio-eleven',
    setupComplete: {
      businessInfo: true,
      servicesAdded: false,
      availabilitySet: true,
      stripeConnected: false
    },
    daysSinceSignup: 2,
    totalBookings: 0
  };
}

function buildChurnContext(): ChurnContext {
  return {
    business: {
      id: 'biz_1',
      owner_id: 'owner_1',
      slug: 'studio-eleven',
      name: 'Studio Eleven',
      category: 'Fitness',
      bio: 'Strength coaching',
      photo_url: null,
      location: 'Dublin',
      instagram_handle: '@studioeleven',
      tiktok_handle: null,
      stripe_account_id: 'acct_123',
      stripe_onboarded: true,
      google_cal_token: null,
      microsoft_cal_token: null,
      timezone: 'Europe/Dublin',
      currency: 'usd',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    health: {
      businessId: 'biz_1',
      score: 10,
      status: 'at_risk',
      signals: { positive: [], negative: ['No bookings in the last 14 days'] }
    },
    ownerFirstName: 'Andrew',
    daysSinceLastLogin: 20,
    daysSinceLastBooking: 30,
    totalBookingsAllTime: 3,
    bookingsLast7Days: 0,
    bookingsLast14Days: 0,
    linkVisitsLast7Days: 12,
    linkVisitsToBookingConversionRate: 0,
    servicesCount: 1,
    stripeConnected: true,
    businessLink: 'https://example.com/studio-eleven'
  };
}

function buildAdvisorContext(): AdvisorContext {
  return {
    business: {
      id: 'biz_1',
      owner_id: 'owner_1',
      slug: 'studio-eleven',
      name: 'Studio Eleven',
      category: 'Fitness',
      bio: 'Strength coaching',
      photo_url: null,
      location: 'Dublin',
      instagram_handle: '@studioeleven',
      tiktok_handle: null,
      stripe_account_id: 'acct_123',
      stripe_onboarded: true,
      google_cal_token: null,
      microsoft_cal_token: null,
      timezone: 'Europe/Dublin',
      currency: 'usd',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    ownerFirstName: 'Andrew',
    thisWeekBookings: 4,
    thisWeekRevenue: 36000,
    lastWeekBookings: 3,
    lastWeekRevenue: 27000,
    allTimeBookings: 24,
    allTimeRevenue: 216000,
    allTimeUniqueCustomers: 18,
    mostBookedServiceThisWeek: 'Consultation',
    mostBookedServiceAllTime: 'Consultation',
    emptySlotsPattern: 'Mornings are quieter than afternoons this week',
    customerReturnRate: 0.4,
    servicesNotBookedIn30Days: ['Mobility Reset'],
    linkVisitToBookingConversionRate: 0.12,
    cancellationsThisWeek: 0,
    businessLink: 'https://example.com/studio-eleven',
    topCustomers: [{ name: 'Jamie', totalBookings: 4, totalSpent: 36000, lastBookingDaysAgo: 5 }]
  };
}

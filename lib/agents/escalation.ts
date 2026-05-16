import type { UserSupportContext } from '@/lib/agents/types';

const ESCALATION_PATTERNS = [
  'refund',
  'chargeback',
  'dispute',
  'lawyer',
  'solicitor',
  'legal',
  'gdpr',
  'data deletion',
  'delete my data',
  'data access request',
  'subject access request',
  'hacked',
  'security',
  'breach',
  'data loss',
  'lost data',
  'cannot access account',
  'can’t access account',
  'cant access account',
  'account takeover',
  'stolen account',
  'fraud',
  'angry',
  'furious',
  'terrible',
  'useless',
  'scam',
  'failed payment again',
  'payment failed again',
  'repeated payment failure'
];

export function shouldEscalate(message: string, context?: UserSupportContext): boolean {
  const normalized = message.toLowerCase();

  if (ESCALATION_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return true;
  }

  if (context?.stripeConnected === false && /(refund|payment|charged|charge)/.test(normalized)) {
    return true;
  }

  return false;
}

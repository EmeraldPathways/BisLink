export const SONNET_ESCALATION_KEYWORDS = [
  'refund',
  'charge',
  'dispute',
  'fraud',
  'legal',
  'lawsuit',
  'cancel account',
  'delete everything',
  'data',
  'privacy',
  'not working',
  'broken',
  'bug',
  'lost',
  'missing booking',
  'furious',
  'angry',
  'disgusted',
  'terrible',
  'useless',
  'scam'
];

export const HUMAN_ESCALATION_KEYWORDS = [
  'speak to a person',
  'real person',
  'human agent',
  'manager',
  'not satisfied',
  'threatening',
  'legal action',
  'solicitor',
  'attorney'
];

export function shouldEscalateToSonnet(message: string): boolean {
  return includesAny(message, SONNET_ESCALATION_KEYWORDS);
}

export function shouldEscalateToHuman(message: string): boolean {
  return includesAny(message, HUMAN_ESCALATION_KEYWORDS);
}

export function detectEscalationReason(message: string): string | null {
  const normalized = message.toLowerCase();
  const human = HUMAN_ESCALATION_KEYWORDS.find((keyword) => normalized.includes(keyword));
  if (human) return `Human escalation keyword detected: ${human}`;
  const sonnet = SONNET_ESCALATION_KEYWORDS.find((keyword) => normalized.includes(keyword));
  if (sonnet) return `Sensitive support topic detected: ${sonnet}`;
  return null;
}

function includesAny(message: string, keywords: string[]) {
  const normalized = message.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

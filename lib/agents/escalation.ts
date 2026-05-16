import type { UserSupportContext } from '@/lib/agents/types';

export type EscalationIssueType =
  | 'refund'
  | 'legal'
  | 'privacy_request'
  | 'security'
  | 'data_loss'
  | 'account_access'
  | 'abuse'
  | 'payment_failure';

export type EscalationMatch = {
  issueType: EscalationIssueType;
  reason: string;
};

type EscalationRule = {
  issueType: EscalationIssueType;
  reason: string;
  patterns: RegExp[];
};

const ESCALATION_RULES: EscalationRule[] = [
  {
    issueType: 'refund',
    reason: 'Refund, chargeback, or billing dispute request.',
    patterns: [
      /\brefund\b/,
      /\bchargeback\b/,
      /\bdispute\b/,
      /\bcharged twice\b/,
      /\bdouble charge(?:d)?\b/,
      /\bwrongly charged\b/,
      /\bunauthori[sz]ed charge\b/
    ]
  },
  {
    issueType: 'legal',
    reason: 'Legal threat or complaint.',
    patterns: [/\blegal\b/, /\blawyer\b/, /\bsolicitor\b/, /\battorney\b/, /\blawsuit\b/, /\bsue\b/]
  },
  {
    issueType: 'privacy_request',
    reason: 'Privacy or data-rights request.',
    patterns: [
      /\bgdpr\b/,
      /\bdelete my data\b/,
      /\bdelete all my data\b/,
      /\bdata deletion\b/,
      /\bdata access request\b/,
      /\bcopy of .*personal data\b/,
      /\bpersonal data you hold about me\b/,
      /\bsubject access request\b/,
      /\bprivacy request\b/,
      /\berase my data\b/,
      /\bexport my data\b/,
      /\bexport my customer data\b/,
      /\bdelete.*customer data\b/
    ]
  },
  {
    issueType: 'security',
    reason: 'Security incident or suspected compromise.',
    patterns: [
      /\bhacked\b/,
      /\bsecurity\b/,
      /\bbreach\b/,
      /\bcompromised\b/,
      /\baccount hacked\b/,
      /\bsomeone (got into|logged into|accessed) my account\b/,
      /\bsomeone unauthori[sz]ed accessed my account\b/,
      /\bunauthori[sz]ed.*access(ed)? my account\b/,
      /\bunauthori[sz]ed access\b/
    ]
  },
  {
    issueType: 'data_loss',
    reason: 'Possible data loss.',
    patterns: [
      /\bdata loss\b/,
      /\blost data\b/,
      /\bdata was lost\b/,
      /\bworried data was lost\b/,
      /\bmy data is gone\b/,
      /\beverything disappeared\b/,
      /\b(bookings|products|services|reviews).*(disappeared)\b/,
      /\bdisappeared.*(bookings|products|services|reviews)\b/,
      /\b(bookings|products|services|reviews).*(missing|gone|deleted)\b/,
      /\b(missing|gone|deleted).*(bookings|products|services|reviews)\b/
    ]
  },
  {
    issueType: 'account_access',
    reason: 'Owner cannot access their account.',
    patterns: [
      /\bcannot access account\b/,
      /\bcan'?t access account\b/,
      /\bcant access account\b/,
      /\blocked out\b/,
      /\bcan'?t log in\b/,
      /\bcant log in\b/,
      /\bunable to log in\b/,
      /\baccount takeover\b/,
      /\bstolen account\b/
    ]
  },
  {
    issueType: 'abuse',
    reason: 'High-friction or abusive escalation.',
    patterns: [
      /\bangry\b/,
      /\bfurious\b/,
      /\bscam\b/,
      /\bterrible\b/,
      /\buseless\b/,
      /\bthis is ridiculous\b/,
      /\bi am done\b/
    ]
  },
  {
    issueType: 'payment_failure',
    reason: 'Repeated or severe payment failure.',
    patterns: [
      /\bfailed payment again\b/,
      /\bpayment failed again\b/,
      /\brepeated payment failure\b/,
      /\bpayments keep failing\b/,
      /\bcheckout keeps failing\b/,
      /\bmultiple payment failures\b/
    ]
  }
];

export function detectEscalation(
  message: string,
  context?: UserSupportContext
): EscalationMatch | null {
  const normalized = message.toLowerCase();

  for (const rule of ESCALATION_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return {
        issueType: rule.issueType,
        reason: rule.reason
      };
    }
  }

  return null;
}

export function getEscalationFollowUpQuestion(issueType: EscalationIssueType): string {
  switch (issueType) {
    case 'refund':
      return 'What was the charge for, and approximately when did it happen?';
    case 'legal':
      return 'What is the legal complaint or request you need reviewed?';
    case 'privacy_request':
      return 'Is this a data access request, deletion request, or another privacy request?';
    case 'security':
      return 'What suspicious activity did you notice, and when did it happen?';
    case 'data_loss':
      return 'What data is missing, and when did you first notice it was gone?';
    case 'account_access':
      return 'What email do you use for the account, and what happens when you try to log in?';
    case 'abuse':
      return 'What happened that you want the support team to review immediately?';
    case 'payment_failure':
      return 'What were you trying to charge for, and what error did you see?';
  }
}

export function shouldEscalate(message: string, context?: UserSupportContext): boolean {
  return detectEscalation(message, context) !== null;
}

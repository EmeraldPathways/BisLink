import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectEscalation,
  getEscalationFollowUpQuestion
} from '../../lib/agents/escalation.js';
import { runTechnicalTriageAgent } from '../../lib/agents/technical-triage-agent.js';
import type { ActivationStatus, UserSupportContext } from '../../lib/agents/types.js';

const baseContext: UserSupportContext = {
  userId: 'user-1',
  businessId: 'biz-1',
  businessName: 'BisLink Studio',
  publicUrl: 'https://bislink.app/bislink-studio',
  pagePublished: true,
  hasProfileImage: true,
  hasBannerImage: true,
  serviceCount: 1,
  hasAvailability: true,
  stripeConnected: true,
  productCount: 1,
  hasContactLinks: true,
  hasSocialLinks: true,
  subscriptionStatus: null
};

const baseActivation: ActivationStatus = {
  activationScore: 100,
  missingSteps: [],
  completedSteps: [],
  nextBestAction: 'Share your public BisLink URL with customers.',
  nextBestActionHref: '/link',
  nextBestActionReason: 'Sharing your public page is the next step once setup is complete.'
};

test('detectEscalation catches paraphrased account compromise reports', () => {
  const result = detectEscalation('Someone got into my account and I cannot log in now', baseContext);

  assert.equal(result?.issueType, 'security');
  assert.equal(result?.reason, 'Security incident or suspected compromise.');
});

test('getEscalationFollowUpQuestion returns issue-specific prompt', () => {
  const result = getEscalationFollowUpQuestion('refund');
  assert.match(result, /charge/i);
});

test('technical triage asks payment-specific follow-up when details are thin', async () => {
  const result = await runTechnicalTriageAgent({
    message: 'Payments are not working',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(result.needsFollowUp, true);
  assert.equal(result.followUpQuestion, 'What were you trying to charge for, and what error or result did you see?');
});

test('technical triage upgrades data loss to P0', async () => {
  const result = await runTechnicalTriageAgent({
    message: 'All my bookings disappeared from the dashboard after saving.',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(result.needsFollowUp, false);
  assert.equal(result.ticketDraft?.severity, 'P0');
  assert.equal(result.requiresHuman, true);
});

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

test('detectEscalation catches bookings disappeared with data-loss concern', () => {
  const result = detectEscalation(
    'Bookings disappeared after I changed something today. I need help urgently and I’m worried data was lost.',
    baseContext
  );

  assert.equal(result?.issueType, 'data_loss');
  assert.equal(result?.reason, 'Possible data loss.');
});

test('detectEscalation does not escalate payment setup blockers when Stripe is disconnected', () => {
  const result = detectEscalation(
    'Why does checkout say "Business payments not configured" when a customer tries to pay?',
    {
      ...baseContext,
      stripeConnected: false
    }
  );

  assert.equal(result, null);
});

test('detectEscalation catches delete-all-data privacy requests', () => {
  const result = detectEscalation('I need to delete all my data from BisLink.', baseContext);

  assert.equal(result?.issueType, 'privacy_request');
});

test('detectEscalation catches customer-data export requests', () => {
  const result = detectEscalation('I want to export my customer data.', baseContext);

  assert.equal(result?.issueType, 'privacy_request');
});

test('detectEscalation catches unauthorized account access phrasing', () => {
  const result = detectEscalation(
    'Someone unauthorized accessed my account and changed details.',
    baseContext
  );

  assert.equal(result?.issueType, 'security');
});

test('technical triage asks calendar-specific follow-up for reconnect failures', async () => {
  const result = await runTechnicalTriageAgent({
    message: 'I clicked reconnect Google Calendar but it still says not connected.',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(result.needsFollowUp, true);
  assert.equal(
    result.followUpQuestion,
    'What happened when you tried to connect or reconnect Google Calendar, and what status or error did you see?'
  );
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { findRelevantHelpDocs } from '../../lib/agents/knowledge/help-docs.js';
import { classifySupportRequest } from '../../lib/agents/orchestrator.js';
import { runSupportAgent } from '../../lib/agents/support-agent.js';
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
  completedSteps: [
    'business_name',
    'profile_image',
    'banner_image',
    'service_created',
    'availability',
    'stripe_connection',
    'contact_or_social_links'
  ],
  nextBestAction: 'Share your public BisLink URL with customers.',
  nextBestActionHref: '/link',
  nextBestActionReason: 'Sharing your public page is the next step once setup is complete.'
};

test('classifySupportRequest selects support ops expert for owner inbox questions', () => {
  const result = classifySupportRequest({
    message: 'How do I reply to a message in my public support inbox?',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(result.domain, 'support_ops_expert');
  assert.equal(result.route, 'support');
  assert.equal(result.decisionType, 'grounded_answer');
  assert.equal(result.knowledgeAreaIds.includes('owner-support-inbox'), true);
  assert.equal(result.evidenceRefs.includes('registry:owner-support-inbox'), true);
});

test('classifySupportRequest uses clarifying questions for low-evidence requests', () => {
  const result = classifySupportRequest({
    message: 'I need help',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(result.route, 'support');
  assert.equal(result.decisionType, 'clarifying_question');
  assert.equal(result.requiresHuman, false);
});

test('runSupportAgent returns grounded answer contract from structured knowledge', async () => {
  const classification = classifySupportRequest({
    message: 'How do I add blocked time for next Monday afternoon?',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(classification.route, 'support');
  assert.equal(classification.decisionType, 'grounded_answer');

  const result = await runSupportAgent({
    message: 'How do I add blocked time for next Monday afternoon?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I add blocked time for next Monday afternoon?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'booking_expert');
  assert.equal(result.decisionType, 'grounded_answer');
  assert.equal(result.evidenceRefs.includes('registry:availability-and-blocked-time'), true);
  assert.match(result.reply, /Dashboard -> Availability/i);
});

test('runSupportAgent uses support ops playbook for owner inbox replies', async () => {
  const classification = classifySupportRequest({
    message: 'How do I reply to a message in my public support inbox?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I reply to a message in my public support inbox?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I reply to a message in my public support inbox?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'support_ops_expert');
  assert.match(result.reply, /Dashboard -> Support/i);
  assert.match(result.reply, /reply field/i);
});

test('runSupportAgent uses calendar playbook for reconnect guidance', async () => {
  const classification = classifySupportRequest({
    message: 'Where do I reconnect Google Calendar after I changed my Google account?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'Where do I reconnect Google Calendar after I changed my Google account?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs(
      'Where do I reconnect Google Calendar after I changed my Google account?'
    ),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'calendar_expert');
  assert.match(result.reply, /Dashboard -> Calendar/i);
  assert.match(result.reply, /Reconnect Google Calendar/i);
});

test('runSupportAgent uses frontend review playbook for request review limitation', async () => {
  const classification = classifySupportRequest({
    message: 'What does the Request review button do?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'What does the Request review button do?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('What does the Request review button do?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'frontend_expert');
  assert.match(result.reply, /Request review button/i);
  assert.match(result.reply, /not wired up yet/i);
});

test('runSupportAgent uses backend playbook for order confirmation guidance', async () => {
  const classification = classifySupportRequest({
    message: 'A customer paid but says they never got an order confirmation. What should I check?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'A customer paid but says they never got an order confirmation. What should I check?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs(
      'A customer paid but says they never got an order confirmation. What should I check?'
    ),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'backend_expert');
  assert.match(result.reply, /paid but no confirmation/i);
  assert.match(result.reply, /Dashboard -> Support/i);
});

test('classifySupportRequest grounds new product image questions in products', () => {
  const result = classifySupportRequest({
    message: 'Hi, i cant add an image to a new product',
    context: baseContext,
    activationStatus: baseActivation
  });

  assert.equal(result.route, 'support');
  assert.equal(result.decisionType, 'grounded_answer');
  assert.equal(result.domain, 'frontend_expert');
  assert.equal(result.knowledgeAreaIds.includes('products'), true);
});

test('runSupportAgent uses products playbook for product image uploads', async () => {
  const classification = classifySupportRequest({
    message: 'Hi, i cant add an image to a new product',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'Hi, i cant add an image to a new product',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('Hi, i cant add an image to a new product'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'frontend_expert');
  assert.match(result.reply, /Dashboard -> Products/i);
  assert.match(result.reply, /image upload field/i);
  assert.match(result.reply, /5MB or smaller/i);
});

test('runSupportAgent uses services playbook for service image and form fields', async () => {
  const classification = classifySupportRequest({
    message: 'How do I add a service image and set the duration?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I add a service image and set the duration?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I add a service image and set the duration?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'frontend_expert');
  assert.match(result.reply, /Dashboard -> Services/i);
  assert.match(result.reply, /square image/i);
  assert.match(result.reply, /Duration/i);
});

test('runSupportAgent uses my link playbook for link settings guidance', async () => {
  const classification = classifySupportRequest({
    message: 'How do I change my slug in My Link?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I change my slug in My Link?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I change my slug in My Link?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'frontend_expert');
  assert.match(result.reply, /Dashboard -> Link/i);
  assert.match(result.reply, /Link Settings/i);
});

test('runSupportAgent uses theme playbook for theme settings guidance', async () => {
  const classification = classifySupportRequest({
    message: 'How do I change the theme preset and font pairing?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I change the theme preset and font pairing?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I change the theme preset and font pairing?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'frontend_expert');
  assert.match(result.reply, /Dashboard -> Theme/i);
  assert.match(result.reply, /Theme Preset/i);
  assert.match(result.reply, /font pairing/i);
});

test('runSupportAgent uses availability playbook for working hours controls', async () => {
  const classification = classifySupportRequest({
    message: 'How do I turn on Tuesday and save my working hours?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I turn on Tuesday and save my working hours?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I turn on Tuesday and save my working hours?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'booking_expert');
  assert.match(result.reply, /Working hours/i);
  assert.match(result.reply, /Save/i);
});

test('runSupportAgent uses bookings playbook for choose a time guidance', async () => {
  const classification = classifySupportRequest({
    message: 'Why does Choose a time show no slots for this service?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'Why does Choose a time show no slots for this service?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('Why does Choose a time show no slots for this service?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'booking_expert');
  assert.match(result.reply, /Choose a time/i);
  assert.match(result.reply, /Availability/i);
});

test('runSupportAgent uses payouts playbook for dashboard coverage', async () => {
  const classification = classifySupportRequest({
    message: 'What can I see on the Payouts page?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'What can I see on the Payouts page?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('What can I see on the Payouts page?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'payments_expert');
  assert.match(result.reply, /revenue totals/i);
  assert.match(result.reply, /payout history/i);
});

test('runSupportAgent uses calendar playbook for weekly calendar coverage', async () => {
  const classification = classifySupportRequest({
    message: 'What is on the Calendar page besides reconnecting Google Calendar?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'What is on the Calendar page besides reconnecting Google Calendar?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs(
      'What is on the Calendar page besides reconnecting Google Calendar?'
    ),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'calendar_expert');
  assert.match(result.reply, /Weekly calendar/i);
  assert.match(result.reply, /integration card/i);
});

test('runSupportAgent uses reviews playbook for publish hide and verified state', async () => {
  const classification = classifySupportRequest({
    message: 'How do I publish a verified review?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I publish a verified review?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs('How do I publish a verified review?'),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'frontend_expert');
  assert.match(result.reply, /Verified/i);
  assert.match(result.reply, /Publish or Hide/i);
});

test('runSupportAgent uses support inbox playbook for owner request flow', async () => {
  const classification = classifySupportRequest({
    message: 'How do I use Ask admin for help and send a support request?',
    context: baseContext,
    activationStatus: baseActivation
  });

  const result = await runSupportAgent({
    message: 'How do I use Ask admin for help and send a support request?',
    context: baseContext,
    activationStatus: baseActivation,
    relevantDocs: findRelevantHelpDocs(
      'How do I use Ask admin for help and send a support request?'
    ),
    conversationHistory: [],
    domain: classification.domain,
    confidence: classification.confidence,
    decisionType: 'grounded_answer',
    evidenceRefs: classification.evidenceRefs,
    knowledgeAreaIds: classification.knowledgeAreaIds
  });

  assert.equal(result.domain, 'support_ops_expert');
  assert.match(result.reply, /Ask admin for help/i);
  assert.match(result.reply, /Send support request/i);
});

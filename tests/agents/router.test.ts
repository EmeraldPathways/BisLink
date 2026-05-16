import test from 'node:test';
import assert from 'node:assert/strict';
import { routeSupportMessage } from '../../lib/agents/router.js';
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
  nextBestActionHref: 'https://bislink.app/bislink-studio',
  nextBestActionReason: 'Sharing your public page is the next step once setup is complete.'
};

test('routeSupportMessage uses AI fallback when deterministic rules are ambiguous', async () => {
  let runnerCalled = false;

  const result = await routeSupportMessage({
    message: 'I need help with something odd on my account',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => {
      runnerCalled = true;
      return JSON.stringify({
        route: 'technical_triage',
        confidence: 0.77,
        reason: 'The message implies an issue rather than a how-to question.',
        requiresHuman: false
      });
    }
  });

  assert.equal(runnerCalled, true);
  assert.equal(result.route, 'technical_triage');
  assert.equal(result.confidence, 0.77);
});

test('routeSupportMessage keeps deterministic escalation ahead of AI fallback', async () => {
  let runnerCalled = false;

  const result = await routeSupportMessage({
    message: 'I want a refund for this charge',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => {
      runnerCalled = true;
      return JSON.stringify({
        route: 'support',
        confidence: 0.2,
        reason: 'wrong',
        requiresHuman: false
      });
    }
  });

  assert.equal(runnerCalled, false);
  assert.equal(result.route, 'human_escalation');
  assert.equal(result.requiresHuman, true);
});

test('routeSupportMessage treats calendar sync failures as technical triage', async () => {
  let runnerCalled = false;

  const result = await routeSupportMessage({
    message: 'My Google Calendar connection stopped working and new bookings are not syncing. What should I do?',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => {
      runnerCalled = true;
      return JSON.stringify({
        route: 'support',
        confidence: 0.2,
        reason: 'wrong',
        requiresHuman: false
      });
    }
  });

  assert.equal(runnerCalled, false);
  assert.equal(result.route, 'technical_triage');
  assert.equal(result.requiresHuman, false);
});

test('routeSupportMessage keeps payment setup issues out of human escalation', async () => {
  let runnerCalled = false;

  const result = await routeSupportMessage({
    message: 'Why does checkout say "Business payments not configured" when a customer tries to pay?',
    context: {
      ...baseContext,
      stripeConnected: false
    },
    activationStatus: {
      ...baseActivation,
      activationScore: 80,
      missingSteps: ['stripe_connection'],
      completedSteps: [
        'business_name',
        'profile_image',
        'banner_image',
        'service_created',
        'availability',
        'contact_or_social_links'
      ],
      nextBestAction: 'Complete Stripe setup',
      nextBestActionHref: '/payouts'
    },
    runCompletion: async () => {
      runnerCalled = true;
      return null;
    }
  });

  assert.equal(runnerCalled, false);
  assert.equal(result.route, 'setup_completion');
});

test('routeSupportMessage treats stale public page content after save as technical triage', async () => {
  const result = await routeSupportMessage({
    message: 'I saved changes to my public page but the new content is not showing live.',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => null
  });

  assert.equal(result.route, 'technical_triage');
});

test('routeSupportMessage treats failing uploads as technical triage', async () => {
  const result = await routeSupportMessage({
    message: 'My portfolio image upload keeps failing even though the file is under 5MB.',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => null
  });

  assert.equal(result.route, 'technical_triage');
});

test('routeSupportMessage treats missing support inbox messages as technical triage', async () => {
  const result = await routeSupportMessage({
    message: 'The support inbox is missing my earlier conversation messages.',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => null
  });

  assert.equal(result.route, 'technical_triage');
});

test('routeSupportMessage keeps known request-review limitation in support', async () => {
  const result = await routeSupportMessage({
    message: 'The Request review button is there but nothing happens after I click it.',
    context: baseContext,
    activationStatus: baseActivation,
    runCompletion: async () => null
  });

  assert.equal(result.route, 'support');
});

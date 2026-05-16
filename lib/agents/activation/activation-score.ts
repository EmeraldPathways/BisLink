import type { UserSupportContext } from '@/lib/agents/types';

export function calculateActivationScore(context: UserSupportContext) {
  let activationScore = 0;
  const completedSteps: string[] = [];
  const missingSteps: string[] = [];

  if (context.businessName) {
    activationScore += 10;
    completedSteps.push('business_name');
  } else {
    missingSteps.push('business_name');
  }

  if (context.hasProfileImage) {
    activationScore += 10;
    completedSteps.push('profile_image');
  } else {
    missingSteps.push('profile_image');
  }

  if (context.hasBannerImage) {
    activationScore += 10;
    completedSteps.push('banner_image');
  } else {
    missingSteps.push('banner_image');
  }

  if ((context.serviceCount ?? 0) > 0) {
    activationScore += 20;
    completedSteps.push('service_created');
  } else {
    missingSteps.push('service_created');
  }

  if (context.hasAvailability) {
    activationScore += 20;
    completedSteps.push('availability');
  } else {
    missingSteps.push('availability');
  }

  if (context.stripeConnected) {
    activationScore += 20;
    completedSteps.push('stripe_connection');
  } else {
    missingSteps.push('stripe_connection');
  }

  if (context.hasContactLinks || context.hasSocialLinks) {
    activationScore += 10;
    completedSteps.push('contact_or_social_links');
  } else {
    missingSteps.push('contact_or_social_links');
  }

  return {
    activationScore,
    completedSteps,
    missingSteps
  };
}

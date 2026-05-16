import type { ActivationStatus, UserSupportContext } from '@/lib/agents/types';

type ActionDefinition = {
  key: string;
  action: string;
  href?: string;
  reason: string;
};

const ACTIONS: ActionDefinition[] = [
  {
    key: 'business_name',
    action: 'Add your business name to your BisLink page.',
    href: '/link',
    reason: 'Customers need a clear business identity before they trust or book your page.'
  },
  {
    key: 'profile_image',
    action: 'Add a profile image to your BisLink page.',
    href: '/link',
    reason: 'A profile image makes the page feel real and improves trust.'
  },
  {
    key: 'banner_image',
    action: 'Add a banner image to your BisLink page.',
    href: '/link',
    reason: 'A banner image makes the public page look complete and more shareable.'
  },
  {
    key: 'service_created',
    action: 'Add your first service.',
    href: '/services',
    reason: 'Customers cannot book until there is at least one active service.'
  },
  {
    key: 'availability',
    action: 'Add availability so customers can book.',
    href: '/availability',
    reason: 'Bookings stay blocked until you publish available times.'
  },
  {
    key: 'stripe_connection',
    action: 'Connect Stripe so customers can pay online.',
    href: '/payouts',
    reason: 'Online payments are unavailable until Stripe setup is complete.'
  },
  {
    key: 'contact_or_social_links',
    action: 'Add contact or social links to your page.',
    href: '/link',
    reason: 'Contact and social links make it easier for customers to reach or verify you.'
  }
];

export function getNextBestAction(
  missingSteps: string[],
  context: UserSupportContext
): Pick<ActivationStatus, 'nextBestAction' | 'nextBestActionHref' | 'nextBestActionReason'> {
  const missing = ACTIONS.find((action) => missingSteps.includes(action.key));
  if (missing) {
    return {
      nextBestAction: missing.action,
      nextBestActionHref: missing.href,
      nextBestActionReason: missing.reason
    };
  }

  return {
    nextBestAction: context.publicUrl
      ? 'Share your public BisLink URL with customers.'
      : 'Your page setup looks complete.',
    nextBestActionHref: context.publicUrl ?? undefined,
    nextBestActionReason: context.publicUrl
      ? 'Sharing your public page is the next step once setup is complete.'
      : 'No setup blockers were detected.'
  };
}

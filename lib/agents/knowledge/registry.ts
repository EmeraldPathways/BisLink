import type { SupportDomain } from '@/lib/agents/types';
import { helpDocs } from '@/lib/agents/knowledge/help-docs';

export interface BusinessAreaKnowledge {
  id: string;
  domain: SupportDomain;
  title: string;
  summary: string;
  suggestedActionHref?: string;
  frontendRefs: string[];
  backendRefs: string[];
  sourceOfTruth: string[];
  supportedActions: string[];
  knownFailureModes: string[];
  allowedGuidance: string[];
  escalationBoundaries: string[];
  keywords: string[];
  curatedDocIds: string[];
}

export interface KnowledgeMatch {
  area: BusinessAreaKnowledge;
  score: number;
  evidenceRefs: string[];
}

export const businessAreaKnowledgeRegistry: BusinessAreaKnowledge[] = [
  {
    id: 'public-page-editor',
    domain: 'frontend_expert',
    title: 'Public page editor',
    summary: 'Owner dashboard My Link editor for Hero, Announcement, Bookings, Shop, Portfolio, About and Trust, Contact and Social, and Link Settings.',
    suggestedActionHref: '/link',
    frontendRefs: ['components/dashboard/LinkWorkspace.tsx', 'app/(dashboard)/link/page.tsx'],
    backendRefs: ['app/api/owner/business/route.ts', 'app/api/owner/portfolio/route.ts'],
    sourceOfTruth: ['businesses', 'portfolio_items'],
    supportedActions: ['edit hero content', 'change business name', 'change category', 'change slug', 'upload section images', 'update public page sections', 'copy link'],
    knownFailureModes: ['saved content not visible on live page', 'section image save fails', 'slug change not reflected'],
    allowedGuidance: ['point owners to Dashboard -> Link', 'explain live page propagation through save/revalidate flow'],
    escalationBoundaries: ['technical defects when saved content is not reflected publicly'],
    keywords: ['my link', 'link editor', 'public page', 'hero image', 'cover image', 'business name', 'category', 'short bio', 'cta label', 'slug', 'link settings', 'about section', 'live page', 'old content'],
    curatedDocIds: ['link-editor-overview', 'portfolio-and-public-page', 'share-link']
  },
  {
    id: 'theme-settings',
    domain: 'frontend_expert',
    title: 'Theme Settings',
    summary: 'Owner dashboard Theme editor for Theme Preset, Brand Styling, brand colour, font pairing, and Save Theme Settings.',
    suggestedActionHref: '/link/theme',
    frontendRefs: ['components/dashboard/LinkWorkspace.tsx', 'components/dashboard/LinkEditor.tsx', 'app/(dashboard)/link/theme/page.tsx'],
    backendRefs: ['app/api/owner/business/route.ts'],
    sourceOfTruth: ['businesses.theme_key', 'businesses.custom_primary_color', 'businesses.custom_font_pairing'],
    supportedActions: ['change theme preset', 'change brand colour', 'change font pairing', 'save theme settings'],
    knownFailureModes: ['theme changes not visible', 'theme save not reflected on public page'],
    allowedGuidance: ['point owners to Dashboard -> Theme', 'explain Theme Preset, Brand Styling, and Save Theme Settings'],
    escalationBoundaries: ['technical defects when saved theme changes are not reflected publicly'],
    keywords: ['theme', 'theme settings', 'theme preset', 'brand colour', 'brand color', 'font pairing', 'save theme', 'theme changes'],
    curatedDocIds: ['theme-settings']
  },
  {
    id: 'services',
    domain: 'frontend_expert',
    title: 'Services',
    summary: 'Owner service management for the Add service form, including Name, Description, Service image, Duration, Price, and activity state.',
    suggestedActionHref: '/services',
    frontendRefs: ['components/dashboard/ServiceForm.tsx', 'app/(dashboard)/services/page.tsx'],
    backendRefs: ['app/api/owner/services/route.ts', 'app/api/owner/services/[id]/route.ts'],
    sourceOfTruth: ['services'],
    supportedActions: ['add service', 'create service', 'edit service', 'upload service image', 'set duration', 'set price', 'set service active state'],
    knownFailureModes: ['cannot add service image', 'service image upload fails', 'service missing or inactive in booking flow', 'service save validation fails'],
    allowedGuidance: ['point owners to Dashboard -> Services', 'explain Add service form fields and square image requirement', 'explain active service requirement for bookings'],
    escalationBoundaries: ['technical defects when active services do not appear or persist correctly'],
    keywords: ['service', 'services', 'add service', 'create service', 'service image', 'upload image', 'image upload', 'duration', 'price', 'service inactive', 'service not found'],
    curatedDocIds: ['services', 'booking-issues']
  },
  {
    id: 'availability-and-blocked-time',
    domain: 'booking_expert',
    title: 'Availability and blocked time',
    summary: 'Weekly Working hours and Block time off controls that determine public slot availability.',
    suggestedActionHref: '/availability',
    frontendRefs: ['components/dashboard/AvailabilityGrid.tsx', 'app/(dashboard)/availability/page.tsx'],
    backendRefs: ['app/api/owner/availability/route.ts', 'app/api/owner/blocked-times/route.ts'],
    sourceOfTruth: ['availability', 'blocked_times'],
    supportedActions: ['set working hours', 'toggle weekdays', 'save weekday hours', 'add blocked time', 'delete blocked time'],
    knownFailureModes: ['no bookable slots', 'blocked time ignored', 'opening hours missing'],
    allowedGuidance: ['point owners to Dashboard -> Availability', 'explain Working hours and Block time off controls', 'explain active weekday and blocked-time logic'],
    escalationBoundaries: ['technical defects when blocked time or availability state is ignored by booking availability'],
    keywords: ['availability', 'working hours', 'block time off', 'blocked time', 'add blocked time', 'bookable slots', 'holiday', 'no times', 'still book'],
    curatedDocIds: ['availability', 'booking-issues']
  },
  {
    id: 'bookings',
    domain: 'booking_expert',
    title: 'Bookings',
    summary: 'Public booking flow, including service selection, date selection, the Choose a time step, slot generation, and booking-state conflicts.',
    suggestedActionHref: '/availability',
    frontendRefs: ['components/booking/BookingPage.tsx', 'components/booking/StepTime.tsx'],
    backendRefs: ['app/api/availability/route.ts', 'app/api/bookings/route.ts'],
    sourceOfTruth: ['bookings', 'availability', 'services'],
    supportedActions: ['book service', 'choose date', 'choose time', 'choose slot', 'view booking conflicts'],
    knownFailureModes: ['slot unavailable', 'slot blocked', 'service not found or inactive', 'business not active'],
    allowedGuidance: ['explain slot generation dependencies', 'suggest service/activity/availability checks'],
    escalationBoundaries: ['technical defects when booking flow disagrees with saved availability or service state'],
    keywords: ['booking', 'choose a time', 'slot', 'bookings', 'service not found', 'slot unavailable', 'slot blocked', 'availability unavailable'],
    curatedDocIds: ['booking-issues', 'api-bookings-failures', 'api-availability-public']
  },
  {
    id: 'products',
    domain: 'frontend_expert',
    title: 'Products',
    summary: 'Owner product management for the Add product form, including Product name, Description, Product image, Category, Price, Original price, Badge, stock state, and digital/physical configuration.',
    suggestedActionHref: '/products',
    frontendRefs: ['components/dashboard/ProductForm.tsx', 'app/(dashboard)/products/page.tsx'],
    backendRefs: ['app/api/owner/products/route.ts', 'app/api/owner/products/[id]/route.ts'],
    sourceOfTruth: ['products'],
    supportedActions: ['add product', 'create product', 'edit product', 'upload product image', 'set category', 'set price', 'set original price', 'set badge', 'mark in stock', 'set digital download'],
    knownFailureModes: ['cannot add product image', 'product image upload fails', 'product missing at checkout', 'out of stock mismatch', 'digital delivery info missing'],
    allowedGuidance: ['point owners to Dashboard -> Products', 'explain Add product form fields and square image requirement', 'explain active/in-stock/digital fields'],
    escalationBoundaries: ['technical defects when checkout or product display disagrees with saved product state'],
    keywords: ['product', 'new product', 'digital', 'physical', 'out of stock', 'download link', 'product image', 'upload image', 'image upload'],
    curatedDocIds: ['products', 'payment-issues']
  },
  {
    id: 'reviews',
    domain: 'frontend_expert',
    title: 'Reviews',
    summary: 'Review visibility controls for customer review cards, including Publish, Hide, Verified status, and the current Request review limitation.',
    suggestedActionHref: '/reviews',
    frontendRefs: ['components/dashboard/ReviewsManager.tsx', 'app/(dashboard)/reviews/page.tsx'],
    backendRefs: ['app/api/owner/reviews/[id]/route.ts', 'app/api/reviews/route.ts'],
    sourceOfTruth: ['reviews'],
    supportedActions: ['publish review', 'hide review', 'check verified review'],
    knownFailureModes: ['published review not visible', 'request review button limitation'],
    allowedGuidance: ['point owners to Dashboard -> Reviews', 'explain published vs hidden state'],
    escalationBoundaries: ['technical defects when visibility state does not match public page output'],
    keywords: ['review', 'reviews', 'publish review', 'hide review', 'verified', 'request review'],
    curatedDocIds: ['reviews']
  },
  {
    id: 'payouts-and-stripe',
    domain: 'payments_expert',
    title: 'Payouts and Stripe',
    summary: 'Stripe Connect status, payment readiness, revenue totals, payout history, recent orders, and checkout setup dependencies for products and bookings.',
    suggestedActionHref: '/payouts',
    frontendRefs: ['components/dashboard/StripeConnectButton.tsx', 'app/(dashboard)/payouts/page.tsx'],
    backendRefs: ['app/api/stripe/connect/route.ts', 'app/api/checkout/route.ts', 'app/api/stripe/webhook/route.ts'],
    sourceOfTruth: ['businesses.stripe_account_id', 'businesses.stripe_onboarded', 'orders', 'bookings'],
    supportedActions: ['connect Stripe', 'complete onboarding', 'accept payments', 'view payout history', 'view revenue totals'],
    knownFailureModes: ['business payments not configured', 'Stripe not configured', 'checkout failures'],
    allowedGuidance: ['point owners to Dashboard -> Payouts', 'explain charges enabled/details submitted requirements'],
    escalationBoundaries: ['refunds and repeated payment failures escalate; setup blockers stay self-serve'],
    keywords: ['stripe', 'payouts', 'payments', 'checkout', 'complete stripe onboarding', 'payout history', 'revenue totals', 'business payments not configured', 'connect stripe'],
    curatedDocIds: ['payouts-stripe', 'payment-issues', 'api-checkout-failures']
  },
  {
    id: 'calendar-google',
    domain: 'calendar_expert',
    title: 'Google Calendar',
    summary: 'Calendar integration status, Weekly calendar view, Google connection/reconnect, sync state, and booking event-write behavior.',
    suggestedActionHref: '/calendar',
    frontendRefs: ['components/dashboard/CalendarView.tsx', 'components/dashboard/GoogleCalendarConnectButton.tsx', 'app/(dashboard)/calendar/page.tsx'],
    backendRefs: ['app/api/calendar/google/route.ts', 'app/api/calendar/google/callback/route.ts', 'lib/google/calendar.ts'],
    sourceOfTruth: ['businesses.google_cal_token', 'bookings.google_event_id'],
    supportedActions: ['connect calendar', 'reconnect calendar', 'view weekly calendar', 'sync bookings'],
    knownFailureModes: ['calendar not connected', 'reconnect needed', 'connected but not syncing', 'event creation failed'],
    allowedGuidance: ['point owners to Dashboard -> Calendar', 'differentiate connect/reconnect from sync failure'],
    escalationBoundaries: ['technical defects when sync or event-write behavior disagrees with saved connection state'],
    keywords: ['google calendar', 'weekly calendar', 'calendar sync', 'reconnect calendar', 'calendar connected', 'not appearing there'],
    curatedDocIds: ['google-calendar-connection']
  },
  {
    id: 'owner-support-inbox',
    domain: 'support_ops_expert',
    title: 'Owner support inbox',
    summary: 'Owner dashboard Public support inbox, Ask admin for help form, owner-created support requests, and owner replies in support conversations.',
    suggestedActionHref: '/support',
    frontendRefs: ['components/dashboard/SupportInbox.tsx', 'app/(dashboard)/support/page.tsx'],
    backendRefs: ['app/api/owner/support/route.ts', 'app/api/owner/support/[id]/route.ts', 'app/api/owner/support/[id]/reply/route.ts'],
    sourceOfTruth: ['support_tickets', 'support_conversations', 'support_messages'],
    supportedActions: ['create owner support request', 'send support request', 'change ticket status', 'reply in support conversation', 'escalate to admin'],
    knownFailureModes: ['owner reply missing', 'owner ticket not visible', 'admin reply not visible'],
    allowedGuidance: ['point owners to Dashboard -> Support/Settings', 'explain owner/admin conversation flow'],
    escalationBoundaries: ['technical defects when ticket or message persistence/visibility fails'],
    keywords: ['support inbox', 'public support inbox', 'ask admin for help', 'support request', 'owner support', 'reply to message', 'send reply', 'escalate to admin', 'admin replied', 'no ticket appears'],
    curatedDocIds: ['support-inbox', 'owner-support-inbox', 'contact-form-support']
  },
  {
    id: 'admin-support-inbox',
    domain: 'support_ops_expert',
    title: 'Admin support inbox',
    summary: 'Admin-facing support inbox, admin assignment, and admin replies into owner support conversations.',
    suggestedActionHref: '/support',
    frontendRefs: ['components/admin/AdminSupportInbox.tsx', 'app/admin/(console)/support/page.tsx'],
    backendRefs: ['app/api/admin/support/[id]/route.ts', 'app/api/admin/support/[id]/reply/route.ts'],
    sourceOfTruth: ['support_tickets', 'support_messages'],
    supportedActions: ['assign ticket', 'mark in progress', 'admin reply'],
    knownFailureModes: ['admin reply not visible to owner', 'ticket assignment not reflected'],
    allowedGuidance: ['technical explanation only; owner-facing guidance should stay high-level'],
    escalationBoundaries: ['technical defects when admin-owner support message visibility fails'],
    keywords: ['admin support', 'admin replied', 'assigned ticket'],
    curatedDocIds: []
  },
  {
    id: 'contact-form',
    domain: 'support_ops_expert',
    title: 'Public contact form',
    summary: 'Public contact submissions that create support tickets for owners.',
    suggestedActionHref: '/support',
    frontendRefs: ['components/public/tabs/ContactTab.tsx'],
    backendRefs: ['app/api/contact/route.ts'],
    sourceOfTruth: ['support_tickets'],
    supportedActions: ['submit public support message'],
    knownFailureModes: ['contact-form message never created as support ticket'],
    allowedGuidance: ['explain that public support messages should appear in the owner support inbox'],
    escalationBoundaries: ['technical defects when public contact submissions are not persisted'],
    keywords: ['contact form', 'contact-form message', 'public page message', 'support ticket from contact form'],
    curatedDocIds: ['contact-form-support', 'owner-support-inbox']
  },
  {
    id: 'order-confirmations',
    domain: 'backend_expert',
    title: 'Order confirmations and support messaging',
    summary: 'Order confirmation delivery and related message persistence for paid orders.',
    suggestedActionHref: '/support',
    frontendRefs: ['components/dashboard/SupportInbox.tsx', 'app/(dashboard)/support/page.tsx'],
    backendRefs: ['functions/order-lifecycle/index.ts', 'app/api/orders/route.ts', 'lib/dashboard-data.ts'],
    sourceOfTruth: ['orders.confirmation_sent'],
    supportedActions: ['deliver order confirmations', 'track pending confirmations'],
    knownFailureModes: ['paid order but confirmation not received'],
    allowedGuidance: ['explain pending confirmation state and support review path'],
    escalationBoundaries: ['technical defects when confirmation delivery state is inconsistent with paid orders'],
    keywords: ['order confirmation', 'order confirmations', 'not receiving', 'paid order'],
    curatedDocIds: ['order-confirmations']
  }
];

function scoreKeyword(message: string, keyword: string) {
  if (!message.includes(keyword)) return 0;
  return keyword.includes(' ') ? 4 : 2;
}

export function scoreBusinessAreaKnowledge(message: string): KnowledgeMatch[] {
  const normalized = message.toLowerCase();

  return businessAreaKnowledgeRegistry
    .map((area) => {
      const keywordScore = area.keywords.reduce(
        (total, keyword) => total + scoreKeyword(normalized, keyword),
        0
      );
      const actionScore = area.supportedActions.reduce(
        (total, action) => total + scoreKeyword(normalized, action.toLowerCase()),
        0
      );
      const failureScore = area.knownFailureModes.reduce(
        (total, failure) => total + scoreKeyword(normalized, failure.toLowerCase()),
        0
      );
      const score = keywordScore + actionScore + failureScore;

      return {
        area,
        score,
        evidenceRefs: [`registry:${area.id}`]
      } satisfies KnowledgeMatch;
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function getBusinessAreaKnowledgeById(id: string) {
  return businessAreaKnowledgeRegistry.find((area) => area.id === id) ?? null;
}

export function findCuratedDocsByIds(ids: string[]) {
  return ids
    .map((id) => helpDocs.find((doc) => doc.id === id) ?? null)
    .filter((doc): doc is (typeof helpDocs)[number] => Boolean(doc));
}

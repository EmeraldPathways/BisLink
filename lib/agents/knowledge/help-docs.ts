import type { HelpDoc } from '@/lib/agents/types';
import { apiKnowledgeDocs } from '@/lib/agents/knowledge/api-docs';
import { dashboardKnowledgeDocs } from '@/lib/agents/knowledge/dashboard-docs';
import { scoreKnowledgeDocs } from '@/lib/agents/knowledge/index';

export const helpDocs: HelpDoc[] = [
  {
    id: 'link-editor-overview',
    title: 'How the BisLink page editor works',
    href: '/link',
    keywords: [
      'link',
      'page',
      'editor',
      'profile',
      'banner',
      'slug',
      'hero',
      'portfolio',
      'contact',
      'social',
      'theme'
    ],
    content:
      'Open Dashboard -> Link to edit your public page live. The editor is split into Hero, Announcement, Bookings, Shop, Portfolio, About and Trust, Contact and Social, and Link Settings. You can change the business name, category, profile photo, cover image, CTA label, custom section images, contact links, social links, and page slug here. Slugs must be 3 to 64 characters and use lowercase letters, numbers, and hyphens. Save changes to update both /link and the public page.'
  },
  {
    id: 'services',
    title: 'How services work in BisLink',
    href: '/services',
    keywords: [
      'service',
      'services',
      'booking',
      'duration',
      'price',
      'edit service',
      'delete service',
      'service image'
    ],
    content:
      'Open Dashboard -> Services to add or edit bookable services. Each service needs a name, optional description, duration, and price. Duration must be between 5 and 480 minutes. Price is saved as currency in the business default currency. Service images are optional and shown on booking cards. Only active services are available on the public page and booking flow. If no active services exist, customers cannot book.'
  },
  {
    id: 'availability',
    title: 'How availability and blocked time work',
    href: '/availability',
    keywords: [
      'availability',
      'hours',
      'calendar',
      'bookings',
      'times',
      'working hours',
      'blocked time',
      'time off'
    ],
    content:
      'Open Dashboard -> Availability to set working hours for each day of the week. Active days require both a start time and end time. You can also add blocked time for specific dates and times, and the end time must be after the start time. Public booking availability is calculated from active weekly hours, existing bookings, blocked time, service duration, and service buffer. Without active availability on that weekday, customers will see no bookable slots.'
  },
  {
    id: 'google-calendar-connection',
    title: 'How Google Calendar connection and reconnect work',
    href: '/calendar',
    keywords: [
      'google calendar',
      'calendar connection',
      'connect calendar',
      'reconnect calendar',
      'calendar stopped working',
      'calendar not connected',
      'reconnect needed',
      'calendar unavailable',
      'google oauth',
      'calendar sync'
    ],
    content:
      'Open Dashboard -> Calendar to check the Google Calendar integration card and use Connect Google Calendar or Reconnect Google Calendar. If the status is Not connected or Reconnect needed, reconnect the Google account so new bookings can sync again. If the button shows an error like missing_code, invalid_state, save_failed, or token_exchange_failed, restart the connection from the Calendar page. If the app shows Calendar unavailable, the Google Calendar environment variables are not configured and this needs support review.'
  },
  {
    id: 'payouts-stripe',
    title: 'How payouts and Stripe Connect work',
    href: '/payouts',
    keywords: [
      'stripe',
      'payments',
      'payouts',
      'checkout',
      'connect stripe',
      'stripe onboarding',
      'business payments not configured',
      'charges enabled',
      'details submitted'
    ],
    content:
      'Go to Dashboard -> Payouts and use the Complete Stripe onboarding button. Finish the Stripe Express flow, then return to BisLink. Payments only work after the connected account exists and Stripe reports charges enabled plus details submitted. If setup is incomplete, bookings and product checkout can fail with "Business payments not configured".'
  },
  {
    id: 'products',
    title: 'How products and shop checkout work',
    href: '/products',
    keywords: [
      'products',
      'shop',
      'stock',
      'digital',
      'physical products',
      'product image',
      'add product',
      'badge',
      'out of stock'
    ],
    content:
      'Go to Dashboard -> Products and use the product form on the right side of the page. Enter a name and price, then optionally add a description, square image, category, original price, and badge. Save to create the product. New products are created as active and in stock by default, and each business can have up to 10 active products.'
  },
  {
    id: 'reviews',
    title: 'How reviews work in the dashboard',
    href: '/reviews',
    keywords: [
      'reviews',
      'rating',
      'testimonial',
      'publish review',
      'hide review',
      'verified review',
      'customer review',
      'hide customer review',
      'public page review',
      'hide review from public page',
      'request review button'
    ],
    content:
      'Open Dashboard -> Reviews to publish or hide customer reviews. Use this page if you need to hide a customer review from your public page. Only published reviews appear on the public page. The dashboard shows whether a review is verified. The current review management flow supports visibility changes only. The "Request review" button is present in the UI but the follow-up outbound workflow is not wired up yet.'
  },
  {
    id: 'portfolio-and-public-page',
    title: 'How portfolio and public page sections work',
    href: '/link',
    keywords: [
      'portfolio',
      'public page',
      'video link',
      'image',
      'image specs',
      'image size',
      'image dimensions',
      'sections',
      'preview'
    ],
    content:
      'Open Dashboard -> Link to edit your public page sections. Portfolio supports image and video-link items, with up to 6 active portfolio items. Section-specific images and headings are available for Bookings, Shop, About, and Contact. Uploads must be JPG, PNG, or WebP and 5MB or smaller. Product and service images must be square 1:1. Cover images and Link section images must be 16:9. Portfolio images do not enforce a fixed ratio.'
  },
  {
    id: 'share-link',
    title: 'How to share your BisLink URL',
    href: '/link',
    keywords: ['share', 'link', 'url', 'public page', 'slug', 'copy link'],
    content:
      'Your public BisLink URL is based on the slug saved in Dashboard -> Link. The in-app link editor can copy the public URL directly. If the slug is changed, the new public route is revalidated after save. Share the public page only after services, availability, and contact details are in place.'
  },
  {
    id: 'booking-issues',
    title: 'How to diagnose booking issues',
    href: '/availability',
    keywords: [
      'booking',
      'cannot book',
      'no bookings',
      'no booking slots',
      'no booking slots showing',
      'no times showing',
      'calendar broken',
      'slot unavailable',
      'slot blocked',
      'service not found',
      'bookings not working',
      'service active',
      'service is active',
      'public page no slots',
      'public page booking slots'
    ],
    content:
      'Booking slots are available only when the business is active, the service is active, the selected weekday has active availability, and the requested time does not overlap an existing pending or confirmed booking or any blocked time. If your service is active but no booking slots are showing on the public page, check weekday availability, blocked time, and existing bookings first. The public availability API returns "Business not found or inactive", "Service not found or inactive", or no opening hours when setup is incomplete. The booking creation API can also return "Slot no longer available" or "Slot is blocked" if the time became unavailable.'
  },
  {
    id: 'payment-issues',
    title: 'How to diagnose payment and checkout issues',
    href: '/payouts',
    keywords: [
      'payment',
      'checkout',
      'stripe',
      'card',
      'failed payment',
      'payments not configured',
      'checkout broken',
      'product checkout'
    ],
    content:
      'Both booking payments and product checkout require an active business with a valid Stripe Connect account. If Stripe is missing or incomplete, BisLink returns "Stripe is not configured" or "Business payments not configured". Product checkout also fails if a product is inactive, missing, or out of stock. Physical-product checkout requires phone and shipping address fields. Repeated payment failures, refund demands, or chargeback complaints should be escalated for human review.'
  }
];

export const supportKnowledgeDocs: HelpDoc[] = [
  ...helpDocs,
  ...dashboardKnowledgeDocs,
  ...apiKnowledgeDocs
];

export function findRelevantHelpDocs(message: string) {
  return scoreKnowledgeDocs(message, supportKnowledgeDocs)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.doc);
}

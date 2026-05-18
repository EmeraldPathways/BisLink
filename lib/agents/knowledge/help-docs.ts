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
      'Open Dashboard -> Link to edit your public page live. My Link is split into Hero, Announcement, Bookings, Shop, Portfolio, About and Trust, Contact and Social, and Link Settings. Hero includes Profile photo, Cover image, Business name, Category, Short bio, and Primary CTA label. Bookings, Shop, About, and Contact each have section image, title, and subtitle controls. Portfolio lets you add, remove, reorder, and update portfolio items. Link Settings lets you update the public slug and copy or open the link. Slugs must be 3 to 64 characters and use lowercase letters, numbers, and hyphens. Save changes to update both /link and the public page.'
  },
  {
    id: 'theme-settings',
    title: 'How Theme Settings work',
    href: '/link/theme',
    keywords: [
      'theme',
      'theme settings',
      'theme preset',
      'brand colour',
      'brand color',
      'font pairing',
      'save theme',
      'link theme'
    ],
    content:
      'Open Dashboard -> Theme to control the visual styling of the public page while previewing it live. Theme Settings is split into Theme Preset, Brand Styling, and Save Theme. Theme Preset chooses the overall visual direction. Brand Styling lets you adjust the brand colour and font pairing. Use Save Theme Settings to persist the current theme changes to the public page.'
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
      'Open Dashboard -> Services and use the Add service form to create a new bookable service. The form includes Name, Description, Service image, Duration, and Price. The service image is shown on the public booking cards and should be a square image. Duration must be between 5 and 480 minutes. Price is saved in the business default currency. Use Create service to save the item. Only active services are available on the public page and booking flow. If no active services exist, customers cannot book.'
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
      'Open Dashboard -> Availability to manage Working hours and Block time off. In Working hours, each day of the week can be turned On or Off, then saved with a start time and end time. In Block time off, use Date, Start, End, and Reason, then select Add blocked time. The end time must be after the start time. Public booking availability is calculated from active weekly hours, existing bookings, blocked time, service duration, and service buffer. Without active availability on that weekday, customers will see no bookable slots.'
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
      'Open Dashboard -> Calendar to check the Calendar integration card and the Weekly calendar view. Use Connect Google Calendar or Reconnect Google Calendar from the integration card. If the status is Not connected or Reconnect needed, reconnect the Google account so new bookings can sync again. If the app shows connected successfully, bookings can sync to Google Calendar. If the button shows an error like missing_code, invalid_state, save_failed, or token_exchange_failed, restart the connection from the Calendar page. If the app shows Calendar unavailable, the Google Calendar environment variables are not configured and this needs support review.'
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
      'Go to Dashboard -> Payouts to view Stripe Connect status, revenue totals, payout history, and recent orders. If Stripe is not connected, use the Complete Stripe onboarding button to launch the Stripe Express flow. Payments only work after the connected account exists and Stripe reports charges enabled plus details submitted. If setup is incomplete, bookings and product checkout can fail with "Business payments not configured".'
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
      'Go to Dashboard -> Products and use the Add product form to create a new item. The form includes Product name, Description, Product image, Category, Price, Original price, and Badge. The product image is shown on public shop cards and the product detail view, and it should be a square image. Use Upload Image to attach it before saving. Category, Original price, and Badge are optional. Use Create product to save the item. New products are created as active and in stock by default, and each business can have up to 10 active products.'
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
      'Open Dashboard -> Reviews to manage customer feedback cards. Each review shows the customer name, written review text, rating, and whether it is Verified or Unverified. Use Publish or Hide to control whether a review appears on the public page. The current review management flow supports visibility changes only. The Request review button is present in the UI but the follow-up outbound workflow is not wired up yet.'
  },
  {
    id: 'owner-support-inbox',
    title: 'How the owner support inbox works',
    href: '/support',
    keywords: [
      'support inbox',
      'owner support',
      'reply to support message',
      'reply to message',
      'support ticket',
      'public support inbox',
      'contact-form ticket'
    ],
    content:
      'Open Dashboard -> Support to manage business support, communication status, and platform help in one place. The Public support inbox shows messages submitted from the public page contact form, with ticket status, priority, conversation history, Send reply, and Escalate to admin actions. If a ticket has a linked support conversation, use the reply field in that thread to send a message back to support. Owner-created support requests also appear here and ticket status changes are reflected in the same thread.'
  },
  {
    id: 'contact-form-support',
    title: 'How public contact-form support messages work',
    href: '/support',
    keywords: [
      'contact form',
      'public page message',
      'contact-form message',
      'public support message',
      'support ticket from contact form'
    ],
    content:
      'Messages submitted through the public contact form should create a support ticket that appears in Dashboard -> Support. That ticket becomes the owner-visible inbox thread for follow-up replies and status changes.'
  },
  {
    id: 'order-confirmations',
    title: 'How order confirmations are tracked',
    href: '/support',
    keywords: [
      'order confirmation',
      'confirmation email',
      'confirmation not received',
      'paid order',
      'order message'
    ],
    content:
      'Paid orders track whether a confirmation has been sent. If a customer paid but no confirmation arrived, first confirm the order was completed successfully, then treat missing confirmation delivery as a support issue rather than a setup step.'
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
      'In the public booking flow, customers choose a service, a date, and then a time from the Choose a time step. Available slots are shown only when the business is active, the service is active, the selected weekday has active availability, and the requested time does not overlap an existing pending or confirmed booking or any blocked time. If your service is active but no booking slots are showing on the public page, check weekday availability, blocked time, and existing bookings first. The public availability API returns "Business not found or inactive", "Service not found or inactive", or no opening hours when setup is incomplete. The booking creation API can also return "Slot no longer available" or "Slot is blocked" if the time became unavailable.'
  },
  {
    id: 'support-inbox',
    title: 'How the support inbox works',
    href: '/support',
    keywords: [
      'public support inbox',
      'support inbox',
      'support conversation',
      'ask admin for help',
      'send support request',
      'reply in support conversation',
      'escalate to admin'
    ],
    content:
      'Open Dashboard -> Support to manage business support, communication status, and platform help in one place. The Public support inbox shows messages submitted from your public page contact form. Owners can filter by status, open a conversation, Send reply, change status, change priority, and Escalate to admin. The same page also includes Ask admin for help, where owners can enter a Subject and Message, then Send support request.'
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

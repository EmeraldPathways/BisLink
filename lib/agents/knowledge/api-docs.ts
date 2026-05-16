import type { HelpDoc } from '@/lib/agents/types';

export const apiKnowledgeDocs: HelpDoc[] = [
  {
    id: 'api-owner-business-rules',
    title: 'Owner business API validation rules',
    keywords: ['owner business api', 'slug taken', 'business validation', 'link save failed'],
    content:
      'The owner business PATCH API validates URLs, email fields, slug format, years of experience, and theme settings. Slugs must be unique per business and use lowercase letters, numbers, and hyphens.'
  },
  {
    id: 'api-services-rules',
    title: 'Owner services API validation rules',
    keywords: ['service api', 'duration min', 'duration max', 'service save failed'],
    content:
      'Service create and update routes validate service names up to 120 characters, descriptions up to 1000, duration between 5 and 480 minutes, and price up to 10000000 minor currency units.'
  },
  {
    id: 'api-availability-rules',
    title: 'Owner availability API validation rules',
    keywords: ['availability api', 'start and end time required', 'blocked time end after start'],
    content:
      'The owner availability API requires a day_of_week between 0 and 6. Active days must include both start_time and end_time. Blocked time creation requires end_time to be after start_time.'
  },
  {
    id: 'api-products-rules',
    title: 'Owner products API validation rules',
    keywords: ['product api', '10 active products', 'product save failed', 'badge', 'category'],
    content:
      'Product create and update routes enforce a maximum of 10 active products per business. Product names can be up to 120 characters, descriptions up to 1000, categories up to 80, and badges up to 40.'
  },
  {
    id: 'api-bookings-failures',
    title: 'Public booking API failure cases',
    keywords: ['slot blocked', 'slot unavailable', 'business payments not configured', 'business not found', 'service not found', 'bookings api'],
    content:
      'The booking API fails when Stripe is not configured, the business is inactive, the selected service is inactive or missing, the business payments are not configured, the slot overlaps a pending or confirmed booking, or the slot overlaps blocked time.'
  },
  {
    id: 'api-checkout-failures',
    title: 'Product checkout API failure cases',
    keywords: ['checkout api', 'product not found', 'out of stock', 'shipping address required', 'payments not configured'],
    content:
      'The product checkout flow fails when Stripe is not configured, the business is inactive, business payments are not configured, requested products are missing or inactive, products are out of stock, or physical-product orders are missing phone or shipping address fields.'
  },
  {
    id: 'api-availability-public',
    title: 'Public availability API slot generation',
    keywords: ['availability api public', 'opening hours', 'available slots', 'buffer after'],
    content:
      'The public availability API computes slots from the selected service duration and buffer, active weekday availability, existing bookings, blocked times, and business timezone. If a weekday has no active availability, openingHours is returned as null.'
  }
];

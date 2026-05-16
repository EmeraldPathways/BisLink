import type { HelpDoc } from '@/lib/agents/types';

export const dashboardKnowledgeDocs: HelpDoc[] = [
  {
    id: 'dashboard-link-route',
    title: 'Dashboard Link route and public page editor',
    keywords: ['link', 'editor', 'public page', 'slug', 'theme', 'portfolio', 'contact'],
    content:
      'Dashboard -> Link renders LinkWorkspace with a live PublicPage preview. It edits hero, announcement, bookings, products, portfolio, about, contact, and settings fields, then saves them through /api/owner/business plus portfolio APIs.'
  },
  {
    id: 'dashboard-services-route',
    title: 'Dashboard Services route',
    keywords: ['services page', 'service form', 'edit service', 'service toggle', 'service image'],
    content:
      'Dashboard -> Services shows active and inactive services from getServicesData and saves through /api/owner/services. ServiceForm accepts name, description, duration, price, and optional square image. Service cards can be edited, toggled, and deleted.'
  },
  {
    id: 'dashboard-availability-route',
    title: 'Dashboard Availability route',
    keywords: ['availability page', 'working hours', 'blocked times', 'save availability'],
    content:
      'Dashboard -> Availability renders weekly working hours and blocked time management. Each weekday can be turned on or off, saved individually, and blocked times can be added or deleted through owner APIs.'
  },
  {
    id: 'dashboard-payouts-route',
    title: 'Dashboard Payouts route',
    keywords: ['payouts page', 'stripe status', 'connect stripe', 'payout history'],
    content:
      'Dashboard -> Payouts shows Stripe Connect status, revenue totals, payout history, and recent orders. If Stripe is not connected, the main call to action launches /api/stripe/connect.'
  },
  {
    id: 'dashboard-products-route',
    title: 'Dashboard Products route',
    keywords: ['products page', 'product form', 'shop', 'product limit', 'in stock'],
    content:
      'Dashboard -> Products manages up to 10 active products. ProductForm saves name, description, category, price, optional original price, badge, and optional image. Product cards support active toggles and stock visibility in the data layer.'
  },
  {
    id: 'dashboard-reviews-route',
    title: 'Dashboard Reviews route',
    keywords: ['reviews page', 'publish review', 'hide review', 'verified reviews'],
    content:
      'Dashboard -> Reviews loads all reviews and lets the owner publish or hide them through /api/owner/reviews/[id]. The current UI includes a disabled request-review action, so review outreach is not fully wired yet.'
  }
];

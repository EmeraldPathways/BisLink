import type { Metadata } from 'next';
import { PublicPage } from '@/components/public/PublicPage';
import { demoCredentials, demoPortfolioItems, demoProducts, demoReviews, demoServices, demoSpecialisms, getDemoBusinessBySlug } from '@/lib/demo-data';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Studio Eleven · BisLink demo',
  description: 'Preview the Studio Eleven public BisLink page demo.',
  openGraph: {
    title: 'Studio Eleven · BisLink demo',
    description: 'Preview the Studio Eleven public BisLink page demo.'
  },
  twitter: {
    card: 'summary',
    title: 'Studio Eleven · BisLink demo',
    description: 'Preview the Studio Eleven public BisLink page demo.'
  }
};

export default function DemoPage() {
  const business = getDemoBusinessBySlug('studio-eleven');

  if (!business) {
    throw new Error('Demo business not found');
  }

  return (
    <PublicPage
      mode="demo"
      business={business}
      services={demoServices}
      products={demoProducts}
      reviews={demoReviews}
      credentials={demoCredentials}
      specialisms={demoSpecialisms}
      portfolioItems={demoPortfolioItems}
    />
  );
}

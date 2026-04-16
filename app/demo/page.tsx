import { PublicPage } from '@/components/public/PublicPage';
import { demoCredentials, demoProducts, demoReviews, demoServices, demoSpecialisms, getDemoBusinessBySlug } from '@/lib/demo-data';

export const revalidate = 60;

export default function DemoPage() {
  const business = getDemoBusinessBySlug('studio-eleven');

  if (!business) {
    throw new Error('Demo business not found');
  }

  return (
    <PublicPage
      business={business}
      services={demoServices}
      products={demoProducts}
      reviews={demoReviews}
      credentials={demoCredentials}
      specialisms={demoSpecialisms}
    />
  );
}

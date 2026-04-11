import { notFound } from 'next/navigation';
import { PublicPage } from '@/components/public/PublicPage';
import {
  demoCredentials,
  demoProducts,
  demoReviews,
  demoServices,
  demoSpecialisms,
  getDemoBusinessBySlug
} from '@/lib/demo-data';

export const revalidate = 60;

export async function generateStaticParams() {
  return [{ slug: 'studio-eleven' }];
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const business = getDemoBusinessBySlug(params.slug);
  if (!business) return notFound();

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

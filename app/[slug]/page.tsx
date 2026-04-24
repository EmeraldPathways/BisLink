import { notFound } from 'next/navigation';
import { PublicPage } from '@/components/public/PublicPage';
import { getPublicBusinessPageBySlug } from '@/lib/public-page-data';

export const dynamic = 'force-dynamic';

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const publicPage = await getPublicBusinessPageBySlug(slug);
  if (!publicPage) return notFound();

  return (
    <PublicPage
      business={publicPage.business}
      services={publicPage.services}
      products={publicPage.products}
      reviews={publicPage.reviews}
      credentials={publicPage.credentials}
      specialisms={publicPage.specialisms}
    />
  );
}

import { notFound } from 'next/navigation';
import { BookingPage } from '@/components/booking/BookingPage';
import { demoServices, getDemoBusinessBySlug } from '@/lib/demo-data';

export const revalidate = 60;

export async function generateStaticParams() {
  return [{ slug: 'studio-eleven' }];
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const business = getDemoBusinessBySlug(params.slug);
  if (!business) return notFound();

  return <BookingPage business={business} services={demoServices} />;
}

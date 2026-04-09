import { notFound } from 'next/navigation';
import { BookingPage } from '@/components/booking/BookingPage';

export const revalidate = 60;

const demo = {
  slug: 'studio-eleven',
  name: 'Studio Eleven',
  category: 'Personal Training',
  bio: 'Movement coaching for real people. No fluff, no fads — just honest training that gets results.',
  location: 'Brooklyn, NY'
};

const services = [
  { id: '1', name: '1-on-1 Training Session', description: 'Full hour tailored entirely to your goals and current fitness level.', duration_minutes: 60, price: 12000, tag: 'Most Booked', emoji: '💪' },
  { id: '2', name: 'Power Half Hour', description: 'High-intensity focused work. 30 minutes, real results.', duration_minutes: 30, price: 6500, tag: null, emoji: '⚡' },
  { id: '3', name: 'Movement Assessment', description: 'First session? Full-body screen and a personalized plan built for you.', duration_minutes: 45, price: 8000, tag: 'Start Here', emoji: '📋' }
];

export async function generateStaticParams() {
  return [{ slug: 'studio-eleven' }];
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  if (params.slug !== demo.slug) return notFound();
  return <BookingPage business={demo} services={services} />;
}

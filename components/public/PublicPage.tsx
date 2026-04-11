'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookingSheet } from '@/components/booking/BookingSheet';
import type {
  BusinessProfile,
  CredentialRecord,
  ProductRecord,
  ReviewRecord,
  ServiceRecord,
  SpecialismRecord
} from '@/types';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { getReviewBreakdown } from '@/lib/demo-data';
import { formatPrice } from '@/lib/utils/formatting';
import { HeroSection } from './HeroSection';
import { type PublicTab } from './TabBar';
import { AboutTab } from './tabs/AboutTab';
import { BookingsTab } from './tabs/BookingsTab';
import { ContactTab } from './tabs/ContactTab';
import { ProductsTab } from './tabs/ProductsTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { CartSheet } from './sheets/CartSheet';
import { ProductSheet } from './sheets/ProductSheet';

export function PublicPage({
  business,
  services,
  products,
  reviews,
  credentials,
  specialisms
}: {
  business: BusinessProfile;
  services: ServiceRecord[];
  products: ProductRecord[];
  reviews: ReviewRecord[];
  credentials: CredentialRecord[];
  specialisms: SpecialismRecord[];
}) {
  const [activeTab, setActiveTab] = useState<PublicTab>('bookings');
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const { items, total, count, addItem, clear, hasItem } = useCart();
  const { activeCategory, setActiveCategory, categories, filtered } = useProducts(products.filter((product) => product.is_active));
  const publishedReviews = useMemo(() => reviews.filter((review) => review.is_published), [reviews]);
  const averageRating = useMemo(
    () => publishedReviews.reduce((sum, review) => sum + review.rating, 0) / Math.max(publishedReviews.length, 1),
    [publishedReviews]
  );

  useEffect(() => {
    if (activeTab !== 'products') setCartOpen(false);
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-[430px] bg-[var(--bg)]">
        <HeroSection
          business={business}
          rating={averageRating}
          reviewCount={publishedReviews.length}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'bookings' ? <BookingsTab services={services} onSelect={setSelectedService} /> : null}
        {activeTab === 'products' ? (
          <ProductsTab
            products={filtered}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onOpen={setSelectedProduct}
            onAdd={addItem}
            inCart={hasItem}
          />
        ) : null}
        {activeTab === 'reviews' ? (
          <ReviewsTab business={business} reviews={reviews} breakdown={getReviewBreakdown()} onBook={() => setActiveTab('bookings')} />
        ) : null}
        {activeTab === 'about' ? (
          <AboutTab business={business} credentials={credentials} specialisms={specialisms} reviews={reviews} onBook={() => setActiveTab('bookings')} />
        ) : null}
        {activeTab === 'contact' ? <ContactTab business={business} /> : null}
      </div>

      <BookingSheet business={business} service={selectedService} onClose={() => setSelectedService(null)} />
      <ProductSheet
        product={selectedProduct}
        inCart={selectedProduct ? hasItem(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onAdd={addItem}
        onViewCart={() => {
          setSelectedProduct(null);
          setCartOpen(true);
        }}
      />
      <CartSheet
        open={cartOpen}
        items={items}
        total={total}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          clear();
        }}
      />

      <AnimatePresence>
        {activeTab === 'products' && count > 0 ? (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-5 left-1/2 z-40 flex w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2 items-center justify-between rounded-[16px] bg-[var(--void)] px-4 py-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.30)]"
          >
            <span className="flex items-center gap-3">
              <span className="rounded-full bg-[var(--gold)] px-2 py-1 text-xs font-semibold text-[var(--void)]">{count}</span>
              <span className="text-sm font-medium">{count} items</span>
            </span>
            <span className="text-sm font-semibold">{formatPrice(total)}</span>
            <span className="rounded-full bg-[var(--gold)] px-3 py-1.5 text-sm font-semibold text-[var(--void)]">Pay</span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

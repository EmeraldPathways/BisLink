'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookingSheet } from '@/components/booking/BookingSheet';
import { useIsMobile } from '@/hooks/useBreakpoint';
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
import { getReviewBreakdownFromReviews, getReviewSummaryFromReviews } from '@/lib/reviews';
import { formatPrice } from '@/lib/utils/formatting';
import { HeroSection } from './HeroSection';
import { TabBar, type PublicTab } from './TabBar';
import { AboutTab } from './tabs/AboutTab';
import { BookingsTab } from './tabs/BookingsTab';
import { ContactTab } from './tabs/ContactTab';
import { ProductsTab } from './tabs/ProductsTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { CartSheet } from './sheets/CartSheet';
import { ProductSheet } from './sheets/ProductSheet';

export function PublicPage({
  mode = 'default',
  business,
  services,
  products,
  reviews,
  credentials,
  specialisms
}: {
  mode?: 'default' | 'demo';
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
  const frameRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { items, total, count, addItem, clear, hasItem, getQuantity } = useCart();
  const { activeCategory, setActiveCategory, categories, filtered } = useProducts(products.filter((product) => product.is_active));
  const reviewSummary = useMemo(() => getReviewSummaryFromReviews(reviews), [reviews]);
  const presentation = mode === 'demo' && !isMobile ? 'demo' : 'default';

  useEffect(() => {
    if (activeTab !== 'products') setCartOpen(false);
  }, [activeTab]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--bg)]">
      <div
        ref={frameRef}
        className="relative mx-auto max-w-[430px] bg-[var(--bg)] pt-[max(env(safe-area-inset-top),1.5rem)]"
      >
        <HeroSection business={business} rating={reviewSummary.average} reviewCount={reviewSummary.publishedCount} />

        <div className="sticky top-0 z-30 bg-[linear-gradient(165deg,#0C0B09_0%,#1C1610_55%,#0F0D0B_100%)] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
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
              getQuantity={getQuantity}
            />
          ) : null}
          {activeTab === 'reviews' ? (
            <ReviewsTab business={business} reviews={reviews} breakdown={getReviewBreakdownFromReviews(reviews)} onBook={() => setActiveTab('bookings')} />
          ) : null}
          {activeTab === 'about' ? (
            <AboutTab business={business} credentials={credentials} specialisms={specialisms} reviews={reviews} onBook={() => setActiveTab('bookings')} />
          ) : null}
          {activeTab === 'contact' ? <ContactTab business={business} /> : null}
        </div>

        <BookingSheet
          business={business}
          service={selectedService}
          onClose={() => setSelectedService(null)}
          presentation={presentation}
          containerRef={frameRef}
        />
        <ProductSheet
          product={selectedProduct}
          inCart={selectedProduct ? hasItem(selectedProduct.id) : false}
          onClose={() => setSelectedProduct(null)}
          onAdd={addItem}
          onViewCart={() => {
            setSelectedProduct(null);
            setCartOpen(true);
          }}
          presentation={presentation}
          containerRef={frameRef}
        />
        <CartSheet
          open={cartOpen}
          business={business}
          items={items}
          total={total}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            clear();
          }}
          presentation={presentation}
          containerRef={frameRef}
        />

        <AnimatePresence>
          {activeTab === 'products' && count > 0 ? (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => setCartOpen(true)}
              className={`z-40 flex items-center justify-between rounded-[16px] bg-[var(--void)] px-4 py-4 text-white shadow-[0_8px_32px_rgba(0,0,0,0.30)] ${
                presentation === 'demo'
                  ? 'sticky bottom-4 mx-4 mt-4 w-[calc(100%-32px)]'
                  : 'fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-1/2 w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2'
              }`}
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
      </div>
    </main>
  );
}

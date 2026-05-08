'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BriefcaseBusiness, CalendarDays, MessageCircle, ShoppingBag, Star, User } from 'lucide-react';
import type {
  LinkEditorMode,
  MobileEditSection
} from '@/components/dashboard/link-editor-sections';
import { BookingSheet } from '@/components/booking/BookingSheet';
import { useIsMobile } from '@/hooks/useBreakpoint';
import type {
  BusinessProfile,
  CredentialRecord,
  PortfolioItemRecord,
  ProductRecord,
  ReviewRecord,
  ServiceRecord,
  SpecialismRecord
} from '@/types';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { applyBusinessBrandOverrides } from '@/lib/business-brand-overrides';
import { resolveBusinessTheme } from '@/lib/business-themes';
import { getReviewBreakdownFromReviews, getReviewSummaryFromReviews } from '@/lib/reviews';
import { formatPrice } from '@/lib/utils/formatting';
import { HeroSection } from './HeroSection';
import { MobileBottomNav } from './MobileBottomNav';
import { PortfolioSection } from './sections/PortfolioSection';
import { TrustStrip } from './sections/TrustStrip';
import { type PublicSectionId } from './TabBar';
import { CartSheet } from './sheets/CartSheet';
import { MoreSheet } from './sheets/MoreSheet';
import { ProductSheet } from './sheets/ProductSheet';
import { AboutTab } from './tabs/AboutTab';
import { BookingsTab } from './tabs/BookingsTab';
import { ContactTab } from './tabs/ContactTab';
import { ProductsTab } from './tabs/ProductsTab';
import { ReviewsTab } from './tabs/ReviewsTab';

type SectionDefinition = {
  id: PublicSectionId;
  label: string;
  icon: typeof CalendarDays;
};

function stackSections(items: Array<ReactNode | null | undefined>) {
  const visibleItems = items.filter(Boolean) as ReactNode[];

  return visibleItems.map((item, index) => (
    <div key={index} className={index === 0 ? '' : 'mt-4 border-t border-[var(--page-border)] pt-4'}>
      {item}
    </div>
  ));
}

export function PublicPage({
  mode = 'default',
  business,
  services,
  products,
  reviews,
  credentials,
  specialisms,
  portfolioItems,
  ownerPreview
}: {
  mode?: 'default' | 'demo';
  business: BusinessProfile;
  services: ServiceRecord[];
  products: ProductRecord[];
  reviews: ReviewRecord[];
  credentials: CredentialRecord[];
  specialisms: SpecialismRecord[];
  portfolioItems: PortfolioItemRecord[];
  ownerPreview?: {
    mode: LinkEditorMode;
    onEditSection: (section: MobileEditSection) => void;
  };
}) {
  const showAbout = Boolean(
    business.full_bio?.trim() ||
      business.years_experience ||
      (business.stat_one_label && business.stat_one_value) ||
      (business.stat_two_label && business.stat_two_value) ||
      (business.stat_three_label && business.stat_three_value) ||
      credentials.length ||
      specialisms.length
  );
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<PublicSectionId>('bookings');
  const frameRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { items, total, count, addItem, clear, hasItem, getQuantity } = useCart();
  const { activeCategory, setActiveCategory, categories, filtered } = useProducts(products.filter((product) => product.is_active));
  const reviewSummary = useMemo(() => getReviewSummaryFromReviews(reviews), [reviews]);
  const presentation = mode === 'demo' && !isMobile ? 'demo' : 'default';
  const showOwnerPreview = Boolean(ownerPreview && isMobile);
  const theme = useMemo(() => resolveBusinessTheme(business.theme_key), [business.theme_key]);
  const themeStyle = useMemo(
    () => applyBusinessBrandOverrides(theme.style as CSSProperties, business),
    [theme.style, business]
  );
  const publishedReviews = useMemo(() => reviews.filter((review) => review.is_published), [reviews]);
  const visiblePortfolioItems = useMemo(() => portfolioItems.filter((item) => item.is_active).slice(0, 6), [portfolioItems]);
  const showProducts = filtered.length > 0;
  const showPortfolio = visiblePortfolioItems.length > 0;
  const showTrust = reviewSummary.publishedCount > 0 && publishedReviews.length > 0;
  const showReviews = reviewSummary.publishedCount > 2;
  const sections = useMemo(
    () =>
      [
        services.length ? { id: 'bookings' as const, label: 'Book', icon: CalendarDays } : null,
        showPortfolio ? { id: 'portfolio' as const, label: 'Work', icon: BriefcaseBusiness } : null,
        showProducts ? { id: 'products' as const, label: 'Shop', icon: ShoppingBag } : null,
        showAbout ? { id: 'about' as const, label: 'About', icon: User } : null,
        showReviews ? { id: 'reviews' as const, label: 'Reviews', icon: Star } : null,
        { id: 'contact' as const, label: 'Contact', icon: MessageCircle }
      ].filter((section): section is SectionDefinition => section !== null),
    [services.length, showPortfolio, showProducts, showAbout, showReviews]
  );

  useEffect(() => {
    if (!sections.some((section) => section.id === activeSection)) {
      setActiveSection(sections[0]?.id ?? 'about');
    }
  }, [activeSection, sections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSection(visible.target.id as PublicSectionId);
        }
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.2, 0.35, 0.6]
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  function scrollToSection(id: PublicSectionId) {
    setMoreOpen(false);
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function scrollToHome() {
    setMoreOpen(false);
    setActiveSection(sections[0]?.id ?? 'contact');
    frameRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  const mobileActiveItem: 'home' | 'bookings' | 'products' | 'about' | 'more' =
    activeSection === 'portfolio' || activeSection === 'contact' || activeSection === 'reviews'
      ? 'more'
      : activeSection;

  const heroSection = (
    <HeroSection
      business={business}
      rating={reviewSummary.average}
      reviewCount={reviewSummary.publishedCount}
      announcementText={business.announcement_enabled ? business.announcement_text : null}
      onPrimaryAction={() => scrollToSection('bookings')}
    />
  );
  const bookingsSection = services.length ? (
    <BookingsTab id="bookings" services={services} onSelect={setSelectedService} />
  ) : null;
  const trustSection = showTrust ? (
    <TrustStrip business={business} reviews={publishedReviews} reviewSummary={reviewSummary} />
  ) : null;
  const portfolioSection = showPortfolio ? (
    <PortfolioSection id="portfolio" items={visiblePortfolioItems} />
  ) : null;
  const productsSection = showProducts ? (
    <ProductsTab
      id="products"
      business={business}
      products={filtered}
      categories={categories}
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
      onOpen={setSelectedProduct}
      onAdd={addItem}
      inCart={hasItem}
      getQuantity={getQuantity}
    />
  ) : null;
  const aboutSection = showAbout ? (
    <AboutTab
      id="about"
      business={business}
      credentials={credentials}
      specialisms={specialisms}
      reviews={reviews}
      onBook={() => scrollToSection('bookings')}
    />
  ) : null;
  const reviewsSection = showReviews ? (
    <ReviewsTab
      id="reviews"
      business={business}
      reviews={reviews}
      breakdown={getReviewBreakdownFromReviews(reviews)}
      onBook={() => scrollToSection('bookings')}
    />
  ) : null;
  const contactSection = <ContactTab id="contact" business={business} />;

  function wrapEditableRegion(
    section: MobileEditSection,
    label: string,
    content: ReactNode,
    placeholder?: ReactNode
  ) {
    const visibleContent = content ?? placeholder;

    if (!showOwnerPreview || !ownerPreview || !visibleContent) {
      return visibleContent;
    }

    return (
      <OwnerPreviewRegion
        label={label}
        onEdit={() => ownerPreview.onEditSection(section)}
      >
        {visibleContent}
      </OwnerPreviewRegion>
    );
  }

  const renderedHero = wrapEditableRegion(
    ownerPreview?.mode === 'theme' ? 'preset' : 'hero',
    ownerPreview?.mode === 'theme' ? 'Theme preset' : 'Hero',
    heroSection
  );

  const renderedLinkPortfolio = wrapEditableRegion(
    'portfolio',
    'Portfolio',
    portfolioSection
  );

  const renderedLinkAbout = wrapEditableRegion(
    'about',
    'About & Trust',
    trustSection,
    showAbout ? null : (
      <OwnerPreviewPlaceholder
        title="About & Trust"
        description="Tap to add your story, stats, and trust details."
      />
    )
  );

  const renderedThemeBody = wrapEditableRegion(
    'brand',
    'Brand styling',
    <div>{stackSections([bookingsSection, trustSection, portfolioSection, productsSection, aboutSection, reviewsSection, contactSection])}</div>
  );

  const renderedLinkFooter = showOwnerPreview && ownerPreview?.mode === 'link'
    ? wrapEditableRegion(
        'settings',
        'Link settings',
        <OwnerPreviewPlaceholder
          title="Link Settings"
          description="Tap to edit the slug, copy the link, or open the public page."
        />
      )
    : null;

  const renderedThemeFooter = showOwnerPreview && ownerPreview?.mode === 'theme'
    ? wrapEditableRegion(
        'save',
        'Save theme',
        <OwnerPreviewPlaceholder
          title="Save Theme"
          description="Tap to save your theme changes."
        />
      )
    : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--page-bg)]" data-theme={theme.key} style={themeStyle}>
      <div ref={frameRef} className="relative mx-auto w-full bg-[var(--page-bg)] pb-24 pt-[env(safe-area-inset-top)] md:max-w-[520px] md:pb-28 md:pt-[max(env(safe-area-inset-top),1.5rem)] lg:max-w-[560px]">
        {renderedHero}

        {ownerPreview?.mode === 'theme' ? (
          <>
            {renderedThemeBody}
            {renderedThemeFooter}
          </>
        ) : (
          <>
            {stackSections([
              bookingsSection,
              renderedLinkAbout,
              renderedLinkPortfolio,
              productsSection,
              wrapEditableRegion('about', 'About & Trust', aboutSection),
              reviewsSection,
              wrapEditableRegion('contact', 'Contact & Social', contactSection),
              renderedLinkFooter
            ])}
          </>
        )}

        <p className="mt-8 pb-6 text-center text-[11px] text-[var(--text-7)]">Powered by Your Business in a Link</p>

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
        <MoreSheet
          open={moreOpen}
          showPortfolio={showPortfolio}
          showContact={true}
          showReviews={showReviews}
          onClose={() => setMoreOpen(false)}
          onSelect={scrollToSection}
        />

        <AnimatePresence>
          {showProducts && count > 0 ? (
            <motion.button
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={() => setCartOpen(true)}
              className={`z-40 flex items-center justify-between rounded-[var(--button-radius)] bg-[var(--cta-bg)] px-4 py-4 text-[var(--cta-text)] shadow-[var(--panel-shadow)] ${
                presentation === 'demo'
                  ? 'sticky bottom-4 mx-4 mt-4 w-[calc(100%-32px)]'
                  : 'fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] inset-x-4 mx-auto w-auto max-w-[390px] md:bottom-[calc(env(safe-area-inset-bottom)+1rem)]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="rounded-full bg-[var(--cta-accent-bg)] px-2 py-1 text-xs font-semibold text-[var(--cta-accent-text)]">{count}</span>
                <span className="text-sm font-medium">{count} items</span>
              </span>
              <span className="text-sm font-semibold">{formatPrice(total)}</span>
              <span className="rounded-full bg-[var(--cta-accent-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--cta-accent-text)]">Pay</span>
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
      {showOwnerPreview ? null : (
        <>
          <MobileBottomNav
            activeItem={mobileActiveItem}
            onNavigate={(id) => {
              if (id === 'home') {
                scrollToHome();
                return;
              }

              scrollToSection(id);
            }}
            onMore={() => setMoreOpen(true)}
            canBook={services.length > 0}
            canShop={showProducts}
            canAbout={showAbout}
            viewport="mobile"
          />
          <MobileBottomNav
            activeItem={mobileActiveItem}
            onNavigate={(id) => {
              if (id === 'home') {
                scrollToHome();
                return;
              }

              scrollToSection(id);
            }}
            onMore={() => setMoreOpen(true)}
            canBook={services.length > 0}
            canShop={showProducts}
            canAbout={showAbout}
            viewport="desktop"
          />
        </>
      )}
    </main>
  );
}

function OwnerPreviewRegion({
  label,
  onEdit,
  children
}: {
  label: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="absolute inset-0 z-10 md:hidden"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white md:hidden">
        Edit {label}
      </div>
    </div>
  );
}

function OwnerPreviewPlaceholder({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-2 py-4">
      <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--page-card-bg)] px-4 py-5 shadow-[var(--card-shadow)]">
        <p className="font-display text-[22px] text-[var(--text-1)]">{title}</p>
        <p className="mt-2 text-sm text-[var(--text-3)]">{description}</p>
      </div>
    </div>
  );
}

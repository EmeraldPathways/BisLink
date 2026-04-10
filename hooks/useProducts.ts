'use client';

import { useMemo, useState } from 'react';
import type { ProductRecord } from '@/types';

export function useProducts(products: ProductRecord[]) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean) as string[]))],
    [products]
  );

  const filtered = useMemo(
    () => (activeCategory === 'All' ? products : products.filter((product) => product.category === activeCategory)),
    [activeCategory, products]
  );

  return { activeCategory, setActiveCategory, categories, filtered };
}

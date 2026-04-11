'use client';

import { useMemo, useState } from 'react';
import type { ProductRecord } from '@/types';

export type CartLine = {
  product: ProductRecord;
  qty: number;
};

export function useCart() {
  const [items, setItems] = useState<CartLine[]>([]);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  const addItem = (product: ProductRecord) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) => (item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...current, { product, qty: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) =>
      current
        .map((item) => (item.product.id === productId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const clear = () => setItems([]);
  const hasItem = (productId: string) => items.some((item) => item.product.id === productId);

  return { items, total, count, addItem, removeItem, clear, hasItem };
}

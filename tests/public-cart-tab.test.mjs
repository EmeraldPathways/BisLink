import test from 'node:test';
import assert from 'node:assert/strict';

test('shouldShowCartTab only returns true when products are visible and cart has items', async () => {
  const { shouldShowCartTab } = await import('../components/public/cart-tab-state.ts');

  assert.equal(shouldShowCartTab({ showProducts: true, count: 1 }), true);
  assert.equal(shouldShowCartTab({ showProducts: true, count: 0 }), false);
  assert.equal(shouldShowCartTab({ showProducts: false, count: 3 }), false);
});

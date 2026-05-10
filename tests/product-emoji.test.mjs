import test from 'node:test';
import assert from 'node:assert/strict';

test('getDefaultProductEmoji returns the dashboard fallback emoji', async () => {
  const { getDefaultProductEmoji } = await import('../lib/product-emoji.ts');

  assert.equal(getDefaultProductEmoji(), '📦');
});

import test from 'node:test';
import assert from 'node:assert/strict';

test('resolveEditSearchParam reads edit from promised search params', async () => {
  const { resolveEditSearchParam } = await import('../lib/dashboard-page-search.ts');

  const edit = await resolveEditSearchParam(Promise.resolve({ edit: 'prod_1' }));

  assert.equal(edit, 'prod_1');
});

test('resolveEditSearchParam reads edit from direct search params', async () => {
  const { resolveEditSearchParam } = await import('../lib/dashboard-page-search.ts');

  const edit = await resolveEditSearchParam({ edit: 'svc_1' });

  assert.equal(edit, 'svc_1');
});

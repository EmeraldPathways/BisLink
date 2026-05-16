import test from 'node:test';
import assert from 'node:assert/strict';
import { findRelevantHelpDocs, supportKnowledgeDocs } from '../../lib/agents/knowledge/help-docs.js';

test('support knowledge registry includes route and API implementation docs', () => {
  const ids = new Set(supportKnowledgeDocs.map((doc) => doc.id));

  assert.equal(ids.has('dashboard-services-route'), true);
  assert.equal(ids.has('api-bookings-failures'), true);
  assert.equal(ids.has('api-checkout-failures'), true);
});

test('findRelevantHelpDocs surfaces implementation-grounded booking failure docs', () => {
  const docs = findRelevantHelpDocs('Why does booking say slot blocked or business payments not configured?');
  const ids = docs.map((doc) => doc.id);

  assert.equal(ids.includes('api-bookings-failures'), true);
  assert.equal(ids.includes('payouts-stripe'), true);
});

test('findRelevantHelpDocs prefers Google Calendar connection guidance over availability for reconnect issues', () => {
  const docs = findRelevantHelpDocs('Hi, my calendar connection has stopped working');
  const ids = docs.map((doc) => doc.id);

  assert.equal(ids[0], 'google-calendar-connection');
});

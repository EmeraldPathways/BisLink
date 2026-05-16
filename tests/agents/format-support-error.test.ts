import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSupportError } from '../../lib/agents/format-support-error.js';

test('formatSupportError returns plain strings unchanged', () => {
  assert.equal(formatSupportError('Unauthorized'), 'Unauthorized');
});

test('formatSupportError extracts readable messages from zod flatten objects', () => {
  const value = {
    formErrors: ['Invalid request'],
    fieldErrors: {
      message: ['Required']
    }
  };

  assert.equal(formatSupportError(value), 'Invalid request');
});

test('formatSupportError falls back to first nested field error', () => {
  const value = {
    fieldErrors: {
      message: ['Required'],
      conversationId: ['Invalid UUID']
    }
  };

  assert.equal(formatSupportError(value), 'Required');
});

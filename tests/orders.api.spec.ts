import { test, expect } from '@playwright/test';

// Proves the real Express app + real ThirdPartyPaymentService + real ThirdPartyEmailService work together end-to-end — no stubs/fakes at this layer.
test('POST /orders succeeds with a valid item, quantity, and email', async ({ request }) => {
  const response = await request.post('/orders', {
    data: {
      itemId: 'widget-small',
      quantity: 2,
      email: 'test@example.com',
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.orderId).toMatch(/^order_\d+_[a-z0-9]+$/);
  expect(body.transactionId).toMatch(/^txn_\d+_[a-z0-9]+$/);
});


test('POST /orders returns 400 for an unknown itemId', async ({ request }) => {
  
  const response = await request.post('/orders', {
    data: {
      itemId: 'unknown-item',
      quantity: 1,
      email: 'test@example.com',
    },
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBe('Unknown itemId: unknown-item');
});
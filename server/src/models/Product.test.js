import test from 'node:test';
import assert from 'node:assert/strict';
import Product from './Product.js';

test('product schema supports a subscription type field', () => {
  const product = new Product({ name: 'Test Plan', slug: 'test-plan', monthlyPrice: 100 });
  assert.equal(product.subscriptionType, '');
});

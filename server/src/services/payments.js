/**
 * Provider-agnostic payment adapter.
 * Swap the mock for a real Pakistani aggregator (PayFast / Safepay / bSecure) —
 * they expose JazzCash, EasyPaisa and Visa/Mastercard behind one integration.
 */
const providers = {
  jazzcash: { label: 'JazzCash', kind: 'wallet' },
  easypaisa: { label: 'EasyPaisa', kind: 'wallet' },
<<<<<<< HEAD
=======
  nayapay: { label: 'NayaPay', kind: 'wallet' },
  ubl: { label: 'UBL Bank', kind: 'bank' },
  mcb: { label: 'MCB Bank', kind: 'bank' },
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
  card: { label: 'Visa / Mastercard', kind: 'card' }
};

export const isSupported = (method) => Boolean(providers[method]);

/** Create a payment intent — real gateways return a redirect/checkout URL here. */
export const createIntent = async ({ method, amount, reference }) => {
  if (!isSupported(method)) throw Object.assign(new Error('Unsupported payment method'), { status: 422 });
  return {
    provider: providers[method].label,
    reference,
    amount,
    redirectUrl: null,           // gateway checkout URL in production
    intentId: 'intent_' + reference
  };
};

/** Verify a gateway callback. Replace with signature verification from your provider. */
export const verifyPayment = async ({ intentId, providerRef }) => ({
  success: true,
  paymentRef: providerRef || intentId || 'mock_' + Date.now().toString(36)
});

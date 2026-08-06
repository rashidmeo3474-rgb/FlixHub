const providers = {
  jazzcash: { label: 'JazzCash', kind: 'wallet' },
  easypaisa: { label: 'EasyPaisa', kind: 'wallet' },
  nayapay: { label: 'NayaPay', kind: 'wallet' },
  ubl: { label: 'UBL Bank', kind: 'bank' },
  mcb: { label: 'MCB Bank', kind: 'bank' },
  card: { label: 'Visa / Mastercard', kind: 'card' }
};

export const isSupported = (method) => Boolean(providers[method]);

export const createIntent = async ({ method, amount, reference }) => {
  if (!isSupported(method)) throw Object.assign(new Error('Unsupported payment method'), { status: 422 });
  return {
    provider: providers[method].label,
    reference,
    amount,
    redirectUrl: null,
    intentId: 'intent_' + reference
  };
};

export const verifyPayment = async ({ intentId, providerRef }) => ({
  success: true,
  paymentRef: providerRef || intentId || 'mock_' + Date.now().toString(36)
});

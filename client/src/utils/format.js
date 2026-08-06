export const money = (value, currency = 'Rs') =>
  `${currency} ${Number(value || 0).toLocaleString('en-US')}`;

export const monthsLabel = (months, t) =>
  `${months} ${months === 1 ? t('month') : t('months')}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

export const DURATIONS = [1, 3, 6, 12];
export const MULTIPLIERS = { 1: 1, 3: 2.7, 6: 5, 12: 9 };
export const priceFor = (monthly, months) => Math.round(monthly * (MULTIPLIERS[months] ?? months));

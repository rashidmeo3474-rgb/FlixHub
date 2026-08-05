import { useMemo, useState } from 'react';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'uhd', label: '4K UHD' },
  { key: 'eightk', label: '8K UHD' },
  { key: 'hd', label: '1080p HD' },
  { key: 'bundle', label: 'Bundles' }
];

export default function Shop() {
  const { t } = useI18n();
  const { data, loading, error } = useApi('/products');
  const [filter, setFilter] = useState('all');

  const products = useMemo(() => {
    const list = data?.products || [];
    if (filter === 'uhd') return list.filter((p) => /4k/i.test(p.quality));
    if (filter === 'eightk') return list.filter((p) => /8k/i.test(p.quality));
    if (filter === 'hd') return list.filter((p) => /1080/.test(p.quality));
    if (filter === 'bundle') return list.filter((p) => p.category === 'bundle');
    return list;
  }, [data, filter]);

  return (
    <section className="wrap section">
      <h1 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)' }}>{t('shop')}</h1>
      <p className="muted" style={{ marginTop: 10, fontSize: 16 }}>{t('shopSub')}</p>

      <div className="row" style={{ margin: '24px 0 22px' }}>
        {FILTERS.map((f) => (
          <button key={f.key} className={filter === f.key ? 'chip active' : 'chip'} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="muted">{t('loading')}</p>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-4">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

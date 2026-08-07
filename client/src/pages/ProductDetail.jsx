import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel, DURATIONS, priceFor } from '../utils/format.js';

const DETAIL_LOGOS = {
  'netflix':        '/logos/netflix.jpg',
  'netflix-480p':   '/logos/netflix.jpg',
  'netflix-720p':   '/logos/netflix.jpg',
  'netflix-4k':     '/logos/netflix.jpg',
  'netflix-8k':     '/logos/netflix.jpg',
  'apple-tv':       '/logos/apple-tv.png',
  'apple-tv-1080p': '/logos/apple-tv.png',
  'apple-tv-8k':    '/logos/apple-tv.png',
  'hbo-max':        '/logos/hbo-max.png',
  'hbo-480p':       '/logos/hbo-max.png',
  'hbo-720p':       '/logos/hbo-max.png',
  'hbo-4k':         '/logos/hbo-max.png',
  'hbo-8k':         '/logos/hbo-max.png',
  'netflix-prime':  '/logos/netflix-prime.jpg',
};

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t } = useI18n();
  const { data, loading, error } = useApi(`/products/${slug}`);
  const [months, setMonths] = useState(1);

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (error)   return <div className="wrap section"><div className="alert alert-error">{error}</div></div>;

  const product = data.product;
  const total   = product.prices?.[months] ?? priceFor(product.monthlyPrice, months);
  const out     = product.inStock === 0;
  const logo    = DETAIL_LOGOS[product.slug] || product.logo || null;

  const item = {
    productId: product._id, slug: product.slug, name: product.name,
    quality: product.quality, accent: product.accent, logo: product.logo,
    months, price: total
  };

  return (
    <section className="wrap section">
      <Link className="btn btn-ghost btn-sm" to="/shop">← {t('back')}</Link>

      <div className="grid grid-2" style={{ marginTop: 22, alignItems: 'start' }}>
        <div className="card">
          <div className="logo-tile" style={{ height: 300, background: `linear-gradient(135deg, ${product.accent}33, oklch(0.22 0.02 265))`, overflow: 'hidden', borderRadius: 12 }}>
            {logo
              ? <img src={logo} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
              : <span className="fallback" style={{ fontSize: 28 }}>{product.name}</span>}
          </div>
        </div>

        <div className="stack">
          <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{product.name}</h1>
          <div className="row" style={{ gap: 8 }}>
            <span className="badge" style={{ background: 'var(--accent)', color: 'var(--bg)' }}>{product.quality}</span>
            <span className="badge" style={{ background: 'oklch(1 0 0 / 0.08)' }}>{t('warranty')}</span>
            <span className={out ? 'badge badge-bad' : 'badge badge-good'}>
              {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
            </span>
          </div>

          <div className="field">
            <span className="label">{t('duration')}</span>
            {/* 1–6 month selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {DURATIONS.map((m) => (
                <button key={m}
                  className={months === m ? 'duration active' : 'duration'}
                  onClick={() => setMonths(m)}>
                  <strong>{m}</strong>
                  <span>{m === 1 ? t('month') : t('months')}</span>
                  <span style={{ fontSize: 11, marginTop: 2 }}>
                    {money(product.prices?.[m] ?? priceFor(product.monthlyPrice, m))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card spread">
            <div>
              <span className="label">{t('total')}</span>
              <div className="price price-lg" style={{ color: product.accent }}>{money(total)}</div>
              {months > 1 && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  {money(product.monthlyPrice)} × {months} months
                </div>
              )}
            </div>
            <span className="muted" style={{ fontSize: 13, maxWidth: 190, textAlign: 'end' }}>{t('heroSub')}</span>
          </div>

          <div className="row">
            <button className="btn btn-ghost" disabled={out} onClick={() => { add(item); navigate('/cart'); }}>
              {t('addToCart')}
            </button>
            <button className="btn" disabled={out} onClick={() => { add(item); navigate('/checkout'); }}>
              {t('buyNow')} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

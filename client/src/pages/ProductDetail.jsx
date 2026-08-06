import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel, DURATIONS, priceFor } from '../utils/format.js';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { t } = useI18n();
  const { data, loading, error } = useApi(`/products/${slug}`);
  const [months, setMonths] = useState(1);

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (error) return <div className="wrap section"><div className="alert alert-error">{error}</div></div>;

  const product = data.product;
  const total = product.prices?.[months] ?? priceFor(product.monthlyPrice, months);
  const out = product.inStock === 0;

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
          <div className="logo-tile" style={{ height: 300, background: `linear-gradient(135deg, ${product.accent}33, oklch(0.22 0.02 265))` }}>
            {product.logo ? <img src={product.logo} alt={product.name} /> : <span className="fallback" style={{ fontSize: 28 }}>{product.name}</span>}
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
            <div className="duration-grid">
              {DURATIONS.map((m) => (
                <button key={m} className={months === m ? 'duration active' : 'duration'} onClick={() => setMonths(m)}>
                  <strong>{monthsLabel(m, t)}</strong>
                  <span>{money(product.prices?.[m] ?? priceFor(product.monthlyPrice, m))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card spread">
            <div>
              <span className="label">{t('total')}</span>
              <div className="price price-lg" style={{ color: product.accent }}>{money(total)}</div>
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

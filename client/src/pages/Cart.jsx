import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel } from '../utils/format.js';

export default function Cart() {
  const { items, remove, total } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <section className="wrap-sm section">
      <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{t('cart')}</h1>

      {items.length === 0 ? (
        <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: 40 }}>
          <p className="muted" style={{ marginBottom: 20 }}>{t('emptyCart')}</p>
          <Link className="btn" to="/shop">{t('shop')}</Link>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: 24 }}>
          {items.map((item, index) => (
            <div className="card row cart-item-row" key={`${item.productId}-${index}`} style={{ gap: 16 }}>
              <div className="logo-tile cart-logo-tile" style={{ width: 64, height: 64, flex: 'none', background: `linear-gradient(135deg, ${item.accent}33, oklch(0.22 0.02 265))` }}>
                {item.logo ? <img src={item.logo} alt="" /> : <span className="fallback" style={{ fontSize: 11 }}>{item.name}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <strong style={{ fontSize: 15.5 }}>{item.name}</strong>
                <div className="muted" style={{ fontSize: 13 }}>{monthsLabel(item.months, t)} · {item.quality}</div>
              </div>
              <span className="price" style={{ fontSize: 19 }}>{money(item.price)}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(index)} aria-label="Remove">✕</button>
            </div>
          ))}

          <div className="card spread">
            <div>
              <span className="label">{t('total')}</span>
              <div className="price price-lg">{money(total)}</div>
            </div>
            <button className="btn" onClick={() => navigate('/checkout')}>{t('checkout')} →</button>
          </div>
        </div>
      )}
    </section>
  );
}

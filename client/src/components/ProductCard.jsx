import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { t } = useI18n();
  const out = product.inStock === 0;

  return (
    <article className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 13, borderImage: 'none' }}>
      <div className="logo-tile" style={{ background: `linear-gradient(135deg, ${product.accent}33, oklch(0.22 0.02 265))` }}>
        {product.logo
          ? <img src={product.logo} alt={product.name} />
          : <span className="fallback">{product.name}</span>}
        <span className="badge badge-quality">{product.quality}</span>
      </div>

      <div className="spread" style={{ gap: 8 }}>
        <strong style={{ fontSize: 15.5 }}>{product.name}</strong>
        <span className={out ? 'badge badge-bad' : 'badge badge-good'}>
          {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
        </span>
      </div>

      <div className="row" style={{ gap: 6, alignItems: 'baseline', marginTop: 'auto' }}>
        <span className="price" style={{ color: product.accent }}>{money(product.monthlyPrice)}</span>
        {product.compareAt > 0 && <span className="strike">{money(product.compareAt)}</span>}
      </div>

      <Link className="btn" to={`/product/${product.slug}`} style={{ textAlign: 'center', padding: '11px', fontSize: 14 }}>
        {t('viewPlan')}
      </Link>
    </article>
  );
}

import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';
import { useRef, useEffect, useState } from 'react';

export default function ProductCard({ product, index = 0 }) {
  const { t } = useI18n();
  const out = product.inStock === 0;
  const cardRef = useRef(null);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.animationDelay = `${(index % 4) * 0.55}s`;
  }, [index]);

  function handleMouseMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18;
    card.style.setProperty('--rx', `${y}deg`);
    card.style.setProperty('--ry', `${x}deg`);
    card.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    card.classList.add('pcard--tilting');
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.classList.remove('pcard--tilting');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }

  function handleClick(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  }

  return (
    <article
      ref={cardRef}
      className="pcard"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        '--accent': product.accent || '#54d6e8',
        '--rx': '0deg', '--ry': '0deg',
        '--mx': '50%',  '--my': '50%',
      }}
    >
      {/* animated color border ring */}
      <div className="pcard-ring" />

      {/* mouse spotlight */}
      <div className="pcard-glare" />

      {/* click ripples */}
      {ripples.map(r => (
        <span key={r.id} className="pcard-ripple" style={{ left: r.x, top: r.y }} />
      ))}

      {/* ── BRAND IMAGE HEADER ── */}
      <div className="pcard-hero">
        {product.logo
          ? <img src={product.logo} alt={product.name} className="pcard-hero-img" />
          : null}

        {/* dark gradient over image so text readable */}
        <div className="pcard-hero-overlay" />

        {/* floating particles */}
        <div className="pcard-particles" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <span key={i} className={`pcard-dot pcard-dot-${i}`}
              style={{ background: product.accent || '#54d6e8' }} />
          ))}
        </div>
      </div>

      {/* ── CARD BODY ── */}
      <div className="pcard-body">
        <div className="pcard-info">
          <strong className="pcard-name">{product.name}</strong>
          <span className={out ? 'badge badge-bad' : 'badge badge-good'}>
            {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
          </span>
        </div>

        <div className="pcard-price">
          <span className="pcard-amount" style={{ color: product.accent || 'var(--accent)' }}>
            {money(product.monthlyPrice)}
          </span>
          {product.compareAt > 0 && <span className="strike">{money(product.compareAt)}</span>}
        </div>

        <Link className="pcard-btn" to={`/product/${product.slug}`}>
          {t('viewPlan')}
        </Link>
      </div>
    </article>
  );
}

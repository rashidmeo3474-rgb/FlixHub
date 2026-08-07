import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';
import { useRef, useEffect, useState } from 'react';

/* ── Per-product logo map (local public/logos/) ── */
const LOGOS = {
  'netflix':        '/logos/netflix.png',
  'netflix-480p':   '/logos/netflix.png',
  'netflix-720p':   '/logos/netflix.png',
  'netflix-4k':     '/logos/netflix.png',
  'netflix-8k':     '/logos/netflix.png',
  'hbo-max':        '/logos/hbo-max.png',
  'hbo-480p':       '/logos/hbo-max.png',
  'hbo-720p':       '/logos/hbo-max.png',
  'hbo-4k':         '/logos/hbo-max.png',
  'hbo-8k':         '/logos/hbo-max.png',
};

/* ── Per-product theme: color, particle style, animation speed ── */
const THEMES = {
  'netflix':      { accent: '#e50914', particle: '★', label: 'Action · Drama',    speed: 3.2, shimmerColor: 'rgba(229,9,20,0.25)' },
  'prime-video':  { accent: '#00a8e1', particle: '⬡', label: 'Adventure · Sci-Fi', speed: 4.0, shimmerColor: 'rgba(0,168,225,0.25)' },
  'disney':       { accent: '#4b6cf7', particle: '✦', label: 'Fantasy · Family',   speed: 3.6, shimmerColor: 'rgba(75,108,247,0.25)' },
  'apple-tv':     { accent: '#d8d8d8', particle: '◆', label: 'Premium · Thriller', speed: 4.4, shimmerColor: 'rgba(216,216,216,0.18)' },
  'netflix-prime':{ accent: '#ff6b00', particle: '⬟', label: 'Best Bundle',        speed: 2.8, shimmerColor: 'rgba(255,107,0,0.28)' },
  'hbo-max':      { accent: '#9b30ff', particle: '✧', label: 'Dark · History',     speed: 3.8, shimmerColor: 'rgba(155,48,255,0.25)' },
};

const getTheme = (slug) => THEMES[slug] || { accent: '#54d6e8', particle: '•', label: '', speed: 4, shimmerColor: 'rgba(84,214,232,0.2)' };

export default function ProductCard({ product, index = 0 }) {
  const { t } = useI18n();
  const out = product.inStock === 0;
  const cardRef = useRef(null);
  const [ripples, setRipples] = useState([]);
  const theme = getTheme(product.slug);
  const accent = product.accent || theme.accent;
  const logo = LOGOS[product.slug] || product.logo || null;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.animationDelay = `${(index % 4) * 0.55}s`;
    card.style.animationDuration = `${theme.speed}s`;
  }, [index, theme.speed]);

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
        '--accent': accent,
        '--rx': '0deg', '--ry': '0deg',
        '--mx': '50%',  '--my': '50%',
        '--shimmer-color': theme.shimmerColor,
      }}
    >
      {/* spinning accent border ring */}
      <div className="pcard-ring" />

      {/* mouse spotlight */}
      <div className="pcard-glare" />

      {/* click ripples */}
      {ripples.map(r => (
        <span key={r.id} className="pcard-ripple" style={{ left: r.x, top: r.y }} />
      ))}

      {/* ── HERO IMAGE AREA ── */}
      <div className="pcard-hero" style={logo ? {
        backgroundImage: `url(${logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      } : {}}>
        {!logo && null}

        {/* genre label bottom-left */}
        {theme.label && (
          <span style={{
            position: 'absolute', bottom: 10, left: 12, zIndex: 4,
            fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: accent, opacity: 0.85,
            textShadow: `0 0 8px ${accent}`,
          }}>{theme.label}</span>
        )}

        <div className="pcard-hero-overlay" />

        {/* floating accent particles — themed symbol */}
        <div className="pcard-particles" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <span key={i} className={`pcard-dot pcard-dot-${i}`}
              style={{
                background: 'transparent',
                color: accent,
                fontSize: i === 0 ? 10 : i === 1 ? 8 : 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textShadow: `0 0 6px ${accent}`,
              }}>
              {theme.particle}
            </span>
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
          <span className="pcard-amount" style={product.slug === 'netflix-prime' ? {
              background: 'linear-gradient(90deg, #e50914, #00a8e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : { color: accent }}>
            {money(product.monthlyPrice)}
          </span>
          {product.compareAt > 0 && <span className="strike">{money(product.compareAt)}</span>}
        </div>

        <Link className="pcard-btn" to={`/product/${product.slug}`}
          style={product.slug === 'netflix-prime' ? {
            background: 'linear-gradient(135deg, #e50914 0%, #6b0ac9 50%, #00a8e1 100%)',
          } : {
            background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
          }}>
          {t('viewPlan')}
        </Link>
      </div>
    </article>
  );
}

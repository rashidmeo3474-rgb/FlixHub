import { useMemo, useState } from 'react';
import useApi from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, priceFor } from '../utils/format.js';
import LoginGateModal from '../components/LoginGateModal.jsx';

const RESOLUTION_TABS = [
  { key: 'all',    label: 'All' },
  { key: '480p',   label: '480p SD' },
  { key: '720p',   label: '720p HD' },
  { key: '1080p',  label: '1080p HD' },
  { key: '4k',     label: '4K UHD' },
  { key: '8k',     label: '8K UHD' },
  { key: 'bundle', label: 'Bundles' },
];

const DURATIONS = [1, 2, 3, 4, 5, 6];

const matchRes = (quality, key) => {
  if (key === '480p')  return /480p/i.test(quality);
  if (key === '720p')  return /720p/i.test(quality);
  if (key === '1080p') return /1080p/i.test(quality);
  if (key === '4k')    return /4K/i.test(quality);
  if (key === '8k')    return /8K/i.test(quality);
  return false;
};

const SHOP_LOGOS = {
  'netflix':        '/logos/netflix.jpg',
  'netflix-480p':   '/logos/netflix.jpg',
  'netflix-720p':   '/logos/netflix.jpg',
  'netflix-4k':     '/logos/netflix.jpg',
  'netflix-8k':     '/logos/netflix.jpg',
  'prime-video':    '/logos/prime-video.png',
  'prime-480p':     '/logos/prime-video.png',
  'prime-720p':     '/logos/prime-video.png',
  'prime-4k':       '/logos/prime-video.png',
  'apple-tv':       '/logos/apple-tv.png',
  'apple-tv-1080p': '/logos/apple-tv.png',
  'apple-tv-8k':    '/logos/apple-tv.png',
  'hbo-max':        '/logos/hbo-max.png',
  'hbo-480p':       '/logos/hbo-max.png',
  'hbo-720p':       '/logos/hbo-max.png',
  'hbo-4k':         '/logos/hbo-max.png',
  'hbo-8k':         '/logos/hbo-max.png',
  'netflix-prime':  '/logos/netflix-prime-new.jpg',
};

/* ─────────────────────────────────────────────────────────────
   SHOP CARD — spinning neon border ring
───────────────────────────────────────────────────────────── */
function ShopCard({ product, months, onGuestClick }) {
  const { t }   = useI18n();
  const out     = product.inStock === 0;
  const logo    = SHOP_LOGOS[product.slug] || product.logo || null;
  const price   = product.prices?.[months] ?? priceFor(product.monthlyPrice, months);
  const accent  = product.accent || '#54d6e8';
  // second colour for the spinning ring
  const ring2   = product.category === 'bundle' ? '#ff6b00'
                : product.slug?.includes('netflix') ? '#e50914'
                : product.slug?.includes('prime')   ? '#00a8e1'
                : product.slug?.includes('disney')  ? '#4b6cf7'
                : product.slug?.includes('hbo')     ? '#9b30ff'
                : product.slug?.includes('apple')   ? '#c0c0c0'
                : '#9D00FF';

  return (
    /* ── spinning border ring wrapper ── */
    <div
      style={{
        position: 'relative',
        borderRadius: 18,
        padding: 2,
        background: `conic-gradient(from var(--spin-angle), ${accent}, ${ring2}, #00F0FF, ${ring2}, ${accent})`,
        animation: 'spin-border 3.5s linear infinite',
        boxShadow: `0 0 16px ${accent}44, 0 0 32px ${accent}18`,
        transition: 'box-shadow 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 0 28px ${accent}88, 0 0 56px ${accent}30`;
        e.currentTarget.style.animationDuration = '1.2s';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 0 16px ${accent}44, 0 0 32px ${accent}18`;
        e.currentTarget.style.animationDuration = '3.5s';
      }}
    >
      {/* ── inner card ── */}
      <article style={{
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'oklch(0.11 0.014 265)',
        height: '100%',
      }}>

        {/* logo / hero area */}
        <div style={{
          height: 155,
          display: 'grid', placeItems: 'center',
          background: `linear-gradient(135deg, ${accent}1a, oklch(0.08 0.012 265))`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* inner ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${accent}15 0%, transparent 70%)`,
            animation: 'glow-pulse 2.5s ease-in-out infinite',
          }} />
          {logo
            ? <img src={logo} alt={product.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: product.slug === 'netflix-prime' ? 'contain' : 'cover',
                  objectPosition: 'center',
                  padding: product.slug === 'netflix-prime' ? '22px' : '0',
                  filter: 'drop-shadow(0 4px 12px oklch(0 0 0 / 0.55))',
                  position: 'relative', zIndex: 1,
                }} />
            : <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800,
                fontSize: 17, color: accent, position: 'relative', zIndex: 1 }}>
                {product.name}
              </span>
          }
        </div>

        {/* body */}
        <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>

          {/* name + quality + stock */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14 }}>
                {product.name}
              </div>
              <div style={{ fontSize: 11, color: accent, fontWeight: 700, marginTop: 2 }}>
                {product.quality}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 5, flexShrink: 0,
              background: out ? 'oklch(0.65 0.22 25 / 0.18)' : 'oklch(0.72 0.16 150 / 0.18)',
              color: out ? 'var(--bad)' : 'var(--good)',
            }}>
              {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
            </span>
          </div>

          {/* price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: accent,
            }}>{money(price)}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {months === 1 ? `/ ${t('month')}` : `/ ${months} ${t('months')}`}
            </span>
          </div>

          {months > 1 && (
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {money(product.monthlyPrice)} × {months} = {money(price)}
            </div>
          )}

          {product.compareAt > 0 && (
            <div style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>
              Market rate: {money(product.compareAt * months)}
            </div>
          )}

          {/* CTA button */}
          <a
            href={`/product/${product.slug}`}
            onClick={onGuestClick ? e => { e.preventDefault(); onGuestClick(); } : undefined}
            style={{
              display: 'block', textAlign: 'center', marginTop: 'auto',
              padding: '10px 14px', borderRadius: 10, fontWeight: 800,
              fontSize: 13.5, textDecoration: 'none',
              background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
              color: '#000',
              transition: 'filter 0.18s ease, transform 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.18)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)';    e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {t('viewPlan')}
          </a>
        </div>
      </article>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHOP PAGE
───────────────────────────────────────────────────────────── */
export default function Shop() {
  const { t }    = useI18n();
  const { user } = useAuth();
  const { data, loading, error } = useApi('/products');

  const [tab,          setTab]          = useState('all');
  const [months,       setMonths]       = useState(1);
  const [gateProduct,  setGateProduct]  = useState(null);

  const products = useMemo(() => {
    const list = data?.products || [];
    if (tab === 'bundle') return list.filter(p => p.category === 'bundle');
    if (tab === 'all')    return list;
    return list.filter(p => matchRes(p.quality, tab));
  }, [data, tab]);

  const handleGuestClick = (product) => {
    if (!user) setGateProduct(product);
  };

  return (
    <section className="wrap section">

      {/* Login gate modal */}
      {gateProduct && !user && (
        <LoginGateModal
          product={gateProduct}
          onClose={() => setGateProduct(null)}
        />
      )}

      <h1 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)' }}>{t('shop')}</h1>
      <p className="muted" style={{ marginTop: 8, fontSize: 15 }}>{t('shopSub')}</p>

      {/* ── Resolution filter tabs ── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '22px 0 0' }}>
        {RESOLUTION_TABS.map((f, i) => {
          const isActive  = tab === f.key;
          const isBundle  = f.key === 'bundle';

          /* per-tab accent colors */
          const tabColor =
            f.key === 'all'    ? '#00F0FF' :
            f.key === '480p'   ? '#a0b9e6' :
            f.key === '720p'   ? '#00F0FF' :
            f.key === '1080p'  ? '#00FF87' :
            f.key === '4k'     ? '#C084FF' :
            f.key === '8k'     ? '#FFD600' :
            /* bundle */         '#ff6b00';

          return (
            <button
              key={f.key}
              onClick={() => setTab(f.key)}
              className="shop-tab-btn"
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: 13.5,
                border: isActive
                  ? `2px solid ${tabColor}`
                  : '2px solid rgba(255,255,255,0.10)',
                background: isActive
                  ? `linear-gradient(135deg, ${tabColor}22, ${tabColor}0a)`
                  : 'rgba(255,255,255,0.04)',
                color: isActive ? tabColor : 'var(--muted)',
                boxShadow: isActive
                  ? `0 0 14px ${tabColor}66, 0 0 28px ${tabColor}22`
                  : 'none',
                animation: isBundle
                  ? `bundle-float ${2.2 + i * 0.1}s ease-in-out infinite`
                  : isActive
                    ? 'chip-float 2s ease-in-out infinite, chip-glow 2s ease-in-out infinite'
                    : `chip-float ${2.4 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
                position: 'relative',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = `2px solid ${tabColor}`;
                e.currentTarget.style.color  = tabColor;
                e.currentTarget.style.background = `linear-gradient(135deg, ${tabColor}22, ${tabColor}0a)`;
                e.currentTarget.style.boxShadow = `0 0 16px ${tabColor}55`;
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.border = '2px solid rgba(255,255,255,0.10)';
                  e.currentTarget.style.color  = 'var(--muted)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* ── Duration selector ── */}
      <div style={{
        margin: '18px 0 26px',
        background: 'rgba(10,14,26,0.90)',
        border: '1px solid rgba(0,240,255,0.12)',
        borderRadius: 16, padding: '18px 22px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 24px rgba(0,240,255,0.06)',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 800, color: 'rgba(0,240,255,0.60)',
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Duration
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="shop-duration-row">
          {DURATIONS.map((m, i) => {
            const isActive = months === m;
            return (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className="shop-duration-btn"
                style={{
                  padding: '10px 18px',
                  borderRadius: 11,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  fontSize: 13.5,
                  position: 'relative',
                  overflow: 'hidden',
                  border: isActive
                    ? '1.5px solid #00F0FF'
                    : '1.5px solid rgba(255,255,255,0.10)',
                  background: isActive
                    ? 'rgba(0,240,255,0.10)'
                    : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#00F0FF' : 'var(--muted)',
                  boxShadow: isActive
                    ? '0 0 16px rgba(0,240,255,0.50), 0 0 32px rgba(0,240,255,0.20), inset 0 0 14px rgba(0,240,255,0.08)'
                    : 'none',
                  animation: isActive
                    ? 'chip-float 2s ease-in-out infinite'
                    : `chip-float ${2.2 + i * 0.15}s ease-in-out infinite`,
                  animationDelay: `${i * 0.12}s`,
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.border = '1.5px solid rgba(0,240,255,0.50)';
                    e.currentTarget.style.color  = '#00F0FF';
                    e.currentTarget.style.background = 'rgba(0,240,255,0.07)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(0,240,255,0.30)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.10)';
                    e.currentTarget.style.color  = 'var(--muted)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* shimmer sweep on active */}
                {isActive && (
                  <span style={{
                    position: 'absolute', top: 0, left: '-80%',
                    width: '50%', height: '100%',
                    background: 'linear-gradient(105deg, transparent 35%, rgba(0,240,255,0.25) 50%, transparent 65%)',
                    animation: 'dur-shimmer 2.5s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                )}
                {m} {m === 1 ? t('month') : t('months')}
              </button>
            );
          })}
        </div>
        {months > 1 && (
          <span style={{
            fontSize: 12, color: '#00FF87', fontWeight: 700,
            marginLeft: 'auto',
            textShadow: '0 0 10px rgba(0,255,135,0.50)',
          }}>
            Total = Monthly Rate × {months}
          </span>
        )}
      </div>

      {loading && (
        /* skeleton grid while loading */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{
              borderRadius: 18, height: 310,
              background: 'oklch(0.13 0.014 265 / 0.97)',
              animation: 'skeletonPulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Product grid ── */}
      {!loading && !error && (
        <>
          {products.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: 40 }}>
              No products found for this filter.
            </p>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 18,
          }}>
            {products.map(p => (
              <ShopCard
                key={p._id}
                product={p}
                months={months}
                onGuestClick={!user ? () => handleGuestClick(p) : null}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

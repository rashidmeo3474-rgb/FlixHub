import { useMemo, useState, useEffect } from 'react';
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
   SHOP CARD — spinning neon border ring (responsive)
───────────────────────────────────────────────────────────── */
function ShopCard({ product, months, onGuestClick, isMobile = false }) {
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
        borderRadius: isMobile ? 16 : 18,
        padding: isMobile ? 1.5 : 2,
        background: `conic-gradient(from var(--spin-angle), ${accent}, ${ring2}, #00F0FF, ${ring2}, ${accent})`,
        animation: isMobile ? 'spin-border 4.5s linear infinite' : 'spin-border 3.5s linear infinite',
        boxShadow: `0 0 ${isMobile ? 12 : 16}px ${accent}44, 0 0 ${isMobile ? 24 : 32}px ${accent}18`,
        transition: 'box-shadow 0.25s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!isMobile) {
          e.currentTarget.style.boxShadow = `0 0 28px ${accent}88, 0 0 56px ${accent}30`;
          e.currentTarget.style.animationDuration = '1.2s';
        }
      }}
      onMouseLeave={e => {
        if (!isMobile) {
          e.currentTarget.style.boxShadow = `0 0 16px ${accent}44, 0 0 32px ${accent}18`;
          e.currentTarget.style.animationDuration = '3.5s';
        }
      }}
    >
      {/* ── inner card ── */}
      <article style={{
        borderRadius: isMobile ? 14 : 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'oklch(0.11 0.014 265)',
        height: '100%',
        minHeight: isMobile ? '280px' : '310px',
      }}>

        {/* logo / hero area */}
        <div style={{
          height: isMobile ? 120 : 155,
          display: 'grid', 
          placeItems: 'center',
          background: `linear-gradient(135deg, ${accent}1a, oklch(0.08 0.012 265))`,
          position: 'relative', 
          overflow: 'hidden',
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
                  padding: product.slug === 'netflix-prime' ? (isMobile ? '16px' : '22px') : '0',
                  filter: 'drop-shadow(0 4px 12px oklch(0 0 0 / 0.55))',
                  position: 'relative', zIndex: 1,
                }} />
            : <span style={{ 
                fontFamily: "'Space Grotesk',sans-serif", 
                fontWeight: 800,
                fontSize: isMobile ? 15 : 17, 
                color: accent, 
                position: 'relative', 
                zIndex: 1,
                textAlign: 'center',
                padding: '0 8px',
              }}>
                {product.name}
              </span>
          }
        </div>

        {/* body */}
        <div style={{ 
          padding: isMobile ? '10px 12px 12px' : '12px 14px 14px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? 6 : 8, 
          flex: 1 
        }}>

          {/* name + quality + stock */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between', 
            gap: 6 
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontFamily: "'Space Grotesk',sans-serif", 
                fontWeight: 700, 
                fontSize: isMobile ? 13 : 14,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {product.name}
              </div>
              <div style={{ 
                fontSize: isMobile ? 10 : 11, 
                color: accent, 
                fontWeight: 700, 
                marginTop: 2 
              }}>
                {product.quality}
              </div>
            </div>
            <span style={{
              fontSize: isMobile ? 9 : 10, 
              fontWeight: 800, 
              padding: isMobile ? '2px 6px' : '3px 7px', 
              borderRadius: 5, 
              flexShrink: 0,
              background: out ? 'oklch(0.65 0.22 25 / 0.18)' : 'oklch(0.72 0.16 150 / 0.18)',
              color: out ? 'var(--bad)' : 'var(--good)',
              whiteSpace: 'nowrap',
            }}>
              {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
            </span>
          </div>

          {/* price */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            gap: isMobile ? 6 : 8,
            flexWrap: 'wrap',
          }}>
            <span style={{
              fontFamily: "'Space Grotesk',sans-serif", 
              fontSize: isMobile ? 18 : 22, 
              fontWeight: 700, 
              color: accent,
              lineHeight: 1,
            }}>
              {money(price)}
            </span>
            <span style={{ 
              fontSize: isMobile ? 10 : 11, 
              color: 'var(--muted)',
              whiteSpace: 'nowrap',
            }}>
              {months === 1 ? `/ ${t('month')}` : `/ ${months} ${t('months')}`}
            </span>
          </div>

          {months > 1 && (
            <div style={{ 
              fontSize: isMobile ? 10 : 11, 
              color: 'var(--muted)',
              lineHeight: 1.3,
            }}>
              {money(product.monthlyPrice)} × {months} = {money(price)}
            </div>
          )}

          {product.compareAt > 0 && (
            <div style={{ 
              fontSize: isMobile ? 10 : 11, 
              color: 'var(--muted)', 
              textDecoration: 'line-through',
              lineHeight: 1.3,
            }}>
              Market rate: {money(product.compareAt * months)}
            </div>
          )}

          {/* CTA button */}
          <a
            href={`/product/${product.slug}`}
            onClick={onGuestClick ? e => { e.preventDefault(); onGuestClick(); } : undefined}
            style={{
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center', 
              marginTop: 'auto',
              padding: isMobile ? '12px 16px' : '10px 14px', 
              borderRadius: isMobile ? 8 : 10, 
              fontWeight: 800,
              fontSize: isMobile ? 13 : 13.5, 
              textDecoration: 'none',
              background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
              color: '#000',
              transition: 'filter 0.18s ease, transform 0.18s ease',
              minHeight: isMobile ? '44px' : 'auto',
            }}
            onMouseEnter={e => { 
              if (!isMobile) {
                e.currentTarget.style.filter = 'brightness(1.18)'; 
                e.currentTarget.style.transform = 'scale(1.02)'; 
              }
            }}
            onMouseLeave={e => { 
              if (!isMobile) {
                e.currentTarget.style.filter = 'brightness(1)';    
                e.currentTarget.style.transform = 'scale(1)'; 
              }
            }}
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [tab,          setTab]          = useState('all');
  const [months,       setMonths]       = useState(1);
  const [gateProduct,  setGateProduct]  = useState(null);

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 640;
      const tablet = window.innerWidth > 640 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      // Close filters on desktop
      if (!mobile && !tablet) {
        setFiltersOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const products = useMemo(() => {
    const list = data?.products || [];
    if (tab === 'bundle') return list.filter(p => p.category === 'bundle');
    if (tab === 'all')    return list;
    return list.filter(p => matchRes(p.quality, tab));
  }, [data, tab]);

  const handleGuestClick = (product) => {
    if (!user) setGateProduct(product);
  };

  // Get responsive grid columns for products
  const getGridMinWidth = () => {
    if (isMobile) return '280px';
    if (isTablet) return '240px';
    return '220px';
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

      {/* Header */}
      <div style={{
        textAlign: isMobile ? 'center' : 'left',
        marginBottom: isMobile ? 20 : 24,
      }}>
        <h1 style={{ 
          fontSize: isMobile ? 'clamp(24px, 6vw, 32px)' : isTablet ? 'clamp(28px, 4vw, 36px)' : 'clamp(28px, 3.4vw, 40px)',
          marginBottom: isMobile ? 8 : 8,
        }}>
          {t('shop')}
        </h1>
        <p className="muted" style={{ 
          fontSize: isMobile ? 14 : 15,
          maxWidth: isMobile ? '100%' : '600px',
          margin: isMobile ? '0 auto' : '0',
        }}>
          {t('shopSub')}
        </p>
      </div>

      {/* Mobile Filters Toggle */}
      {isMobile && (
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          style={{
            width: '100%',
            padding: '14px 16px',
            margin: '0 0 16px 0',
            borderRadius: 12,
            border: '1px solid var(--line)',
            background: filtersOpen ? 'oklch(1 0 0 / 0.08)' : 'oklch(1 0 0 / 0.04)',
            color: 'var(--text)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '48px',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔍</span>
            <span>Filters & Duration</span>
            {(tab !== 'all' || months !== 1) && (
              <span style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {(tab !== 'all' ? 1 : 0) + (months !== 1 ? 1 : 0)}
              </span>
            )}
          </div>
          <span style={{
            transform: filtersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            fontSize: '18px',
          }}>
            ▼
          </span>
        </button>
      )}

      {/* Filters Container */}
      <div style={{
        display: (isMobile && !filtersOpen) ? 'none' : 'block',
        background: isMobile ? 'oklch(0.12 0.014 265)' : 'transparent',
        borderRadius: isMobile ? 12 : 0,
        padding: isMobile ? '16px' : '0',
        marginBottom: isMobile ? 20 : 26,
        border: isMobile ? '1px solid var(--line)' : 'none',
      }}>

        {/* Resolution filter tabs */}
        <div style={{
          marginBottom: isMobile ? 16 : 18,
        }}>
          {isMobile && (
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 12,
            }}>
              Quality Filter
            </div>
          )}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: isMobile ? 8 : 10,
            maxWidth: isMobile ? 'none' : '800px',
          }}>
            {RESOLUTION_TABS.map((f, i) => {
              const isActive = tab === f.key;
              const isBundle = f.key === 'bundle';

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
                    padding: isMobile ? '12px 16px' : isTablet ? '10px 16px' : '10px 20px',
                    borderRadius: isMobile ? 8 : 999,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: isMobile ? 13 : 13.5,
                    border: isActive
                      ? `2px solid ${tabColor}`
                      : '2px solid rgba(255,255,255,0.10)',
                    background: isActive
                      ? `linear-gradient(135deg, ${tabColor}22, ${tabColor}0a)`
                      : 'rgba(255,255,255,0.04)',
                    color: isActive ? tabColor : 'var(--muted)',
                    boxShadow: isActive && !isMobile
                      ? `0 0 14px ${tabColor}66, 0 0 28px ${tabColor}22`
                      : 'none',
                    animation: !isMobile && isBundle
                      ? `bundle-float ${2.2 + i * 0.1}s ease-in-out infinite`
                      : !isMobile && isActive
                        ? 'chip-float 2s ease-in-out infinite, chip-glow 2s ease-in-out infinite'
                        : !isMobile
                          ? `chip-float ${2.4 + i * 0.2}s ease-in-out infinite`
                          : 'none',
                    animationDelay: `${i * 0.15}s`,
                    transition: 'background 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    minHeight: isMobile ? '44px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isMobile) {
                      e.currentTarget.style.border = `2px solid ${tabColor}`;
                      e.currentTarget.style.color  = tabColor;
                      e.currentTarget.style.background = `linear-gradient(135deg, ${tabColor}22, ${tabColor}0a)`;
                      e.currentTarget.style.boxShadow = `0 0 16px ${tabColor}55`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive && !isMobile) {
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
        </div>

        {/* Duration selector */}
        <div style={{
          background: isMobile ? 'rgba(10,14,26,0.60)' : 'rgba(10,14,26,0.90)',
          border: '1px solid rgba(0,240,255,0.12)',
          borderRadius: isMobile ? 10 : 16,
          padding: isMobile ? '14px 16px' : isTablet ? '16px 20px' : '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 12 : 16,
          flexWrap: 'wrap',
          backdropFilter: 'blur(12px)',
          boxShadow: isMobile ? '0 0 16px rgba(0,240,255,0.04)' : '0 0 24px rgba(0,240,255,0.06)',
        }}>
          <span style={{
            fontSize: isMobile ? 10 : 11,
            fontWeight: 800,
            color: 'rgba(0,240,255,0.60)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            flexShrink: 0,
          }}>
            Duration
          </span>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : isTablet ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
            gap: isMobile ? 6 : 8,
            flex: 1,
            minWidth: 0,
          }} className="shop-duration-row">
            {DURATIONS.map((m, i) => {
              const isActive = months === m;
              return (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className="shop-duration-btn"
                  style={{
                    padding: isMobile ? '10px 12px' : isTablet ? '10px 14px' : '10px 18px',
                    borderRadius: isMobile ? 8 : 11,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 700,
                    fontSize: isMobile ? 12.5 : 13.5,
                    position: 'relative',
                    overflow: 'hidden',
                    border: isActive
                      ? '1.5px solid #00F0FF'
                      : '1.5px solid rgba(255,255,255,0.10)',
                    background: isActive
                      ? 'rgba(0,240,255,0.10)'
                      : 'rgba(255,255,255,0.04)',
                    color: isActive ? '#00F0FF' : 'var(--muted)',
                    boxShadow: isActive && !isMobile
                      ? '0 0 16px rgba(0,240,255,0.50), 0 0 32px rgba(0,240,255,0.20), inset 0 0 14px rgba(0,240,255,0.08)'
                      : 'none',
                    animation: !isMobile && isActive
                      ? 'chip-float 2s ease-in-out infinite'
                      : !isMobile
                        ? `chip-float ${2.2 + i * 0.15}s ease-in-out infinite`
                        : 'none',
                    animationDelay: `${i * 0.12}s`,
                    transition: 'all 0.18s ease',
                    minHeight: isMobile ? '40px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={e => {
                    if (!isActive && !isMobile) {
                      e.currentTarget.style.border = '1.5px solid rgba(0,240,255,0.50)';
                      e.currentTarget.style.color  = '#00F0FF';
                      e.currentTarget.style.background = 'rgba(0,240,255,0.07)';
                      e.currentTarget.style.boxShadow = '0 0 12px rgba(0,240,255,0.30)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive && !isMobile) {
                      e.currentTarget.style.border = '1.5px solid rgba(255,255,255,0.10)';
                      e.currentTarget.style.color  = 'var(--muted)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* shimmer sweep on active */}
                  {isActive && !isMobile && (
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
              fontSize: isMobile ? 11 : 12,
              color: '#00FF87',
              fontWeight: 700,
              marginLeft: isMobile ? 0 : 'auto',
              textShadow: '0 0 10px rgba(0,255,135,0.50)',
              textAlign: isMobile ? 'center' : 'right',
              width: isMobile ? '100%' : 'auto',
            }}>
              Total = Monthly Rate × {months}
            </span>
          )}
        </div>
      </div>

      {loading && (
        /* skeleton grid while loading */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(auto-fill, minmax(${getGridMinWidth()}, 1fr))`, 
          gap: isMobile ? 14 : isTablet ? 16 : 18 
        }}>
          {Array.from({ length: isMobile ? 4 : isTablet ? 6 : 8 }, (_, i) => (
            <div key={i} style={{
              borderRadius: isMobile ? 16 : 18, 
              height: isMobile ? 280 : isTablet ? 295 : 310,
              background: 'oklch(0.13 0.014 265 / 0.97)',
              animation: 'skeletonPulse 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{
          padding: isMobile ? '16px' : '20px',
          borderRadius: isMobile ? 10 : 12,
          fontSize: isMobile ? 14 : 15,
        }}>
          {error}
        </div>
      )}

      {/* ── Product grid ── */}
      {!loading && !error && (
        <>
          {products.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: isMobile ? '32px 16px' : '40px',
              background: 'oklch(0.12 0.014 265)',
              borderRadius: isMobile ? 12 : 16,
              border: '1px solid var(--line)',
            }}>
              <div style={{
                fontSize: isMobile ? '32px' : '40px',
                marginBottom: isMobile ? 12 : 16,
              }}>
                🔍
              </div>
              <p className="muted" style={{
                fontSize: isMobile ? 15 : 16,
                fontWeight: 600,
              }}>
                No products found for this filter.
              </p>
              <button
                onClick={() => { setTab('all'); setMonths(1); }}
                style={{
                  marginTop: isMobile ? 16 : 20,
                  padding: isMobile ? '12px 20px' : '10px 16px',
                  borderRadius: isMobile ? 8 : 10,
                  border: '1px solid var(--accent)',
                  background: 'transparent',
                  color: 'var(--accent)',
                  fontSize: isMobile ? 14 : 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {products.length > 0 && (
            <>
              {/* Results count */}
              <div style={{
                marginBottom: isMobile ? 16 : 20,
                fontSize: isMobile ? 13 : 14,
                color: 'var(--muted)',
                textAlign: isMobile ? 'center' : 'left',
              }}>
                {products.length} product{products.length !== 1 ? 's' : ''} found
                {tab !== 'all' && ` for ${RESOLUTION_TABS.find(t => t.key === tab)?.label}`}
                {months !== 1 && ` with ${months} month${months !== 1 ? 's' : ''} duration`}
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(${getGridMinWidth()}, 1fr))`,
                gap: isMobile ? 14 : isTablet ? 16 : 18,
              }}>
                {products.map((p, index) => (
                  <div
                    key={p._id}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <ShopCard
                      product={p}
                      months={months}
                      isMobile={isMobile}
                      onGuestClick={!user ? () => handleGuestClick(p) : null}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}

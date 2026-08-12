import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, DURATIONS, priceFor } from '../utils/format.js';

const DETAIL_LOGOS = {
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

/* Quality tier order for sorting */
const QUALITY_ORDER = ['480p SD', '720p HD', '1080p HD', '4K UHD', '8K UHD'];

/* Resolve the base service name from any slug variant */
const getServiceName = (product) => product.name.split(' ').slice(0, 2).join(' ');

/* Quality badge colors */
const QUALITY_COLORS = {
  '480p SD':  { bg: 'rgba(160,185,230,0.14)', color: '#a0b9e6', border: 'rgba(160,185,230,0.25)' },
  '720p HD':  { bg: 'rgba(0,240,255,0.12)',   color: '#00F0FF', border: 'rgba(0,240,255,0.28)'   },
  '1080p HD': { bg: 'rgba(0,255,135,0.12)',   color: '#00FF87', border: 'rgba(0,255,135,0.28)'   },
  '4K UHD':   { bg: 'rgba(157,0,255,0.14)',   color: '#C084FF', border: 'rgba(157,0,255,0.30)'   },
  '8K UHD':   { bg: 'rgba(255,214,0,0.14)',   color: '#FFD600', border: 'rgba(255,214,0,0.28)'   },
};

export default function ProductDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { add }    = useCart();
  const { t }      = useI18n();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  /* Current product */
  const { data, loading, error } = useApi(`/products/${slug}`);

  /* All products — to find quality variants of the same service */
  const { data: allData } = useApi('/products');

  const [months,          setMonths]          = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null); // null = use current page product

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 640;
      const tablet = window.innerWidth > 640 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (loading) return (
    <div className="wrap section" style={{ textAlign: 'center', padding: isMobile ? '40px 16px' : '60px 22px' }}>
      <div className="muted" style={{ fontSize: isMobile ? 15 : 16 }}>{t('loading')}</div>
    </div>
  );
  
  if (error) return (
    <div className="wrap section">
      <div className="alert alert-error" style={{
        padding: isMobile ? '16px' : '20px',
        borderRadius: isMobile ? 10 : 12,
        fontSize: isMobile ? 14 : 15,
      }}>
        {error}
      </div>
    </div>
  );

  const baseProduct = data.product;

  /* All products — to find quality variants of the same service */
  const allProducts = allData?.products || [];
  const serviceName = baseProduct.name
    .replace(/\s*(480p|720p|1080p|4K|8K|SD|HD|UHD).*/i, '')
    .trim();

  const variants = allProducts
    .filter(p =>
      p.name.replace(/\s*(480p|720p|1080p|4K|8K|SD|HD|UHD).*/i, '').trim() === serviceName
    )
    .sort((a, b) =>
      (QUALITY_ORDER.indexOf(a.quality) ?? 99) - (QUALITY_ORDER.indexOf(b.quality) ?? 99)
    );

  /* Active product = selected variant OR the URL product */
  const product = selectedVariant || baseProduct;

  const accent  = product.accent || '#54d6e8';
  const total   = product.prices?.[months] ?? priceFor(product.monthlyPrice, months);
  const out     = product.inStock === 0;
  const logo    = DETAIL_LOGOS[product.slug] || product.logo || null;
  const hasVariants = variants.length > 1;

  const item = {
    productId: product._id,
    slug:      product.slug,
    name:      product.name,
    quality:   product.quality,
    accent:    product.accent,
    logo:      product.logo,
    months,
    price: total,
  };

  const qStyle = QUALITY_COLORS[product.quality] || QUALITY_COLORS['1080p HD'];

  return (
    <section className="wrap section">
      <Link 
        className="btn btn-ghost btn-sm" 
        to="/shop"
        style={{
          padding: isMobile ? '10px 16px' : '9px 15px',
          fontSize: isMobile ? 14 : 13.5,
          minHeight: isMobile ? '44px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ← {t('back')}
      </Link>

      <div 
        className={isMobile ? 'product-detail-mobile' : 'grid grid-2 product-detail-grid'} 
        style={{ 
          marginTop: isMobile ? 16 : 22, 
          alignItems: 'start',
          gap: isMobile ? 20 : 24,
        }}
      >

        {/* ── Logo card ── */}
        <div 
          className="card" 
          style={{ 
            padding: 0, 
            overflow: 'hidden',
            order: isMobile ? 1 : 0,
          }}
        >
          <div style={{
            height: isMobile ? 200 : isTablet ? 250 : 300,
            background: `linear-gradient(135deg, ${accent}33, oklch(0.22 0.02 265))`,
            overflow: 'hidden', 
            borderRadius: 12,
            display: 'grid', 
            placeItems: 'center', 
            position: 'relative',
          }} className="product-logo-area">
            {/* soft glow behind logo */}
            <div style={{
              position: 'absolute', 
              inset: 0, 
              pointerEvents: 'none',
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${accent}22 0%, transparent 70%)`,
            }} />
            {logo
              ? <img src={logo} alt={product.name}
                  style={{
                    width: '100%', 
                    height: '100%',
                    objectFit: product.slug === 'netflix-prime' ? 'contain' : 'cover',
                    objectPosition: 'center',
                    padding: product.slug === 'netflix-prime' ? (isMobile ? '24px' : '40px') : '0',
                    display: 'block', 
                    position: 'relative', 
                    zIndex: 1,
                  }} />
              : <span style={{ 
                  fontSize: isMobile ? 20 : isTablet ? 24 : 28, 
                  fontWeight: 800, 
                  color: accent, 
                  position: 'relative', 
                  zIndex: 1,
                  textAlign: 'center',
                  padding: '0 16px',
                }}>
                  {product.name}
                </span>
            }
          </div>
        </div>

        {/* ── Product details ── */}
        <div 
          className="stack" 
          style={{
            order: isMobile ? 2 : 1,
            gap: isMobile ? 16 : 18,
          }}
        >

          <h1 style={{ 
            fontSize: isMobile ? 'clamp(22px, 6vw, 28px)' : isTablet ? 'clamp(24px, 4vw, 32px)' : 'clamp(26px, 3.2vw, 38px)',
            textAlign: isMobile ? 'center' : 'left',
            lineHeight: 1.2,
          }}>
            {serviceName}
          </h1>

          {/* current quality + stock badges */}
          <div 
            className="row" 
            style={{ 
              gap: isMobile ? 6 : 8,
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <span style={{
              fontSize: isMobile ? 11 : 12, 
              fontWeight: 800, 
              padding: isMobile ? '4px 10px' : '5px 12px', 
              borderRadius: isMobile ? 6 : 8,
              background: qStyle.bg, 
              color: qStyle.color,
              border: `1px solid ${qStyle.border}`,
              boxShadow: `0 0 10px ${qStyle.border}`,
              whiteSpace: 'nowrap',
            }}>
              {product.quality}
            </span>
            <span 
              className="badge" 
              style={{ 
                background: 'oklch(1 0 0 / 0.08)',
                fontSize: isMobile ? 10 : 11,
                padding: isMobile ? '3px 8px' : '4px 9px',
              }}
            >
              {t('warranty')}
            </span>
            <span 
              className={out ? 'badge badge-bad' : 'badge badge-good'}
              style={{
                fontSize: isMobile ? 10 : 11,
                padding: isMobile ? '3px 8px' : '4px 9px',
              }}
            >
              {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
            </span>
          </div>

          {/* ── QUALITY / RESOLUTION SELECTOR ── */}
          {hasVariants && (
            <div style={{
              background: 'oklch(0.13 0.013 265)',
              border: '1px solid oklch(1 0 0 / 0.10)',
              borderRadius: isMobile ? 12 : 14,
              padding: isMobile ? '14px 16px' : '16px 18px',
            }}>
              <div style={{
                fontSize: isMobile ? 10 : 11, 
                fontWeight: 800, 
                color: 'var(--muted)',
                textTransform: 'uppercase', 
                letterSpacing: '0.09em',
                marginBottom: isMobile ? 12 : 14,
                textAlign: isMobile ? 'center' : 'left',
              }}>
                Choose Quality
              </div>
              <div 
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: isMobile ? 8 : 10,
                }} 
                className="quality-selector-grid"
              >
                {variants.map(v => {
                  const isActive = v.slug === product.slug;
                  const qs = QUALITY_COLORS[v.quality] || QUALITY_COLORS['1080p HD'];
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      className="quality-btn"
                      style={{
                        padding: isMobile ? '10px 12px' : isTablet ? '11px 16px' : '12px 20px',
                        borderRadius: isMobile ? 10 : 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        border: isActive
                          ? `2px solid ${qs.color}`
                          : '2px solid oklch(1 0 0 / 0.12)',
                        background: isActive
                          ? `oklch(0.10 0.013 265)`
                          : 'oklch(0.10 0.01 265)',
                        color: isActive ? qs.color : 'oklch(0.72 0.01 265)',
                        boxShadow: isActive
                          ? `0 0 16px ${qs.color}55, inset 0 0 20px ${qs.color}0a`
                          : 'none',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: isMobile ? 3 : 5,
                        minWidth: isMobile ? 'unset' : isTablet ? 80 : 90,
                        minHeight: isMobile ? '64px' : '72px',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={e => {
                        if (!isActive && !isMobile) {
                          e.currentTarget.style.border = `2px solid ${qs.color}88`;
                          e.currentTarget.style.color  = qs.color;
                          e.currentTarget.style.background = 'oklch(0.12 0.012 265)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive && !isMobile) {
                          e.currentTarget.style.border = '2px solid oklch(1 0 0 / 0.12)';
                          e.currentTarget.style.color  = 'oklch(0.72 0.01 265)';
                          e.currentTarget.style.background = 'oklch(0.10 0.01 265)';
                        }
                      }}
                    >
                      <span style={{
                        fontSize: isMobile ? 11 : 13, 
                        fontWeight: 800,
                        color: 'inherit',
                        textAlign: 'center',
                      }}>
                        {v.quality}
                      </span>
                      <span style={{
                        fontSize: isMobile ? 10 : 12, 
                        fontWeight: 700,
                        color: isActive ? qs.color : 'oklch(0.60 0.01 265)',
                        textAlign: 'center',
                      }}>
                        {money(v.monthlyPrice)}/mo
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* ── Duration selector ── */}
          <div className="field">
            <span 
              className="label"
              style={{
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? 11 : 12.5,
              }}
            >
              {t('duration')}
            </span>
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : isTablet ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', 
                gap: isMobile ? 6 : 8 
              }} 
              className="duration-row"
            >
              {DURATIONS.map(m => (
                <button 
                  key={m}
                  className={months === m ? 'duration active' : 'duration'}
                  onClick={() => setMonths(m)}
                  style={{
                    minHeight: isMobile ? '56px' : '60px',
                    padding: isMobile ? '8px 6px' : '13px 8px',
                    fontSize: isMobile ? 12 : 14,
                  }}
                >
                  <strong style={{ fontSize: isMobile ? 13 : 15 }}>{m}</strong>
                  <span style={{ fontSize: isMobile ? 10 : 12 }}>
                    {m === 1 ? t('month') : t('months')}
                  </span>
                  <span style={{ fontSize: isMobile ? 9 : 11, marginTop: 2 }}>
                    {money(product.prices?.[m] ?? priceFor(product.monthlyPrice, m))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Total price card ── */}
          <div 
            className="card spread price-card-spread" 
            style={{ 
              transition: 'all 0.2s ease',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'center' : 'center',
              textAlign: isMobile ? 'center' : 'left',
              gap: isMobile ? 12 : 16,
              padding: isMobile ? '18px 20px' : '20px',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMobile ? 'center' : 'flex-start',
            }}>
              <span 
                className="label"
                style={{
                  fontSize: isMobile ? 11 : 12.5,
                }}
              >
                {t('total')}
              </span>
              <div 
                className="price price-lg" 
                style={{
                  color: accent,
                  transition: 'color 0.25s ease',
                  animation: 'priceFlash 0.3s ease-out',
                  fontSize: isMobile ? 'clamp(24px, 8vw, 32px)' : '32px',
                }}
              >
                {money(total)}
              </div>
              {months > 1 && (
                <div style={{ 
                  fontSize: isMobile ? 11 : 12, 
                  color: 'var(--muted)', 
                  marginTop: 4,
                  transition: 'opacity 0.2s ease',
                }}>
                  {money(product.monthlyPrice)} × {months} months
                </div>
              )}
            </div>
            <span 
              className="muted" 
              style={{ 
                fontSize: isMobile ? 12 : 13, 
                maxWidth: isMobile ? '100%' : 190, 
                textAlign: isMobile ? 'center' : 'end',
                lineHeight: 1.4,
              }}
            >
              {t('heroSub')}
            </span>
          </div>

          {/* ── Action buttons ── */}
          <div 
            className="row product-action-row" 
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? 10 : 12,
              marginTop: isMobile ? 8 : 0,
            }}
          >
            <button 
              className="btn btn-ghost" 
              disabled={out}
              onClick={() => { add(item); navigate('/cart'); }}
              style={{
                padding: isMobile ? '14px 20px' : '13px 22px',
                fontSize: isMobile ? 14 : 15,
                minHeight: isMobile ? '48px' : 'auto',
                width: isMobile ? '100%' : 'auto',
                order: isMobile ? 2 : 1,
              }}
            >
              {t('addToCart')}
            </button>
            <button 
              className="btn" 
              disabled={out}
              onClick={() => { add(item); navigate('/checkout'); }}
              style={{
                padding: isMobile ? '14px 20px' : '13px 22px',
                fontSize: isMobile ? 14 : 15,
                minHeight: isMobile ? '48px' : 'auto',
                width: isMobile ? '100%' : 'auto',
                order: isMobile ? 1 : 2,
              }}
            >
              {t('buyNow')} →
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

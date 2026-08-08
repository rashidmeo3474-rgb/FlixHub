import { useState, useMemo } from 'react';
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
  'netflix-prime':  '/logos/netflix-prime.jpg',
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

  /* Current product */
  const { data, loading, error } = useApi(`/products/${slug}`);

  /* All products — to find quality variants of the same service */
  const { data: allData } = useApi('/products');

  const [months,          setMonths]          = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null); // null = use current page product

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (error)   return <div className="wrap section"><div className="alert alert-error">{error}</div></div>;

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
      <Link className="btn btn-ghost btn-sm" to="/shop">← {t('back')}</Link>

      <div className="grid grid-2" style={{ marginTop: 22, alignItems: 'start' }}>

        {/* ── Left: logo card ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            height: 300,
            background: `linear-gradient(135deg, ${accent}33, oklch(0.22 0.02 265))`,
            overflow: 'hidden', borderRadius: 12,
            display: 'grid', placeItems: 'center', position: 'relative',
          }}>
            {/* soft glow behind logo */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${accent}22 0%, transparent 70%)`,
            }} />
            {logo
              ? <img src={logo} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover',
                    objectPosition: 'center', display: 'block', position: 'relative', zIndex: 1 }} />
              : <span style={{ fontSize: 28, fontWeight: 800, color: accent, position: 'relative', zIndex: 1 }}>
                  {product.name}
                </span>
            }
          </div>
        </div>

        {/* ── Right: details ── */}
        <div className="stack">

          <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>
            {serviceName}
          </h1>

          {/* current quality + stock badges */}
          <div className="row" style={{ gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 8,
              background: qStyle.bg, color: qStyle.color,
              border: `1px solid ${qStyle.border}`,
              boxShadow: `0 0 10px ${qStyle.border}`,
            }}>
              {product.quality}
            </span>
            <span className="badge" style={{ background: 'oklch(1 0 0 / 0.08)' }}>
              {t('warranty')}
            </span>
            <span className={out ? 'badge badge-bad' : 'badge badge-good'}>
              {out ? t('outOfStock') : `${product.inStock} ${t('inStock')}`}
            </span>
          </div>

          {/* ── QUALITY / RESOLUTION SELECTOR ── */}
          {hasVariants && (
            <div className="field">
              <span className="label" style={{ marginBottom: 10, display: 'block' }}>
                Choose Quality
              </span>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 10,
              }}>
                {variants.map(v => {
                  const isActive = v.slug === product.slug;
                  const qs = QUALITY_COLORS[v.quality] || QUALITY_COLORS['1080p HD'];
                  return (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 11,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 700,
                        fontSize: 13,
                        border: isActive
                          ? `2px solid ${qs.color}`
                          : '2px solid rgba(255,255,255,0.10)',
                        background: isActive
                          ? qs.bg
                          : 'rgba(255,255,255,0.04)',
                        color: isActive ? qs.color : 'var(--muted)',
                        boxShadow: isActive
                          ? `0 0 14px ${qs.border}, inset 0 0 10px ${qs.bg}`
                          : 'none',
                        transition: 'all 0.18s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        minWidth: 80,
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.border = `2px solid ${qs.color}88`;
                          e.currentTarget.style.color = qs.color;
                          e.currentTarget.style.background = `${qs.bg}`;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.border = '2px solid rgba(255,255,255,0.10)';
                          e.currentTarget.style.color = 'var(--muted)';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        }
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{v.quality}</span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>
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
            <span className="label">{t('duration')}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
              {DURATIONS.map(m => (
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

          {/* ── Total price card ── */}
          <div className="card spread" style={{ transition: 'all 0.2s ease' }}>
            <div>
              <span className="label">{t('total')}</span>
              <div className="price price-lg" style={{
                color: accent,
                transition: 'color 0.25s ease',
                animation: 'priceFlash 0.3s ease-out',
              }}>{money(total)}</div>
              {months > 1 && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4,
                  transition: 'opacity 0.2s ease' }}>
                  {money(product.monthlyPrice)} × {months} months
                </div>
              )}
            </div>
            <span className="muted" style={{ fontSize: 13, maxWidth: 190, textAlign: 'end' }}>
              {t('heroSub')}
            </span>
          </div>

          {/* ── Action buttons ── */}
          <div className="row">
            <button className="btn btn-ghost" disabled={out}
              onClick={() => { add(item); navigate('/cart'); }}>
              {t('addToCart')}
            </button>
            <button className="btn" disabled={out}
              onClick={() => { add(item); navigate('/checkout'); }}>
              {t('buyNow')} →
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

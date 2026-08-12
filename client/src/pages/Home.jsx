import { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoginGateModal from '../components/LoginGateModal.jsx';

export default function Home() {
  const { t }    = useI18n();
  const { user } = useAuth();
  const { data, loading } = useApi('/products');

  const HOME_SLUGS = ['netflix', 'prime-video', 'disney', 'apple-tv-1080p', 'netflix-prime', 'hbo-max'];
  const all = data?.products || [];

  const FALLBACK_CARDS = {
    'netflix':        { _id: 'netflix',        slug: 'netflix',        name: 'Netflix',               accent: '#e50914', monthlyPrice: 450,  compareAt: 600,  inStock: 8, quality: '1080p HD', logo: '/logos/netflix.jpg'       },
    'prime-video':    { _id: 'prime-video',    slug: 'prime-video',    name: 'Prime Video',           accent: '#00a8e1', monthlyPrice: 350,  compareAt: 500,  inStock: 8, quality: '1080p HD', logo: '/logos/prime-video.png'   },
    'disney':         { _id: 'disney',         slug: 'disney',         name: 'Disney+',               accent: '#4b6cf7', monthlyPrice: 400,  compareAt: 550,  inStock: 8, quality: '1080p HD', logo: null                       },
    'apple-tv-1080p': { _id: 'apple-tv-1080p', slug: 'apple-tv-1080p', name: 'Apple TV+',             accent: '#d8d8d8', monthlyPrice: 1800, compareAt: 2500, inStock: 8, quality: '1080p HD', logo: '/logos/apple-tv.png'      },
    'netflix-prime':  { _id: 'netflix-prime',  slug: 'netflix-prime',  name: 'Netflix + Prime Video', accent: '#ff6b00', monthlyPrice: 600,  compareAt: 1000, inStock: 8, quality: '4K UHD',  logo: '/logos/netflix-prime.jpg' },
    'hbo-max':        { _id: 'hbo-max',        slug: 'hbo-max',        name: 'HBO Max',               accent: '#9b30ff', monthlyPrice: 450,  compareAt: 600,  inStock: 8, quality: '1080p HD', logo: '/logos/hbo-max.png'       },
  };

  const products = HOME_SLUGS.map(slug => all.find(p => p.slug === slug) || FALLBACK_CARDS[slug]);

  const [gateProduct, setGateProduct] = useState(null);

  const steps = [
    { n: '1', title: t('viewPlan'),  body: t('duration') },
    { n: '2', title: t('pay'),       body: t('paymentMethod') },
    { n: '3', title: t('delivered'), body: t('credentials') },
  ];

  const handleCardClick = (e, product) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setGateProduct(product);
    }
  };

  return (
    <>
      {gateProduct && !user && (
        <LoginGateModal
          product={gateProduct}
          onClose={() => setGateProduct(null)}
        />
      )}

      {/* hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 72px' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, oklch(0.07 0.01 265 / 0.82) 0%, oklch(0.07 0.01 265 / 0.45) 55%, transparent 100%)',
        }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="stack" style={{ maxWidth: 600 }}>
            <span className="badge badge-good" style={{ width: 'fit-content', padding: '7px 14px', borderRadius: 999, fontSize: 13 }}>
              {t('heroBadge')}
            </span>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.04 }}>{t('heroTitle')}</h1>
            <p className="muted" style={{ fontSize: 18, lineHeight: 1.55, maxWidth: 540 }}>{t('heroSub')}</p>
            <div className="row" style={{ marginTop: 8 }}>
              <Link className="btn" to="/shop">{t('browse')} →</Link>
              <a className="btn btn-ghost" href="#how">{t('howItWorks')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* product grid */}
      <section style={{ padding: '0 16px 64px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="spread" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>{t('shop')}</h2>
          <Link to="/shop">{t('browse')} →</Link>
        </div>

        {loading && (
          <div className="home-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                borderRadius: 18, height: 340,
                background: 'oklch(0.13 0.014 265 / 0.97)',
                animation: 'skeletonPulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}

        {!loading && (
          <div className="home-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {products.map(p => (
              <div key={p._id} onClickCapture={e => handleCardClick(e, p)}
                style={{ cursor: user ? 'default' : 'pointer' }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* how it works */}
      <section id="how" className="wrap section" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', marginBottom: 22 }}>{t('howItWorks')}</h2>
        <div className="grid grid-3">
          {steps.map(s => (
            <div className="card" key={s.n}>
              <div style={{
                width: 46, height: 46, borderRadius: 13,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: 'var(--bg)', display: 'grid', placeItems: 'center',
                fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20,
              }}>{s.n}</div>
              <h3 style={{ fontSize: 19, marginTop: 16 }}>{s.title}</h3>
              <p className="muted" style={{ marginTop: 8, fontSize: 14.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

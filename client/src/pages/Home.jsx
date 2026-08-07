import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const { t } = useI18n();
  const { data } = useApi('/products');
  // Show exactly these 6 flagship products on home — 1080p tier + bundle
  const HOME_SLUGS = ['netflix', 'prime-video', 'disney', 'apple-tv-1080p', 'netflix-prime', 'hbo-max'];
  const all = data?.products || [];
  const products = HOME_SLUGS.map((slug) => all.find((p) => p.slug === slug)).filter(Boolean);

  const steps = [
    { n: '1', title: t('viewPlan'), body: t('duration') },
    { n: '2', title: t('pay'), body: t('paymentMethod') },
    { n: '3', title: t('delivered'), body: t('credentials') }
  ];

  return (
    <>
      {/* full-width hero — cinematic background shows through on both sides */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 72px' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, oklch(0.07 0.01 265 / 0.82) 0%, oklch(0.07 0.01 265 / 0.45) 55%, transparent 100%)'
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

      <section style={{ paddingTop: 0, padding: '0 16px 64px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="spread" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>{t('shop')}</h2>
          <Link to="/shop">{t('browse')} →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section id="how" className="wrap section" style={{ paddingTop: 0 }}>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', marginBottom: 22 }}>{t('howItWorks')}</h2>
        <div className="grid grid-3">
          {steps.map((s) => (
            <div className="card" key={s.n}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20 }}>{s.n}</div>
              <h3 style={{ fontSize: 19, marginTop: 16 }}>{s.title}</h3>
              <p className="muted" style={{ marginTop: 8, fontSize: 14.5 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

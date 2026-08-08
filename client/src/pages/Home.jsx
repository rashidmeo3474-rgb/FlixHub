import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

/* ─────────────────────────────────────────────────────────────
   LOGIN GATE MODAL
   Shows when a logged-out visitor clicks any product card.
───────────────────────────────────────────────────────────── */
function LoginGateModal({ product, onClose }) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [tab,   setTab]   = useState('login');   // 'login' | 'register'
  const [form,  setForm]  = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(form.email, form.password);
      onClose();
      navigate(`/product/${product.slug}`);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setBusy(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      onClose();
      navigate(`/product/${product.slug}`);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setBusy(false);
  };

  const accent = product?.accent || '#54d6e8';

  return (
    /* backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'oklch(0 0 0 / 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'gateBackdropIn 0.22s ease-out both',
      }}
    >
      {/* modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: 'oklch(0.12 0.014 265 / 0.97)',
          border: `1.5px solid ${accent}44`,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: `0 0 60px ${accent}22, 0 32px 80px oklch(0 0 0 / 0.70)`,
          animation: 'gateModalIn 0.28s cubic-bezier(0.2,0.8,0.3,1.4) both',
        }}
      >
        {/* top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}66)` }} />

        {/* product context strip */}
        <div style={{
          padding: '18px 24px 0',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
            background: `${accent}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {product?.logo
              ? <img src={product.logo} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontWeight: 800, fontSize: 18, color: accent }}>
                  {product?.name?.[0] || '◆'}
                </span>
            }
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              You selected
            </div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
              fontSize: 16, marginTop: 2, color: accent }}>
              {product?.name}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'var(--muted)', fontSize: 22, cursor: 'pointer',
              lineHeight: 1, padding: 4, borderRadius: 6,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >×</button>
        </div>

        {/* heading */}
        <div style={{ padding: '16px 24px 0', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700,
            lineHeight: 1.2,
          }}>
            Sign in to continue
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>
            Create a free account or log in to purchase this subscription.
          </p>
        </div>

        {/* tab switcher */}
        <div style={{
          display: 'flex', margin: '18px 24px 0',
          background: 'oklch(0.09 0.01 265)', borderRadius: 12, padding: 4, gap: 4,
        }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 700, fontSize: 13.5,
                background: tab === t ? `linear-gradient(135deg, ${accent}cc, ${accent}66)` : 'transparent',
                color: tab === t ? '#000' : 'var(--muted)',
                transition: 'all 0.18s ease',
              }}>
              {t === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* form */}
        <form
          onSubmit={tab === 'login' ? handleLogin : handleRegister}
          style={{ padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {tab === 'register' && (
            <div className="field">
              <label className="label">Full Name</label>
              <input
                type="text" required placeholder="Ali Ahmed"
                value={form.name} onChange={e => set('name', e.target.value)}
              />
            </div>
          )}
          <div className="field">
            <label className="label">Email</label>
            <input
              type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input
              type="password" required placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)}
            />
          </div>

          {error && (
            <div className="alert alert-error" style={{ fontSize: 13 }}>{error}</div>
          )}

          <button
            className="btn btn-block" type="submit" disabled={busy}
            style={{ marginTop: 4, background: `linear-gradient(135deg, ${accent}, ${accent}88)` }}
          >
            {busy
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : (tab === 'login' ? 'Log In & Continue' : 'Create Account & Continue')}
          </button>

          {/* divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {/* guest browse */}
          <Link
            to="/shop"
            onClick={onClose}
            style={{
              display: 'block', textAlign: 'center',
              padding: '11px', borderRadius: 12, fontSize: 14,
              fontWeight: 700, border: '1px solid var(--line)',
              color: 'var(--muted)', textDecoration: 'none',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'oklch(1 0 0 / 0.05)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}
          >
            Browse as guest →
          </Link>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────────────────── */
export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data, loading } = useApi('/products');

  const HOME_SLUGS = ['netflix', 'prime-video', 'disney', 'apple-tv-1080p', 'netflix-prime', 'hbo-max'];
  const all = data?.products || [];

  // Try to match by slug first. If fewer than 6 match (slug mismatch),
  // fall back to showing the first 6 products from whatever the API returned.
  const bySlug = HOME_SLUGS.map(slug => all.find(p => p.slug === slug)).filter(Boolean);
  const products = bySlug.length >= 4 ? bySlug : all.slice(0, 6);

  const [gateProduct, setGateProduct] = useState(null);

  const steps = [
    { n: '1', title: t('viewPlan'),  body: t('duration') },
    { n: '2', title: t('pay'),       body: t('paymentMethod') },
    { n: '3', title: t('delivered'), body: t('credentials') },
  ];

  /* Wrap each ProductCard so clicks are intercepted for guests */
  const handleCardAreaClick = (e, product) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setGateProduct(product);
    }
    // if logged in — let the Link inside ProductCard navigate normally
  };

  return (
    <>
      {/* Login gate modal */}
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
      <section style={{ paddingTop: 0, padding: '0 16px 64px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="spread" style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)' }}>{t('shop')}</h2>
          <Link to="/shop">{t('browse')} →</Link>
        </div>

        {/* Loading skeletons — taake layout na hilay */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                borderRadius: 18, overflow: 'hidden',
                background: 'oklch(0.13 0.014 265 / 0.97)',
                border: '1.5px solid oklch(1 0 0 / 0.07)',
                height: 340,
                animation: 'skeletonPulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        )}

        {/* Actual cards */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {products.map(p => (
              <div
                key={p._id}
                onClickCapture={e => handleCardAreaClick(e, p)}
                style={{ cursor: user ? 'default' : 'pointer' }}
              >
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

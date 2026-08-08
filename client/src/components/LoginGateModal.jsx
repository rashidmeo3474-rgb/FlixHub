import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

/**
 * LoginGateModal
 * Shows when a guest clicks a product card.
 * Props:
 *   product  — the product object clicked
 *   onClose  — close handler
 */
export default function LoginGateModal({ product, onClose }) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [tab,   setTab]   = useState('login');
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
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'oklch(0 0 0 / 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'gateBackdropIn 0.22s ease-out both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: 'oklch(0.12 0.014 265 / 0.98)',
          border: `1.5px solid ${accent}44`,
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: `0 0 60px ${accent}22, 0 32px 80px oklch(0 0 0 / 0.72)`,
          animation: 'gateModalIn 0.28s cubic-bezier(0.2,0.8,0.3,1.4) both',
        }}
      >
        {/* top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}55)` }} />

        {/* product strip */}
        <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, overflow: 'hidden',
            flexShrink: 0, background: `${accent}22`,
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
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.07em' }}>You selected</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
              fontSize: 15, marginTop: 2, color: accent }}>
              {product?.name}
              {product?.quality && (
                <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600,
                  marginLeft: 8 }}>{product.quality}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{
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
        <div style={{ padding: '14px 22px 0', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 21,
            fontWeight: 700, lineHeight: 1.2 }}>
            Sign in to continue
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            Log in or create a free account to purchase.
          </p>
        </div>

        {/* tab switcher */}
        <div style={{
          display: 'flex', margin: '16px 22px 0',
          background: 'oklch(0.09 0.01 265)', borderRadius: 12, padding: 4, gap: 4,
        }}>
          {['login', 'register'].map(tabKey => (
            <button key={tabKey}
              onClick={() => { setTab(tabKey); setError(''); }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: 700, fontSize: 13.5,
                background: tab === tabKey
                  ? `linear-gradient(135deg, ${accent}cc, ${accent}66)`
                  : 'transparent',
                color: tab === tabKey ? '#000' : 'var(--muted)',
                transition: 'all 0.18s ease',
              }}>
              {tabKey === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* form */}
        <form
          onSubmit={tab === 'login' ? handleLogin : handleRegister}
          style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: 11 }}
        >
          {tab === 'register' && (
            <div className="field">
              <label className="label">Full Name</label>
              <input type="text" required placeholder="Ali Ahmed"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          )}
          <div className="field">
            <label className="label">Email</label>
            <input type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input type="password" required placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)} />
          </div>

          {error && (
            <div className="alert alert-error" style={{ fontSize: 13 }}>{error}</div>
          )}

          <button className="btn btn-block" type="submit" disabled={busy}
            style={{ marginTop: 4,
              background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
              color: '#000' }}>
            {busy
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : (tab === 'login' ? 'Log In & Continue →' : 'Register & Continue →')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <Link to="/shop" onClick={onClose} style={{
            display: 'block', textAlign: 'center', padding: '10px',
            borderRadius: 11, fontSize: 13.5, fontWeight: 700,
            border: '1px solid var(--line)', color: 'var(--muted)',
            textDecoration: 'none', transition: 'all 0.18s ease',
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

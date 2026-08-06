import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await adminLogin(form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="wrap-xs" style={{ paddingTop: 90, paddingBottom: 60 }}>
      <form className="card stack" onSubmit={submit} style={{
        background: 'linear-gradient(oklch(0.17 0.014 265), oklch(0.17 0.014 265)) padding-box, linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.65 0.22 25)) border-box'
      }}>
        <div className="row" style={{ gap: 11 }}>
          <span className="mark" style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.65 0.22 25))', color: 'var(--bg)', fontWeight: 800 }}>⚙</span>
          <div>
            <strong className="display" style={{ fontSize: 19, display: 'block' }}>{t('adminPortal')}</strong>
            <span className="muted" style={{ fontSize: 12.5 }}>{t('staffOnly')}</span>
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="admin-email">{t('email')}</label>
          <input id="admin-email" type="email" required autoComplete="username"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="admin@primevault.pk" />
        </div>
        <div className="field">
          <label className="label" htmlFor="admin-password">{t('password')}</label>
          <input id="admin-password" type="password" required autoComplete="current-password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button className="btn" type="submit" disabled={busy}
          style={{ background: 'linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.68 0.22 28))' }}>
          {busy ? t('loading') : t('login')}
        </button>
        <Link to="/" style={{ fontSize: 14, textAlign: 'center' }}>← {t('viewStore')}</Link>
      </form>
    </section>
  );
}

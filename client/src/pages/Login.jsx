import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await login(form.email, form.password);
      navigate(state?.from || '/orders', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="wrap-xs section" style={{ paddingTop: 70 }}>
      <form className="card stack" onSubmit={submit}>
        <h1 style={{ fontSize: 26 }}>{t('login')}</h1>
        <div className="field">
          <label className="label" htmlFor="email">{t('email')}</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">{t('password')}</label>
          <input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? t('loading') : t('login')}</button>
        <Link to="/register" style={{ fontSize: 14, textAlign: 'center' }}>{t('noAccount')}</Link>
        <Link className="btn btn-ghost btn-block" to="/shop" style={{ textAlign: 'center' }}>{t('guestCheckout')}</Link>
      </form>
    </section>
  );
}

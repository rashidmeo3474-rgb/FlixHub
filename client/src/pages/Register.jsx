import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const field = (key, label, type = 'text', required = true) => (
    <div className="field">
      <label className="label" htmlFor={key}>{label}</label>
      <input id={key} type={type} required={required} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <section className="wrap-xs section" style={{ paddingTop: 60 }}>
      <form className="card stack" onSubmit={submit}>
        <h1 style={{ fontSize: 26 }}>{t('signup')}</h1>
        {field('name', t('name'), 'text', false)}
        {field('email', t('email'), 'email')}
        {field('phone', t('phone'), 'tel', false)}
        {field('password', t('password'), 'password')}
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? t('loading') : t('signup')}</button>
        <Link to="/login" style={{ fontSize: 14, textAlign: 'center' }}>{t('haveAccount')}</Link>
      </form>
    </section>
  );
}

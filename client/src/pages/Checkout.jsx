import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel } from '../utils/format.js';

const METHODS = [
  { key: 'jazzcash', label: 'JazzCash', note: 'Mobile wallet · instant approval' },
  { key: 'easypaisa', label: 'EasyPaisa', note: 'Mobile wallet · instant approval' },
  { key: 'card', label: 'Visa / Mastercard', note: 'Any bank debit or credit card' }
];

export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [method, setMethod] = useState('jazzcash');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, months: i.months })),
        paymentMethod: method, email, phone
      });
      navigate(`/payment/${data.order._id}`, { state: { intent: data.intent, reference: data.order.reference } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="wrap-sm section">
      <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{t('checkout')}</h1>

      <div className="steps">
        {[t('email'), t('pay'), t('delivered')].map((label, i) => (
          <div key={label}><div className={i === 0 ? 'bar on' : 'bar'} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</span></div>
        ))}
      </div>

      <form className="grid grid-2" onSubmit={submit} style={{ alignItems: 'start' }}>
        <div className="card stack">
          <div className="field">
            <label className="label" htmlFor="email">{t('email')}</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" />
          </div>
          <div className="field">
            <label className="label" htmlFor="phone">{t('phone')}</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 0000000" />
          </div>
          <div className="field">
            <span className="label">{t('paymentMethod')}</span>
            <div className="stack" style={{ gap: 10 }}>
              {METHODS.map((m) => (
                <button type="button" key={m.key} onClick={() => setMethod(m.key)}
                  className={method === m.key ? 'duration active' : 'duration'}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
                  <span style={{ textAlign: 'start' }}>
                    <strong style={{ display: 'block' }}>{m.label}</strong>
                    <span className="muted" style={{ fontSize: 12.5 }}>{m.note}</span>
                  </span>
                  <span>{method === m.key ? '●' : '○'}</span>
                </button>
              ))}
            </div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? t('loading') : `${t('continueToPayment')} →`}
          </button>
        </div>

        <aside className="card stack" style={{ gap: 12 }}>
          <span className="label">{t('orderSummary')}</span>
          {items.map((i, k) => (
            <div className="spread" key={k} style={{ fontSize: 14 }}>
              <span className="muted">{i.name} · {monthsLabel(i.months, t)}</span>
              <strong>{money(i.price)}</strong>
            </div>
          ))}
          <div className="spread" style={{ borderTop: '1px dashed var(--line)', paddingTop: 12 }}>
            <span className="label">{t('total')}</span>
            <span className="price" style={{ fontSize: 24 }}>{money(total)}</span>
          </div>
        </aside>
      </form>
    </section>
  );
}

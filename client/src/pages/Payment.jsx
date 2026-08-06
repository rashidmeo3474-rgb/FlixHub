import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';

export default function Payment() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { total, clear } = useCart();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const pay = async () => {
    setBusy(true); setError(null);
    try {
      const { data } = await api.post(`/orders/${orderId}/pay`, { intentId: state?.intent?.intentId });
      clear();
      navigate(`/success/${data.order.reference}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="wrap-xs section" style={{ paddingTop: 60 }}>
      <div className="card stack">
        <span className="label">{state?.intent?.provider || t('paymentMethod')}</span>
        <h1 style={{ fontSize: 24 }}>{t('pay')} {money(state?.intent?.amount ?? total)}</h1>
        <p className="muted" style={{ fontSize: 14.5 }}>
          {t('heroSub')}
        </p>
        {state?.reference && <div className="cred-row"><span className="muted">reference</span><span>{state.reference}</span></div>}
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn btn-block" onClick={pay} disabled={busy}>
          {busy ? t('loading') : `${t('pay')} →`}
        </button>
        <button className="btn btn-ghost btn-block" onClick={() => navigate('/cart')}>{t('back')}</button>
      </div>
    </section>
  );
}

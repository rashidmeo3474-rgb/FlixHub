import { Link, useParams } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel, formatDate } from '../utils/format.js';

export default function Success() {
  const { reference } = useParams();
  const { t } = useI18n();
  const { data, loading, error } = useApi(`/orders/${reference}`);

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (error) return <div className="wrap section"><div className="alert alert-error">{error}</div></div>;

  const order = data.order;

  return (
    <section className="wrap-sm section">
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ width: 66, height: 66, margin: '0 auto', borderRadius: '50%', background: 'oklch(0.85 0.16 150 / 0.16)', color: 'var(--good)', display: 'grid', placeItems: 'center', fontSize: 32 }}>✓</div>
        <h1 style={{ marginTop: 20, fontSize: 'clamp(24px, 3vw, 34px)' }}>{t('paid')}</h1>
        <p className="muted" style={{ marginTop: 10 }}>{order.reference} · {money(order.total)} · {formatDate(order.createdAt)}</p>

        <div className="stack" style={{ marginTop: 24, textAlign: 'start' }}>
          {order.items.map((item, i) => (
            <div className="creds" key={i}>
              <div className="spread">
                <strong>{item.name}</strong>
                <span className="badge" style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                  {monthsLabel(item.months, t)}
                </span>
              </div>
              <div className="cred-row">
                <span className="muted">Email</span>
                <span>{item.credentials?.login}</span>
              </div>
              <div className="cred-row">
                <span className="muted">Password</span>
                <span>{item.credentials?.password}</span>
              </div>
              {item.credentials?.profile && (
                <div className="cred-row">
                  <span className="muted">Profile</span>
                  <span>{item.credentials.profile}</span>
                </div>
              )}
              {item.credentials?.expiresAt && (
                <div className="cred-row">
                  <span className="muted">Valid Until</span>
                  <span>{formatDate(item.credentials.expiresAt)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="row success-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
          <Link className="btn btn-ghost" to="/orders">{t('orders')}</Link>
          <Link className="btn" to="/shop">{t('shop')}</Link>
        </div>
      </div>
    </section>
  );
}

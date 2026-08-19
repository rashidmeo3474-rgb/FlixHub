import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money, formatDate, monthsLabel } from '../utils/format.js';

const badgeFor = (status) =>
  status === 'delivered' ? 'badge badge-good'
  : status === 'pending' ? 'badge badge-warn'
  : 'badge badge-bad';

export default function Orders() {
  const { t } = useI18n();
  const { data, loading, error } = useApi('/orders/mine');

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (error) return <div className="wrap section"><div className="alert alert-error">{error}</div></div>;

  const orders = data.orders || [];

  return (
    <section className="wrap section">
      <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{t('orders')}</h1>

      {orders.length === 0 && <p className="muted" style={{ marginTop: 16 }}>{t('emptyCart')}</p>}

      <div className="stack" style={{ marginTop: 24 }}>
        {orders.map((order) => (
          <div className="card" key={order._id}>
            <div className="spread">
              <div>
                <strong style={{ fontSize: 15.5 }}>{order.items.map((i) => i.name).join(', ')}</strong>
                <div className="muted" style={{ fontSize: 12.5 }}>{order.reference} · {formatDate(order.createdAt)}</div>
              </div>
              <span className="price" style={{ fontSize: 18 }}>{money(order.total)}</span>
              <span className={badgeFor(order.status)}>{order.status}</span>
            </div>

            {order.status === 'delivered' && (
              <div className="stack" style={{ marginTop: 14, gap: 10 }}>
                {order.items.map((item, i) => (
                  <div className="creds" key={i}>
                    <div className="spread">
                      <strong style={{ fontSize: 14 }}>{item.name}</strong>
                      <span className="muted" style={{ fontSize: 12.5 }}>{monthsLabel(item.months, t)}</span>
                    </div>
                    <div className="cred-row">
                      <span className="muted">Email</span>
                      <span>{item.credentials?.login}</span>
                    </div>
                    <div className="cred-row">
                      <span className="muted">Password</span>
                      <span>{item.credentials?.password}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

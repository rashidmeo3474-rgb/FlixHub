import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money, formatDate, monthsLabel } from '../utils/format.js';

const statusLabel = (status) => status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending';

const badgeFor = (status) =>
  status === 'delivered' ? 'badge badge-good'
  : status === 'pending' ? 'badge badge-warn'
  : 'badge badge-bad';

export default function Orders() {
  const { t } = useI18n();
  const { data, loading, error } = useApi('/orders/mine');
  const paymentData = useApi('/payments/mine');

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (error) return <div className="wrap section"><div className="alert alert-error">{error}</div></div>;

  const orders = data.orders || [];
  const proofs = paymentData.data?.proofs || [];

  return (
    <section className="wrap section">
      <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>{t('orders')}</h1>

      {orders.length === 0 && <p className="muted" style={{ marginTop: 16 }}>{t('emptyCart')}</p>}

      <div className="stack" style={{ marginTop: 24 }}>
        {proofs.length > 0 && (
          <div className="card stack" style={{ gap: 10 }}>
            <h2 style={{ fontSize: 18, margin: 0 }}>Payment history</h2>
            {proofs.map((proof) => (
              <div key={proof._id} className="card" style={{ background: 'var(--card-alt, #f8f9ff)', border: '1px solid var(--line)' }}>
                <div className="spread">
                  <strong>{proof.order?.reference || proof.orderId}</strong>
                  <span className={proof.status === 'approved' ? 'badge badge-good' : proof.status === 'rejected' ? 'badge badge-bad' : 'badge badge-warn'}>{statusLabel(proof.status)}</span>
                </div>
                <div className="muted" style={{ fontSize: 12.5 }}>{proof.paymentMethod} · {formatDate(proof.createdAt)}</div>
                <div className="cred-row"><span className="muted">Amount</span><span>{money(proof.amountPaid || proof.order?.total || 0)}</span></div>
                <div className="cred-row"><span className="muted">Transaction</span><span>{proof.transactionId || '—'}</span></div>
                {proof.rejectionReason && <div className="cred-row"><span className="muted">Reason</span><span>{proof.rejectionReason}</span></div>}
              </div>
            ))}
          </div>
        )}
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
                    <div className="cred-row"><span className="muted">email</span><span>{item.credentials?.login}</span></div>
                    <div className="cred-row"><span className="muted">password</span><span>{item.credentials?.password}</span></div>
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

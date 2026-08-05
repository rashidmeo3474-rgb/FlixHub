import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money, formatDate } from '../utils/format.js';

export default function Dashboard() {
  const { t } = useI18n();
  const stats = useApi('/admin/stats');
  const orders = useApi('/admin/orders?limit=6');

  if (stats.loading) return <p className="muted">{t('loading')}</p>;
  if (stats.error) return <div className="alert alert-error">{stats.error}</div>;

  const s = stats.data;
  const cards = [
    { label: t('ordersToday'), value: s.ordersToday, color: 'var(--accent)' },
    { label: t('revenueToday'), value: money(s.revenueToday), color: 'var(--good)' },
    { label: t('accountsInStock'), value: s.accountsInStock, color: 'var(--accent-2)' },
    { label: t('lowStock'), value: s.lowStockProducts, color: 'var(--warn)' },
    { label: t('customers'), value: s.customers, color: 'var(--text)' }
  ];

  return (
    <>
      <h1 style={{ fontSize: 30 }}>{t('dashboard')}</h1>

      <div className="grid grid-4" style={{ margin: '22px 0 30px' }}>
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <span className="label">{c.label}</span>
            <div className="display" style={{ fontSize: 27, fontWeight: 700, color: c.color, marginTop: 4 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 14 }}>{t('orders')}</h2>
      <div className="card" style={{ padding: 8 }}>
        <table className="table">
          <thead>
            <tr><th>Reference</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {(orders.data?.orders || []).map((o) => (
              <tr key={o._id}>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>{o.reference}</td>
                <td>{o.items.map((i) => i.name).join(', ')}</td>
                <td>{money(o.total)}</td>
                <td><span className={o.status === 'delivered' ? 'badge badge-good' : 'badge badge-warn'}>{o.status}</span></td>
                <td className="muted">{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

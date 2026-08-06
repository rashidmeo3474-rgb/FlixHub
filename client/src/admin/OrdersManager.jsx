import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money, formatDate } from '../utils/format.js';

const STATUSES = ['', 'pending', 'paid', 'delivered', 'failed', 'refunded'];

export default function OrdersManager() {
  const { t } = useI18n();
  const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useApi(`/admin/orders${filter ? `?status=${filter}` : ''}`, { deps: [filter] });

  const setStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}`, { status });
    reload();
  };

  if (loading) return <p className="muted">{t('loading')}</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <h1 style={{ fontSize: 30 }}>{t('orders')}</h1>

      <div className="row" style={{ margin: '20px 0' }}>
        {STATUSES.map((s) => (
          <button key={s || 'all'} className={filter === s ? 'chip active' : 'chip'} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 8 }}>
        <table className="table">
          <thead>
            <tr><th>Reference</th><th>Customer</th><th>Items</th><th>Total</th><th>Method</th><th>Status</th><th>Date</th><th /></tr>
          </thead>
          <tbody>
            {(data.orders || []).map((o) => (
              <tr key={o._id}>
                <td style={{ fontFamily: 'ui-monospace, monospace' }}>{o.reference}</td>
                <td>{o.user?.email || o.guestEmail}</td>
                <td>{o.items.map((i) => `${i.name} (${i.months}m)`).join(', ')}</td>
                <td>{money(o.total)}</td>
                <td className="muted">{o.paymentMethod}</td>
                <td><span className={o.status === 'delivered' ? 'badge badge-good' : o.status === 'pending' ? 'badge badge-warn' : 'badge badge-bad'}>{o.status}</span></td>
                <td className="muted">{formatDate(o.createdAt)}</td>
                <td>
                  <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)} style={{ padding: '7px 9px', fontSize: 13 }}>
                    {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

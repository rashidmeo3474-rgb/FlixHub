import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money, formatDate } from '../utils/format.js';

const REJECTION_REASONS = ['Wrong amount', 'Screenshot unclear', 'Payment not received', 'Duplicate payment', 'Invalid transaction'];

const STATUSES = ['', 'pending', 'paid', 'delivered', 'failed', 'refunded'];

export default function OrdersManager() {
  const { t } = useI18n();
  const [filter, setFilter] = useState('');
  const [reviewing, setReviewing] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const { data, loading, error, reload } = useApi(`/admin/orders${filter ? `?status=${filter}` : ''}`, { deps: [filter] });
  const proofs = useApi('/payments/admin/pending');

  const setStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}`, { status });
    reload();
  };

  const reviewProof = async (id, action) => {
    await api.post(`/payments/admin/${id}/review`, { action, rejectionReason: reason, adminNotes: notes });
    setReviewing(null); setReason(''); setNotes('');
    if (proofs.reload) proofs.reload();
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

      <div className="card" style={{ padding: 8, marginBottom: 24 }}>
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

      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Pending payments</h2>
      <div className="card" style={{ padding: 8 }}>
        <table className="table">
          <thead>
            <tr><th>Customer</th><th>Service</th><th>Plan</th><th>Amount</th><th>Method</th><th>Transaction</th><th>Upload</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {(proofs.data?.proofs || []).map((proof) => (
              <tr key={proof._id}>
                <td>{proof.user?.email || proof.user?.name || 'Customer'}</td>
                <td>{proof.order?.items?.[0]?.name || 'Service'}</td>
                <td>{proof.order?.items?.[0]?.months || '—'}m</td>
                <td>{money(proof.amountPaid || proof.order?.total || 0)}</td>
                <td>{proof.paymentMethod}</td>
                <td>{proof.transactionId || '—'}</td>
                <td>
                  <div className="stack" style={{ gap: 4 }}>
                    {proof.files?.[0] && <a href={proof.files[0]} target="_blank" rel="noreferrer">View file</a>}
                    <span className="muted">{formatDate(proof.createdAt)}</span>
                  </div>
                </td>
                <td>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" onClick={() => setReviewing(proof)}>Review</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviewing && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Review payment</h3>
          <div className="field">
            <label className="label">Reject reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Choose reason</option>
              {REJECTION_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Admin notes</label>
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn" onClick={() => reviewProof(reviewing._id, 'approve')}>Approve</button>
            <button className="btn btn-danger" onClick={() => reviewProof(reviewing._id, 'reject')}>Reject</button>
            <button className="btn btn-ghost" onClick={() => reviewProof(reviewing._id, 'pending')}>Keep pending</button>
            <button className="btn btn-ghost" onClick={() => setReviewing(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

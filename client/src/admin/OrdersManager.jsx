import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { money, formatDate } from '../utils/format.js';

const STATUSES = ['', 'pending', 'paid', 'delivered', 'failed', 'refunded'];

const statusStyle = (s) => {
  if (s === 'delivered') return { background: 'rgba(0,255,135,0.14)',  color: '#00FF87', border: '1px solid rgba(0,255,135,0.25)',  boxShadow: '0 0 8px rgba(0,255,135,0.30)'  };
  if (s === 'pending')   return { background: 'rgba(255,214,0,0.14)',  color: '#FFD600', border: '1px solid rgba(255,214,0,0.25)',  boxShadow: '0 0 8px rgba(255,214,0,0.28)'  };
  if (s === 'paid')      return { background: 'rgba(0,240,255,0.14)',  color: '#00F0FF', border: '1px solid rgba(0,240,255,0.25)',  boxShadow: '0 0 8px rgba(0,240,255,0.28)'  };
  return                        { background: 'rgba(255,46,147,0.14)', color: '#FF2E93', border: '1px solid rgba(255,46,147,0.25)', boxShadow: '0 0 8px rgba(255,46,147,0.28)' };
};

function OrderModal({ order, onClose, onSave }) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.adminNotes || '');
  const [reason, setReason] = useState(order.rejectionReason || '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    await api.patch(`/admin/orders/${order._id}`, { status, adminNotes: notes, rejectionReason: reason });
    setBusy(false);
    onSave();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div style={{
        background: 'oklch(0.15 0.014 265)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 28, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20 }}>Order Detail</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            ['Reference', order.reference],
            ['Customer', order.user?.email || order.guestEmail || '—'],
            ['Phone', order.phone || '—'],
            ['Total', money(order.total)],
            ['Method', order.paymentMethod],
            ['Date', formatDate(order.createdAt)],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 14, fontFamily: k === 'Reference' ? 'ui-monospace,monospace' : 'inherit' }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Items</div>
          {order.items.map((item, i) => (
            <div key={i} style={{ background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <strong>{item.name}</strong>
                <span style={{ fontWeight: 700 }}>{money(item.price)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.quality} · {item.months} month{item.months > 1 ? 's' : ''}</div>
              {item.credentials?.login && (
                <div style={{ marginTop: 8, padding: 8, background: 'oklch(0.1 0.01 265)', borderRadius: 6, fontSize: 12, fontFamily: 'ui-monospace,monospace' }}>
                  <div>📧 {item.credentials.login}</div>
                  <div>🔑 {item.credentials.password}</div>
                  {item.credentials.profile && <div>👤 {item.credentials.profile}</div>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Status update */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="field">
            <label className="label">Update Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Admin Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 70 }} placeholder="Internal notes…" />
          </div>
          {(status === 'failed' || status === 'refunded') && (
            <div className="field">
              <label className="label">Rejection / Refund Reason</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason…" />
            </div>
          )}
          <button className="btn" onClick={save} disabled={busy} style={{ marginTop: 4 }}>
            {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersManager() {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, loading, error, reload } = useApi(
    `/admin/orders?page=${page}&limit=25${filter ? `&status=${filter}` : ''}${search ? `&search=${search}` : ''}`,
    { deps: [filter, page, search] }
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Orders</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          {data?.total ? `${data.total} total orders` : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'center' }}>
        {STATUSES.map((s) => (
          <button key={s || 'all'} onClick={() => { setFilter(s); setPage(1); }}
            className={filter === s ? 'chip active' : 'chip'}>
            {s || 'All'}
          </button>
        ))}
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search reference…"
          style={{ marginLeft: 'auto', width: 200, padding: '9px 14px', borderRadius: 10, fontSize: 13, background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)', color: 'var(--text)' }} />
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && (
        <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Method</th><th>Status</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.orders || []).map((o) => (
                <tr key={o._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(o)}>
                  <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{o.reference}</td>
                  <td style={{ fontSize: 13 }}>{o.user?.email || o.guestEmail || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{o.items.map((i) => `${i.name} (${i.months}m)`).join(', ')}</td>
                  <td style={{ fontWeight: 700 }}>{money(o.total)}</td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{o.paymentMethod}</td>
                  <td>
                    <span style={{ ...statusStyle(o.status), fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(o.createdAt)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(o); }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!data?.orders?.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 30 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.total > 25 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: 'var(--muted)', fontSize: 13, lineHeight: '36px' }}>Page {page} of {Math.ceil(data.total / 25)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(data.total / 25)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} onSave={reload} />}
    </>
  );
}

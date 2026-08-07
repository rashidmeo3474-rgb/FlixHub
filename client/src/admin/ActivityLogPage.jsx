import { useState } from 'react';
import useApi from '../hooks/useApi.js';
import { formatDate } from '../utils/format.js';

const ACTION_COLORS = {
  payment_approved: 'var(--good)',
  payment_rejected: 'var(--bad)',
  payment_submitted: 'var(--accent)',
  order_status_updated: 'var(--warn)',
  stock_added: 'oklch(0.7 0.18 300)',
  product_created: 'var(--good)',
  product_updated: 'var(--accent)',
  product_archived: 'var(--bad)',
  user_role_updated: 'var(--warn)',
  user_deleted: 'var(--bad)',
};

export default function ActivityLogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, loading, error } = useApi(
    `/admin/activity?page=${page}&limit=40${search ? `&action=${search}` : ''}`,
    { deps: [page, search] }
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Activity Log</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>All admin and system actions</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Filter by action keyword…"
          style={{ width: 260, padding: '9px 14px', borderRadius: 10, fontSize: 13, background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)', color: 'var(--text)' }} />
        {search && <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>}
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && (
        <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Action</th><th>Actor</th><th>User</th><th>Details</th><th>Date</th></tr>
            </thead>
            <tbody>
              {(data?.logs || []).map((log) => (
                <tr key={log._id}>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 13, color: ACTION_COLORS[log.action] || 'var(--accent)' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{log.actor?.email || '—'}</td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{log.user?.email || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'ui-monospace,monospace', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {JSON.stringify(log.details)}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</td>
                </tr>
              ))}
              {!data?.logs?.length && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 30 }}>No activity found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data?.total > 40 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: 'var(--muted)', fontSize: 13, lineHeight: '36px' }}>Page {page} of {Math.ceil(data.total / 40)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(data.total / 40)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </>
  );
}

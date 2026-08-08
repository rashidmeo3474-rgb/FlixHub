import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { money, formatDate } from '../utils/format.js';

const statusStyle = (s) => {
  if (s === 'delivered') return { background: 'oklch(0.72 0.16 150 / 0.18)', color: 'var(--good)' };
  if (s === 'pending')   return { background: 'oklch(0.7 0.19 60 / 0.18)',   color: 'var(--warn)' };
  return { background: 'oklch(0.65 0.22 25 / 0.18)', color: 'var(--bad)' };
};

function UserModal({ userId, onClose, onSave }) {
  const { data, loading } = useApi(`/admin/users/${userId}`);
  const [busy, setBusy] = useState(false);

  const toggleRole = async () => {
    if (!data) return;
    const newRole = data.user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role to "${newRole}"?`)) return;
    setBusy(true);
    await api.patch(`/admin/users/${userId}/role`, { role: newRole });
    setBusy(false);
    onSave();
    onClose();
  };

  const deleteUser = async () => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return;
    await api.delete(`/admin/users/${userId}`);
    onSave();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'oklch(0.15 0.014 265)', border: '1px solid var(--line)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 620, maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20 }}>User Detail</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
        {data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
              {[['Name', data.user.name || '—'], ['Email', data.user.email], ['Phone', data.user.phone || '—'], ['Role', data.user.role], ['Joined', formatDate(data.user.createdAt)]].map(([k, v]) => (
                <div key={k} style={{ background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Recent Orders ({data.orders.length})</h3>
            <div style={{ background: 'oklch(0.12 0.012 265)', borderRadius: 10, overflow: 'hidden', marginBottom: 18 }}>
              <table className="table">
                <thead><tr><th>Ref</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {data.orders.slice(0, 10).map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{o.reference}</td>
                      <td style={{ fontWeight: 700 }}>{money(o.total)}</td>
                      <td><span style={{ ...statusStyle(o.status), fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>{o.status}</span></td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                  {!data.orders.length && <tr><td colSpan={4} style={{ color: 'var(--muted)', textAlign: 'center', padding: 16 }}>No orders</td></tr>}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {data.activity.slice(0, 8).map((a) => (
                <div key={a._id} style={{ display: 'flex', justifyContent: 'space-between', background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{a.action}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(a.createdAt)}</span>
                </div>
              ))}
              {!data.activity.length && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No activity recorded</p>}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={toggleRole} disabled={busy} style={{ flex: 1 }}>
                {data.user.role === 'admin' ? '⬇ Demote to User' : '⬆ Promote to Admin'}
              </button>
              <button className="btn btn-danger" onClick={deleteUser} style={{ flex: 1 }}>
                🗑 Delete User
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function UsersManager() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const { data, loading, error, reload } = useApi(
    `/admin/users?page=${page}&limit=30${role ? `&role=${role}` : ''}${search ? `&search=${search}` : ''}`,
    { deps: [page, role, search] }
  );

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Users</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{data?.total || 0} registered users</p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {['', 'user', 'admin'].map((r) => (
          <button key={r || 'all'} onClick={() => { setRole(r); setPage(1); }} className={role === r ? 'chip active' : 'chip'}>
            {r || 'All'}
          </button>
        ))}
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name / email…"
          style={{ marginLeft: 'auto', width: 220, padding: '9px 14px', borderRadius: 10, fontSize: 13, background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)', color: 'var(--text)' }} />
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && (
        <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Orders</th><th>Spent</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {(data?.users || []).map((u) => (
                <tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(u._id)}>
                  <td style={{ fontWeight: 600, fontSize: 14 }}>{u.name || '—'}</td>
                  <td style={{ fontSize: 13 }}>{u.email}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.phone || '—'}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                      background: u.role === 'admin' ? 'oklch(0.82 0.18 65 / 0.18)' : 'oklch(0.6 0.18 250 / 0.18)',
                      color: u.role === 'admin' ? 'oklch(0.9 0.14 70)' : 'var(--accent)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{u.orders}</td>
                  <td style={{ fontWeight: 700, color: 'var(--good)' }}>{money(u.spent)}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(u._id); }}>View</button></td>
                </tr>
              ))}
              {!data?.users?.length && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 30 }}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {data?.total > 30 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: 'var(--muted)', fontSize: 13, lineHeight: '36px' }}>Page {page} of {Math.ceil(data.total / 30)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(data.total / 30)} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {selected && <UserModal userId={selected} onClose={() => setSelected(null)} onSave={reload} />}
    </>
  );
}

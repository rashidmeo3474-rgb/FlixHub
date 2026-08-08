import { useState, useCallback } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { formatDate } from '../utils/format.js';

/* ─────────────────────────────────────────────────
   CONSTANTS & TINY HELPERS
───────────────────────────────────────────────── */
const ACCOUNT_STATUS_STYLE = {
  active:        { bg: 'oklch(0.72 0.16 150 / 0.18)', color: 'var(--good)' },
  expiring_soon: { bg: 'oklch(0.7 0.19 60 / 0.18)',  color: 'var(--warn)' },
  expired:       { bg: 'oklch(0.65 0.22 25 / 0.18)', color: 'var(--bad)'  },
  disabled:      { bg: 'oklch(0.5 0.01 265 / 0.18)', color: 'var(--muted)'},
};

const SUB_STATUS_STYLE = {
  active:        { bg: 'oklch(0.72 0.16 150 / 0.18)', color: 'var(--good)' },
  expiring_soon: { bg: 'oklch(0.7 0.19 60 / 0.18)',  color: 'var(--warn)' },
  expiring_today:{ bg: 'oklch(0.65 0.22 25 / 0.18)', color: 'var(--bad)'  },
  urgent:        { bg: 'oklch(0.65 0.22 25 / 0.18)', color: 'var(--bad)'  },
  expired:       { bg: 'oklch(0.65 0.22 25 / 0.18)', color: 'var(--bad)'  },
  cancelled:     { bg: 'oklch(0.5 0.01 265 / 0.18)', color: 'var(--muted)'},
};

const fmtDate  = (d) => d ? formatDate(d) : '—';
const daysLeft = (d) => d ? Math.ceil((new Date(d) - Date.now()) / 86400000) : null;

const StatusBadge = ({ status, map }) => {
  const s = (map || ACCOUNT_STATUS_STYLE)[status] || ACCOUNT_STATUS_STYLE.active;
  return (
    <span style={{ ...s, fontSize: 11, fontWeight: 800, padding: '3px 9px',
      borderRadius: 6, whiteSpace: 'nowrap' }}>
      {status?.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

const ProviderExpiryCell = ({ date, status }) => {
  const days = daysLeft(date);
  return (
    <div>
      <div style={{ fontSize: 13 }}>{fmtDate(date)}</div>
      {days !== null && (
        <div style={{ fontSize: 11, color: days < 0 ? 'var(--bad)' : days <= 7 ? 'var(--warn)' : 'var(--muted)', marginTop: 2 }}>
          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)',
    marginBottom: 10, marginTop: 4 }}>
    {children}
  </h3>
);

const FieldRow = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: 'var(--muted)' }}>{label}</span>
    <div style={{ fontSize: 14 }}>{children}</div>
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)',
    borderRadius: 14, ...style }}>
    {children}
  </div>
);

const Modal = ({ onClose, children, maxWidth = 560 }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.72)', zIndex: 120,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    onClick={onClose}>
    <div style={{ background: 'oklch(0.15 0.014 265)', border: '1px solid var(--line)',
      borderRadius: 16, padding: 28, width: '100%', maxWidth, maxHeight: '92vh', overflowY: 'auto' }}
      onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
    <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 19, fontWeight: 700 }}>{title}</h2>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)',
      fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
  </div>
);

/* ─────────────────────────────────────────────────
   PASSWORD REVEAL CELL
───────────────────────────────────────────────── */
function PasswordCell({ password }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13 }}>
        {revealed ? password : '••••••••'}
      </span>
      <button onClick={() => setRevealed(r => !r)}
        style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 6,
          color: 'var(--muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          padding: '2px 8px' }}>
        {revealed ? 'Hide' : 'Reveal'}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ADD / EDIT ACCOUNT MODAL
───────────────────────────────────────────────── */
function AccountFormModal({ account, products, onClose, onDone }) {
  const editing = Boolean(account?._id);

  const [form, setForm] = useState({
    productId:          account?.product?._id || account?.product || '',
    plan:               account?.plan || '',
    login:              account?.login || '',
    password:           account?.password || '',
    purchaseDate:       account?.purchaseDate ? account.purchaseDate.slice(0, 10) : '',
    providerExpiryDate: account?.providerExpiryDate ? account.providerExpiryDate.slice(0, 10) : '',
    totalSlots:         account?.totalSlots ?? 1,
    accountStatus:      account?.accountStatus || 'active',
    note:               account?.note || '',
  });

  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.productId) return setErr('Select a service');
    if (!form.login)     return setErr('Account email / login is required');
    if (!form.password)  return setErr('Password is required');
    setBusy(true); setErr('');
    try {
      if (editing) {
        await api.patch(`/subscriptions/admin/inventory/accounts/${account._id}`, form);
      } else {
        await api.post('/subscriptions/admin/inventory/accounts', form);
      }
      onDone(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <Modal onClose={onClose} maxWidth={540}>
      <ModalHeader title={editing ? 'Edit Account' : 'Add Full Account'} onClose={onClose} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label className="label">Service</label>
          <select value={form.productId} onChange={e => set('productId', e.target.value)} disabled={editing}>
            <option value="">— select service —</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Plan <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(e.g. Premium, Standard)</span></label>
          <input value={form.plan} onChange={e => set('plan', e.target.value)} placeholder="Premium" />
        </div>
        <div className="field">
          <label className="label">Account Email / Username</label>
          <input value={form.login} onChange={e => set('login', e.target.value)} placeholder="account@email.com" />
        </div>
        <div className="field">
          <label className="label">Account Password</label>
          <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
            placeholder={editing ? 'Leave blank to keep current' : 'Password'} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="label">Purchase Date</label>
            <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Provider Expiry</label>
            <input type="date" value={form.providerExpiryDate} onChange={e => set('providerExpiryDate', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="label">Total Slots / Capacity</label>
            <input type="number" min="1" max="50" value={form.totalSlots} onChange={e => set('totalSlots', e.target.value)} />
          </div>
          {editing && (
            <div className="field">
              <label className="label">Account Status</label>
              <select value={form.accountStatus} onChange={e => set('accountStatus', e.target.value)}>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          )}
        </div>
        <div className="field">
          <label className="label">Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
          <input value={form.note} onChange={e => set('note', e.target.value)} placeholder="Optional admin note…" />
        </div>
      </div>
      {err && <div className="alert alert-error" style={{ marginTop: 14 }}>{err}</div>}
      <button className="btn btn-block" style={{ marginTop: 18 }} onClick={submit} disabled={busy}>
        {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Account'}
      </button>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────
   ASSIGN SLOT MODAL (direct inventory assignment)
───────────────────────────────────────────────── */
function AssignSlotModal({ slot, onClose, onDone }) {
  const { data: usersData, loading: usersLoading } = useApi('/admin/users?limit=200');
  const [userId,             setUserId]             = useState('');
  const [customerStartDate,  setStartDate]          = useState(new Date().toISOString().slice(0, 10));
  const [customerExpiryDate, setExpiryDate]         = useState('');
  const [adminNotes,         setNotes]              = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const users = (usersData?.users || []).filter(u => u.role === 'user');

  const submit = async () => {
    if (!userId)              return setErr('Select a customer');
    if (!customerExpiryDate)  return setErr('Customer expiry date is required');
    setBusy(true); setErr('');
    try {
      await api.post('/subscriptions/admin/inventory/assign-slot', {
        accountId: slot.accountId,
        slotIndex: slot.slotIndex,
        userId, customerStartDate, customerExpiryDate, adminNotes,
      });
      onDone(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <Modal onClose={onClose} maxWidth={460}>
      <ModalHeader title="Assign Slot to Customer" onClose={onClose} />

      <div style={{ background: 'oklch(0.11 0.012 265)', borderRadius: 10,
        padding: '12px 16px', marginBottom: 18, fontSize: 13 }}>
        <div style={{ fontWeight: 700 }}>{slot.product?.name}</div>
        <div style={{ color: 'var(--muted)', marginTop: 3 }}>
          Account #{slot.accountSeq} · {slot.slotLabel}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>
          Provider Expiry: {fmtDate(slot.providerExpiryDate)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="field">
          <label className="label">Customer</label>
          {usersLoading
            ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Loading customers…</p>
            : <select value={userId} onChange={e => setUserId(e.target.value)}>
                <option value="">— select customer —</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name || u.email} ({u.email})</option>
                ))}
              </select>
          }
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="label">Customer Start Date</label>
            <input type="date" value={customerStartDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Customer Expiry Date</label>
            <input type="date" value={customerExpiryDate} onChange={e => setExpiryDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label">Notes <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></label>
          <input value={adminNotes} onChange={e => setNotes(e.target.value)} placeholder="Optional note…" />
        </div>
      </div>

      {err && <div className="alert alert-error" style={{ marginTop: 12 }}>{err}</div>}
      <button className="btn btn-block" style={{ marginTop: 18 }} onClick={submit} disabled={busy}>
        {busy ? 'Assigning…' : 'Confirm Assignment'}
      </button>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────
   ACCOUNT DETAIL MODAL
───────────────────────────────────────────────── */
function AccountDetailModal({ accountId, onClose, onEdit, onReload }) {
  const { data, loading, reload } = useApi(`/subscriptions/admin/inventory/accounts/${accountId}`);
  const acc = data?.account;
  const [assignSlot, setAssignSlot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete this account? This cannot be undone.')) return;
    setBusy(true); setErr('');
    try {
      await api.delete(`/subscriptions/admin/inventory/accounts/${accountId}`);
      onReload(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  if (loading || !acc) return (
    <Modal onClose={onClose} maxWidth={640}>
      <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>Loading…</p>
    </Modal>
  );

  const acStyle = ACCOUNT_STATUS_STYLE[acc.accountStatus] || ACCOUNT_STATUS_STYLE.active;

  return (
    <Modal onClose={onClose} maxWidth={680}>
      <ModalHeader title={`${acc.product?.name} — Account Detail`} onClose={onClose} />

      {/* Top detail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 10, marginBottom: 18 }}>
        {[
          ['Service',   acc.product?.name],
          ['Plan',      acc.plan || '—'],
          ['Purchase Date', fmtDate(acc.purchaseDate)],
          ['Total Slots', acc.totalSlots],
          ['Occupied',  acc.occupied],
          ['Available', acc.available],
        ].map(([k, v]) => (
          <div key={k} style={{ background: 'oklch(0.11 0.012 265)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{k}</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Credentials */}
      <div style={{ background: 'oklch(0.1 0.01 265)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 10 }}>Account Credentials</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <FieldRow label="Email / Login">
            <span style={{ fontFamily: 'ui-monospace,monospace' }}>{acc.login}</span>
          </FieldRow>
          <FieldRow label="Password">
            <PasswordCell password={acc.password} />
          </FieldRow>
        </div>
      </div>

      {/* Provider expiry + status */}
      <div style={{ background: 'oklch(0.1 0.01 265)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: 10 }}>Provider Subscription</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
          <FieldRow label="Provider Expiry">
            <ProviderExpiryCell date={acc.providerExpiryDate} status={acc.accountStatus} />
          </FieldRow>
          <FieldRow label="Account Status">
            <StatusBadge status={acc.accountStatus} />
          </FieldRow>
        </div>
      </div>

      {acc.note && (
        <div style={{ background: 'oklch(0.1 0.01 265)', borderRadius: 10,
          padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--muted)' }}>
          📝 {acc.note}
        </div>
      )}

      {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>{err}</div>}

      {/* Slots grid */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase',
        letterSpacing: '0.07em', marginBottom: 10 }}>Slots ({acc.totalSlots})</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, marginBottom: 20 }}>
        {(acc.slots || []).map(sl => {
          const free = sl.status === 'available';
          const sub  = sl.subscription;
          return (
            <div key={sl.index} style={{
              background: free ? 'oklch(0.72 0.16 150 / 0.09)' : 'oklch(0.6 0.18 250 / 0.09)',
              border: `1px solid ${free ? 'oklch(0.72 0.16 150 / 0.3)' : 'oklch(0.6 0.18 250 / 0.3)'}`,
              borderRadius: 10, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: free ? 0 : 8 }}>
                <strong style={{ fontSize: 13 }}>{sl.label || `Slot ${sl.index}`}</strong>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
                  background: free ? 'oklch(0.72 0.16 150 / 0.2)' : 'oklch(0.6 0.18 250 / 0.2)',
                  color: free ? 'var(--good)' : 'var(--accent)',
                }}>{free ? 'AVAILABLE' : 'OCCUPIED'}</span>
              </div>
              {!free && sub && (
                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ fontWeight: 600 }}>{sub.customerName}</div>
                  <div style={{ color: 'var(--muted)' }}>Start: {fmtDate(sub.startDate)}</div>
                  <div style={{ color: 'var(--muted)' }}>Expiry: {fmtDate(sub.expiryDate)}</div>
                  <StatusBadge status={sub.status} map={SUB_STATUS_STYLE} />
                </div>
              )}
              {free && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%', fontSize: 12 }}
                  onClick={() => setAssignSlot({
                    accountId: acc._id, accountSeq: 1, slotIndex: sl.index,
                    slotLabel: sl.label || `Slot ${sl.index}`,
                    product: acc.product, providerExpiryDate: acc.providerExpiryDate,
                  })}>
                  Assign Customer
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { onEdit(acc); onClose(); }}>
          ✏️ Edit Account
        </button>
        <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleDeleteAccount} disabled={busy}>
          {busy ? 'Deleting…' : '🗑 Delete Account'}
        </button>
      </div>

      {assignSlot && (
        <AssignSlotModal
          slot={assignSlot}
          onClose={() => setAssignSlot(null)}
          onDone={() => { reload(); onReload(); }}
        />
      )}
    </Modal>
  );
}

/* ─────────────────────────────────────────────────
   TAB: OVERVIEW
───────────────────────────────────────────────── */
function OverviewTab({ summary, loading, error }) {
  if (loading) return <p style={{ color: 'var(--muted)', padding: 20 }}>Loading…</p>;
  if (error)   return <div className="alert alert-error">{error}</div>;
  const inv = summary?.inventory || [];

  return (
    <>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>
        Service-wise summary of all purchased accounts and slot availability.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {inv.map(row => {
          const accent = row.product.accent || 'var(--accent)';
          const pct = row.totalSlots > 0 ? Math.round((row.occupied / row.totalSlots) * 100) : 0;
          return (
            <Card key={row.product._id} style={{ overflow: 'hidden' }}>
              <div style={{ height: 3, background: `linear-gradient(90deg,${accent},${accent}66)` }} />
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18 }}>
                    {row.product.name}
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {[
                      ['Full Accounts', row.totalAccounts, 'var(--text)'],
                      ['Total Slots',   row.totalSlots,   'var(--text)'],
                      ['Occupied',      row.occupied,     'var(--accent)'],
                      ['Available',     row.available,    'var(--good)'],
                    ].map(([lbl, val, color]) => (
                      <div key={lbl} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                          fontSize: 24, color }}>{val}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Utilisation bar */}
                <div style={{ background: 'oklch(1 0 0 / 0.07)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`,
                    background: `linear-gradient(90deg,${accent},${accent}aa)`,
                    transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{pct}% utilised</div>

                {/* Per-account mini-rows */}
                {row.accounts.length > 0 && (
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {row.accounts.map((a, i) => {
                      const as = ACCOUNT_STATUS_STYLE[a.accountStatus] || ACCOUNT_STATUS_STYLE.active;
                      return (
                        <div key={a._id} style={{ display: 'flex', alignItems: 'center',
                          gap: 10, flexWrap: 'wrap', fontSize: 13,
                          background: 'oklch(0.11 0.012 265)', borderRadius: 8, padding: '8px 12px' }}>
                          <span style={{ fontWeight: 700, minWidth: 120 }}>Account #{String(i + 1).padStart(3, '0')}</span>
                          <span style={{ color: 'var(--muted)', fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>
                            {a.login}
                          </span>
                          {a.plan && <span style={{ color: 'var(--muted)' }}>{a.plan}</span>}
                          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <ProviderExpiryCell date={a.providerExpiryDate} status={a.accountStatus} />
                            <span style={{ ...as, fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5 }}>
                              {a.accountStatus?.replace(/_/g,' ').toUpperCase()}
                            </span>
                            <span style={{ color: 'var(--good)', fontWeight: 700 }}>{a.available} free</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{a.occupied} used</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {row.accounts.length === 0 && (
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>No accounts added yet.</div>
                )}
              </div>
            </Card>
          );
        })}
        {inv.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
            No inventory yet. Add accounts via the Accounts tab.
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────
   TAB: ACCOUNTS
───────────────────────────────────────────────── */
function AccountsTab({ onEdit, onView, reload, products }) {
  const [productFilter, setProductFilter]       = useState('');
  const [statusFilter,  setStatusFilter]        = useState('');
  const [search,        setSearch]              = useState('');

  const qStr = [
    productFilter ? `productId=${productFilter}` : '',
    statusFilter  ? `accountStatus=${statusFilter}` : '',
    search        ? `search=${encodeURIComponent(search)}` : '',
  ].filter(Boolean).join('&');

  const { data, loading, error, reload: reloadLocal } = useApi(
    `/subscriptions/admin/inventory/accounts${qStr ? `?${qStr}` : ''}`,
    { deps: [productFilter, statusFilter, search] }
  );

  const doReload = useCallback(() => { reloadLocal(); reload(); }, [reloadLocal, reload]);

  const accounts = data?.accounts || [];

  return (
    <>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <button className={!productFilter ? 'chip active' : 'chip'} onClick={() => setProductFilter('')}>
          All Services
        </button>
        {products.map(p => (
          <button key={p._id}
            className={productFilter === p._id ? 'chip active' : 'chip'}
            onClick={() => setProductFilter(p._id)}>
            {p.name}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, fontSize: 13,
              background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)',
              color: 'var(--text)', cursor: 'pointer' }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search login, service, plan…"
            style={{ padding: '8px 14px', borderRadius: 9, fontSize: 13, width: 230,
              background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)', color: 'var(--text)' }} />
        </div>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && accounts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          No accounts found. Use "Add Account" to add your first purchased subscription.
        </div>
      )}

      {!loading && accounts.length > 0 && (
        // Group accounts by product
        (() => {
          const groups = {};
          accounts.forEach(a => {
            const pid = a.product?._id || 'unknown';
            if (!groups[pid]) groups[pid] = { product: a.product, accounts: [] };
            groups[pid].accounts.push(a);
          });
          return Object.values(groups).map(g => (
            <div key={g.product?._id || 'u'} style={{ marginBottom: 28 }}>
              <SectionTitle>{g.product?.name || 'Unknown Service'}</SectionTitle>
              <Card style={{ overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Login / Email</th>
                      <th>Plan</th>
                      <th>Provider Expiry</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Slots</th>
                      <th style={{ textAlign: 'center' }}>Free</th>
                      <th style={{ textAlign: 'center' }}>Used</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.accounts.map((a, i) => (
                      <tr key={a._id} style={{ cursor: 'pointer' }} onClick={() => onView(a._id)}>
                        <td style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 13 }}>
                          #{String(i + 1).padStart(3, '0')}
                        </td>
                        <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 13 }}>{a.login}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 13 }}>{a.plan || '—'}</td>
                        <td><ProviderExpiryCell date={a.providerExpiryDate} status={a.accountStatus} /></td>
                        <td><StatusBadge status={a.accountStatus} /></td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{a.totalSlots}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--good)' }}>{a.available}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{a.occupied}</td>
                        <td onClick={e => e.stopPropagation()}>
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => onEdit(a)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          ));
        })()
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────
   TAB: AVAILABLE SLOTS
───────────────────────────────────────────────── */
function AvailableSlotsTab({ products, onAssigned }) {
  const [productFilter, setProductFilter] = useState('');
  const [assignSlot,    setAssignSlot]    = useState(null);

  const qStr = productFilter ? `?productId=${productFilter}` : '';
  const { data, loading, error, reload } = useApi(
    `/subscriptions/admin/inventory/available${qStr}`,
    { deps: [productFilter] }
  );

  const slots = data?.slots || [];

  // Group by product
  const grouped = slots.reduce((m, s) => {
    const pid = String(s.product?._id || 'unknown');
    if (!m[pid]) m[pid] = { product: s.product, slots: [] };
    m[pid].slots.push(s);
    return m;
  }, {});

  return (
    <>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>
        All available (unoccupied) slots across every service. Click "Assign" to assign a customer immediately.
      </p>

      {/* Service filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <button className={!productFilter ? 'chip active' : 'chip'} onClick={() => setProductFilter('')}>
          All Services
        </button>
        {products.map(p => (
          <button key={p._id}
            className={productFilter === p._id ? 'chip active' : 'chip'}
            onClick={() => setProductFilter(p._id)}>
            {p.name}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && slots.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
          No available slots found for the selected filter.
        </div>
      )}

      {!loading && Object.values(grouped).map(g => (
        <div key={g.product?._id || 'u'} style={{ marginBottom: 24 }}>
          <SectionTitle>{g.product?.name || 'Unknown Service'}</SectionTitle>
          <Card style={{ overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Login</th>
                  <th>Slot</th>
                  <th>Provider Expiry</th>
                  <th>Account Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {g.slots.map(s => (
                  <tr key={`${s.accountId}-${s.slotIndex}`}>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>
                      Account #{String(s.accountSeq).padStart(3, '0')}
                    </td>
                    <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--muted)' }}>
                      {s.accountLogin}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ background: 'oklch(0.72 0.16 150 / 0.15)',
                        color: 'var(--good)', fontSize: 12, fontWeight: 800,
                        padding: '3px 9px', borderRadius: 6 }}>
                        {s.slotLabel}
                      </span>
                    </td>
                    <td><ProviderExpiryCell date={s.providerExpiryDate} status={s.accountStatus} /></td>
                    <td><StatusBadge status={s.accountStatus} /></td>
                    <td>
                      <button className="btn btn-sm" onClick={() => setAssignSlot(s)}>
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      ))}

      {assignSlot && (
        <AssignSlotModal
          slot={assignSlot}
          onClose={() => setAssignSlot(null)}
          onDone={() => { reload(); onAssigned(); }}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────────── */
const TABS = [
  { id: 'overview',        icon: '📊', label: 'Overview'        },
  { id: 'accounts',        icon: '🗂️',  label: 'Accounts'        },
  { id: 'available-slots', icon: '✅', label: 'Available Slots' },
];

export default function SubscriptionInventory() {
  const [activeTab,   setActiveTab]   = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);    // account object to edit
  const [viewId,      setViewId]      = useState(null);    // accountId to open detail modal

  // Summary for Overview tab + product list for filters/forms
  const { data: summaryData, loading: sumLoading, error: sumError, reload: reloadSummary } =
    useApi('/subscriptions/admin/inventory/summary');

  const products = (summaryData?.inventory || []).map(row => row.product);

  const handleDone = () => {
    reloadSummary();
  };

  return (
    <>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>
              Subscription Inventory
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
              Manage purchased full accounts, configure slots, and assign customers
            </p>
          </div>
          <button className="btn" onClick={() => setShowAddForm(true)}>
            ＋ Add Account
          </button>
        </div>
      </div>

      {/* Quick summary strip */}
      {!sumLoading && summaryData && (() => {
        const inv = summaryData.inventory || [];
        const totAccounts = inv.reduce((s, r) => s + r.totalAccounts, 0);
        const totSlots    = inv.reduce((s, r) => s + r.totalSlots, 0);
        const totOccupied = inv.reduce((s, r) => s + r.occupied, 0);
        const totFree     = inv.reduce((s, r) => s + r.available, 0);
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 10, marginBottom: 24 }}>
            {[
              ['Accounts',      totAccounts, 'var(--text)'],
              ['Total Slots',   totSlots,    'var(--text)'],
              ['Available',     totFree,     'var(--good)'],
              ['Occupied',      totOccupied, 'var(--accent)'],
            ].map(([lbl, val, color]) => (
              <div key={lbl} style={{ background: 'oklch(0.14 0.014 265)',
                border: '1px solid var(--line)', borderRadius: 12,
                padding: '14px 18px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
                  fontSize: 26, color }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{lbl}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '9px 20px', borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: 700, fontSize: 13.5, border: '1.5px solid',
            borderColor: activeTab === t.id ? 'transparent' : 'var(--line)',
            background: activeTab === t.id
              ? 'linear-gradient(oklch(0.18 0.02 265),oklch(0.18 0.02 265)) padding-box, linear-gradient(135deg,var(--accent),var(--accent-2)) border-box'
              : 'oklch(0.11 0.012 265)',
            color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <OverviewTab summary={summaryData} loading={sumLoading} error={sumError} />
      )}
      {activeTab === 'accounts' && (
        <AccountsTab
          products={products}
          onEdit={acc => setEditAccount(acc)}
          onView={id => setViewId(id)}
          reload={handleDone}
        />
      )}
      {activeTab === 'available-slots' && (
        <AvailableSlotsTab
          products={products}
          onAssigned={handleDone}
        />
      )}

      {/* Add / Edit modal */}
      {(showAddForm || editAccount) && (
        <AccountFormModal
          account={editAccount || null}
          products={products}
          onClose={() => { setShowAddForm(false); setEditAccount(null); }}
          onDone={handleDone}
        />
      )}

      {/* Account detail modal */}
      {viewId && (
        <AccountDetailModal
          accountId={viewId}
          onClose={() => setViewId(null)}
          onEdit={acc => { setViewId(null); setEditAccount(acc); }}
          onReload={handleDone}
        />
      )}
    </>
  );
}

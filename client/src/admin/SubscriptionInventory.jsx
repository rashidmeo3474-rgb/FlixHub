import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';

/* ─────────────────── helpers ─────────────────── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
const daysLeft = (d) => d ? Math.ceil((new Date(d) - Date.now()) / 86400000) : null;

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
};

/* ─────────────────── Add Account Modal ─────────────────── */
function AddAccountModal({ products, onClose, onDone }) {
  const [form, setForm] = useState({
    productId: '', plan: '', login: '', password: '',
    purchaseDate: '', providerExpiryDate: '', totalSlots: 1, note: '',
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await api.post('/subscriptions/admin/inventory/accounts', {
        ...form,
        totalSlots: Number(form.totalSlots),
      });
      onDone(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:19 }}>Add Full Purchased Account</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Service *</label>
            <select value={form.productId} onChange={set('productId')}>
              <option value="">— select service —</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.quality})</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Plan</label>
            <input value={form.plan} onChange={set('plan')} placeholder="e.g. Premium, Standard…" />
          </div>
          <div className="field">
            <label className="label">Total Capacity (Slots) *</label>
            <input type="number" min="1" max="100" value={form.totalSlots} onChange={set('totalSlots')} />
          </div>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Account Email / Username *</label>
            <input value={form.login} onChange={set('login')} placeholder="account@example.com" />
          </div>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Account Password *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
          </div>
          <div className="field">
            <label className="label">Purchase Date</label>
            <input type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
          </div>
          <div className="field">
            <label className="label">Provider Expiry Date</label>
            <input type="date" value={form.providerExpiryDate} onChange={set('providerExpiryDate')} />
          </div>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Notes (optional)</label>
            <textarea value={form.note} onChange={set('note')} style={{ minHeight:60, resize:'vertical' }} placeholder="Optional admin note…" />
          </div>
        </div>

        {err && <div className="alert alert-error" style={{ marginTop:12 }}>{err}</div>}
        <button className="btn btn-block" style={{ marginTop:16 }} onClick={submit}
          disabled={busy || !form.productId || !form.login || !form.password}>
          {busy ? 'Adding…' : 'Add Account to Inventory'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── Edit Account Modal ─────────────────── */
function EditAccountModal({ account, products, onClose, onDone }) {
  const [form, setForm] = useState({
    productId:          account.product?._id || account.product || '',
    plan:               account.plan || '',
    login:              account.login || '',
    password:           account.password || '',
    purchaseDate:       account.purchaseDate ? account.purchaseDate.slice(0,10) : '',
    providerExpiryDate: account.providerExpiryDate ? account.providerExpiryDate.slice(0,10) : '',
    totalSlots:         account.totalSlots || 1,
    note:               account.note || '',
    accountStatus:      account.accountStatus || 'active',
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await api.patch(`/subscriptions/admin/inventory/accounts/${account._id}`, {
        ...form,
        totalSlots: Number(form.totalSlots),
      });
      onDone(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:200,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:19 }}>Edit Account</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Service</label>
            <select value={form.productId} onChange={set('productId')}>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.quality})</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Plan</label>
            <input value={form.plan} onChange={set('plan')} />
          </div>
          <div className="field">
            <label className="label">Total Capacity (Slots)</label>
            <input type="number" min="1" max="100" value={form.totalSlots} onChange={set('totalSlots')} />
            <span style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Reducing while slots are occupied will be blocked.</span>
          </div>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Account Email / Username</label>
            <input value={form.login} onChange={set('login')} />
          </div>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Account Password</label>
            <input type="password" value={form.password} onChange={set('password')} />
          </div>
          <div className="field">
            <label className="label">Purchase Date</label>
            <input type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
          </div>
          <div className="field">
            <label className="label">Provider Expiry</label>
            <input type="date" value={form.providerExpiryDate} onChange={set('providerExpiryDate')} />
          </div>
          <div className="field">
            <label className="label">Account Status</label>
            <select value={form.accountStatus} onChange={set('accountStatus')}>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div className="field" style={{ gridColumn:'1 / -1' }}>
            <label className="label">Notes</label>
            <textarea value={form.note} onChange={set('note')} style={{ minHeight:60, resize:'vertical' }} />
          </div>
        </div>

        {err && <div className="alert alert-error" style={{ marginTop:12 }}>{err}</div>}
        <button className="btn btn-block" style={{ marginTop:16 }} onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── Assign Slot Modal ─────────────────── */
function AssignSlotModal({ slot, account, onClose, onDone }) {
  const [userId,    setUserId]    = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0,10));
  const [expiry,    setExpiry]    = useState('');
  const [notes,     setNotes]     = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const submit = async () => {
    if (!userId.trim() || !expiry) return setErr('Customer email/ID and expiry date are required');
    setBusy(true); setErr('');
    try {
      // First look up user by email if not ObjectId
      let resolvedUserId = userId.trim();
      if (!userId.match(/^[0-9a-f]{24}$/i)) {
        const { data } = await api.get(`/admin/users?search=${encodeURIComponent(userId)}&limit=1`);
        const found = data?.users?.[0];
        if (!found) return setErr(`No customer found with email: ${userId}`), setBusy(false);
        resolvedUserId = found._id;
      }
      await api.post('/subscriptions/admin/inventory/assign-slot', {
        accountId:           account._id,
        slotIndex:           slot.index,
        userId:              resolvedUserId,
        customerStartDate:   startDate,
        customerExpiryDate:  expiry,
        adminNotes:          notes,
      });
      onDone(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:300,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:460 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18 }}>Assign Customer to Slot</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
          <strong>{account.product?.name}</strong> · {account.login}<br />
          <span style={{ color:'var(--muted)' }}>{slot.label || `Profile ${slot.index}`} — AVAILABLE</span>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="field">
            <label className="label">Customer Email or ID *</label>
            <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="customer@email.com" />
          </div>
          <div className="field">
            <label className="label">Customer Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Customer Expiry Date *</label>
            <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Admin Notes (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional note…" />
          </div>
        </div>

        {err && <div className="alert alert-error" style={{ marginTop:12 }}>{err}</div>}
        <button className="btn btn-block" style={{ marginTop:16 }} onClick={submit} disabled={busy}>
          {busy ? 'Assigning…' : 'Confirm Assignment'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── Account Detail Card ─────────────────── */
function AccountDetailCard({ account, products, onReload }) {
  const [showPass,    setShowPass]    = useState(false);
  const [editOpen,    setEditOpen]    = useState(false);
  const [assignSlot,  setAssignSlot]  = useState(null);
  const [delBusy,     setDelBusy]     = useState(false);
  const [expanded,    setExpanded]    = useState(false);

  const ast  = ACCOUNT_STATUS_STYLE[account.accountStatus] || ACCOUNT_STATUS_STYLE.active;
  const dl   = daysLeft(account.providerExpiryDate);
  const accent = account.product?.accent || '#54d6e8';

  const deleteAccount = async () => {
    if (!confirm('Delete this account? This cannot be undone. All slots must be unassigned first.')) return;
    setDelBusy(true);
    try {
      await api.delete(`/subscriptions/admin/inventory/accounts/${account._id}`);
      onReload();
    } catch (e) { alert(e.message); }
    setDelBusy(false);
  };

  return (
    <div style={{ background:'oklch(0.13 0.013 265)', border:`1.5px solid ${accent}33`,
      borderRadius:14, overflow:'hidden', marginBottom:12 }}>
      <div style={{ height:3, background:`linear-gradient(90deg,${accent},${accent}66)` }} />
      <div style={{ padding:'16px 20px' }}>

        {/* Header row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:12 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <strong style={{ fontSize:15 }}>{account.login}</strong>
              <span style={{ ...ast, fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:5 }}>
                {account.accountStatus?.replace('_',' ').toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize:12, color:'var(--muted)', display:'flex', gap:14, flexWrap:'wrap' }}>
              {account.plan && <span>Plan: {account.plan}</span>}
              <span>Purchase: {fmtDate(account.purchaseDate)}</span>
              <span style={{ color: dl != null && dl <= 7 ? 'var(--warn)' : 'var(--muted)' }}>
                Provider Exp: {fmtDate(account.providerExpiryDate)}
                {dl != null && dl >= 0 && ` (${dl}d left)`}
                {dl != null && dl < 0 && ' ⚠ EXPIRED'}
              </span>
            </div>
          </div>

          {/* Slot counters */}
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'var(--good)' }}>{account.available}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>Free</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'var(--accent)' }}>{account.occupied}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>Used</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20 }}>{account.totalSlots}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>Total</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowPass(v => !v)}>
              {showPass ? '🙈 Hide' : '🔑 Credentials'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(v => !v)}>
              {expanded ? 'Hide Slots ▲' : 'Slots ▼'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditOpen(true)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={deleteAccount} disabled={delBusy}>Delete</button>
          </div>
        </div>

        {/* Credentials reveal */}
        {showPass && (
          <div style={{ background:'oklch(0.1 0.01 265)', borderRadius:10, padding:'12px 16px', marginBottom:12,
            fontFamily:'ui-monospace,monospace', fontSize:13, display:'flex', flexDirection:'column', gap:6 }}>
            <div>📧 {account.login}</div>
            <div>🔑 {account.password}</div>
          </div>
        )}

        {/* Slots grid */}
        {expanded && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:8, marginTop:8 }}>
            {(account.slots || []).map(sl => {
              const avail = sl.status === 'available';
              const sub   = sl.subscription;
              const ssc   = sub ? (SUB_STATUS_STYLE[sub.status] || SUB_STATUS_STYLE.active) : null;
              return (
                <div key={sl.index} style={{
                  background: avail ? 'oklch(0.72 0.16 150 / 0.07)' : 'oklch(0.6 0.18 250 / 0.07)',
                  border: `1px solid ${avail ? 'oklch(0.72 0.16 150 / 0.3)' : 'oklch(0.6 0.18 250 / 0.3)'}`,
                  borderRadius:10, padding:'12px 14px', fontSize:13,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom: avail ? 0 : 8 }}>
                    <strong>{sl.label || `Profile ${sl.index}`}</strong>
                    <span style={{
                      fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:5,
                      background: avail ? 'oklch(0.72 0.16 150 / 0.2)' : 'oklch(0.6 0.18 250 / 0.2)',
                      color: avail ? 'var(--good)' : 'var(--accent)',
                    }}>{avail ? 'AVAILABLE' : 'OCCUPIED'}</span>
                  </div>

                  {!avail && sub && (
                    <div style={{ display:'flex', flexDirection:'column', gap:3, fontSize:12, color:'var(--muted)' }}>
                      <div style={{ fontWeight:600, color:'var(--text)', fontSize:13 }}>{sub.customerName}</div>
                      <div>{sub.customerEmail}</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:2 }}>
                        <span>Start: {fmtDate(sub.startDate)}</span>
                        <span>Exp: {fmtDate(sub.expiryDate)}</span>
                      </div>
                      {ssc && (
                        <span style={{ ...ssc, fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:4, width:'fit-content', marginTop:2 }}>
                          {sub.status?.replace(/_/g,' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  {avail && (
                    <button className="btn btn-sm" style={{ marginTop:8, width:'100%', fontSize:12 }}
                      onClick={() => setAssignSlot(sl)}>
                      + Assign Customer
                    </button>
                  )}
                </div>
              );
            })}
            {account.slots?.length === 0 && (
              <p style={{ color:'var(--muted)', fontSize:13, gridColumn:'1/-1' }}>
                No slots configured. Click Edit to set capacity.
              </p>
            )}
          </div>
        )}
      </div>

      {editOpen   && <EditAccountModal account={account} products={products} onClose={() => setEditOpen(false)} onDone={onReload} />}
      {assignSlot && <AssignSlotModal  slot={assignSlot} account={account}  onClose={() => setAssignSlot(null)} onDone={onReload} />}
    </div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
export default function SubscriptionInventory() {
  const [tab,     setTab]     = useState('overview');   // overview | accounts | available
  const [service, setService] = useState('');
  const [search,  setSearch]  = useState('');
  const [statusF, setStatusF] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const { data: summaryData, loading: sumLoading, reload: reloadSum } =
    useApi('/subscriptions/admin/inventory/summary');
  const { data: accountsData, loading: accLoading, reload: reloadAcc } =
    useApi(
      `/subscriptions/admin/inventory/accounts?${[
        service ? `productId=${service}` : '',
        statusF ? `accountStatus=${statusF}` : '',
        search  ? `search=${encodeURIComponent(search)}` : '',
      ].filter(Boolean).join('&')}`,
      { deps: [service, statusF, search] }
    );
  const { data: availData, loading: availLoading, reload: reloadAvail } =
    useApi(
      `/subscriptions/admin/inventory/available${service ? `?productId=${service}` : ''}`,
      { deps: [service] }
    );

  const summary  = summaryData?.inventory || [];
  const accounts = accountsData?.accounts || [];
  const avail    = availData?.slots || [];
  const products = summary.map(s => s.product);

  const reload = () => { reloadSum(); reloadAcc(); reloadAvail(); };

  /* Group available slots by service */
  const availByService = avail.reduce((m, sl) => {
    const name = sl.product?.name || 'Unknown';
    if (!m[name]) m[name] = { product: sl.product, slots: [] };
    m[name].slots.push(sl);
    return m;
  }, {});

  /* Group accounts by service name */
  const accountsByService = accounts.reduce((m, a) => {
    const name = a.product?.name || 'Unknown';
    if (!m[name]) m[name] = { product: a.product, accounts: [] };
    m[name].accounts.push(a);
    return m;
  }, {});

  const TABS = [
    { key: 'overview',  label: '📊 Overview'         },
    { key: 'accounts',  label: '📂 Accounts'          },
    { key: 'available', label: `✅ Available (${avail.length})` },
  ];

  const STATUS_FILTERS = [
    { key: '',             label: 'All Statuses' },
    { key: 'active',       label: 'Active' },
    { key: 'expiring_soon',label: 'Expiring Soon' },
    { key: 'expired',      label: 'Expired' },
    { key: 'disabled',     label: 'Disabled' },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:14, marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:700 }}>Subscription Inventory</h1>
          <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>
            Manage purchased streaming accounts and slot allocations
          </p>
        </div>
        <button className="btn" onClick={() => setAddOpen(true)}>+ Add Account</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding:'9px 18px', borderRadius:9, cursor:'pointer', fontFamily:'inherit',
            fontWeight:700, fontSize:13.5, border:'1.5px solid',
            borderColor: tab === t.key ? 'transparent' : 'var(--line)',
            background: tab === t.key
              ? 'linear-gradient(oklch(0.18 0.02 265),oklch(0.18 0.02 265)) padding-box, linear-gradient(135deg,var(--accent),var(--accent-2)) border-box'
              : 'oklch(0.11 0.012 265)',
            color: tab === t.key ? 'var(--accent)' : 'var(--muted)',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Service filter chips */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        <button className={!service ? 'chip active' : 'chip'} onClick={() => setService('')}>All Services</button>
        {products.map(p => p && (
          <button key={p._id} className={service === p._id ? 'chip active' : 'chip'}
            onClick={() => setService(service === p._id ? '' : p._id)}>
            {p.name}
          </button>
        ))}
      </div>

      {/* ════════════════════════ OVERVIEW TAB ════════════════════════ */}
      {tab === 'overview' && (
        <>
          {sumLoading && <p style={{ color:'var(--muted)' }}>Loading…</p>}
          {summary
            .filter(s => !service || s.product?._id === service || s.product === service)
            .map(s => {
              const accent = s.product?.accent || '#54d6e8';
              const pct    = s.totalSlots > 0 ? Math.round((s.occupied / s.totalSlots) * 100) : 0;
              return (
                <div key={s.product._id} style={{
                  background:'oklch(0.13 0.013 265)',
                  border:`1.5px solid ${accent}33`,
                  borderRadius:16, overflow:'hidden', marginBottom:18,
                }}>
                  <div style={{ height:4, background:`linear-gradient(90deg,${accent},${accent}66)` }} />
                  <div style={{ padding:'18px 22px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:10 }}>
                      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700 }}>{s.product.name}</h2>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setService(s.product._id); setTab('accounts'); }}>
                        View Accounts →
                      </button>
                    </div>

                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))', gap:12, marginBottom:14 }}>
                      {[
                        { label:'Full Accounts', val: s.totalAccounts, color:'var(--text)' },
                        { label:'Total Capacity', val: s.totalSlots,   color:'var(--text)' },
                        { label:'Occupied',       val: s.occupied,     color:'var(--accent)' },
                        { label:'Available',      val: s.available,    color: s.available === 0 ? 'var(--bad)' : 'var(--good)' },
                      ].map(c => (
                        <div key={c.label} style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:700, color:c.color }}>{c.val}</div>
                          <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{c.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Utilisation bar */}
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--muted)', marginBottom:5 }}>
                        <span>Utilisation</span><span>{pct}%</span>
                      </div>
                      <div style={{ height:8, borderRadius:99, background:'oklch(1 0 0 / 0.08)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:99, width:`${pct}%`,
                          background: pct >= 90 ? 'var(--bad)' : pct >= 70 ? 'var(--warn)' : `linear-gradient(90deg,${accent},${accent}99)`,
                          transition:'width 0.5s ease',
                        }} />
                      </div>
                    </div>

                    {/* Account list inside overview */}
                    {s.accounts?.length > 0 && (
                      <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
                        {s.accounts.map((a, i) => {
                          const ast = ACCOUNT_STATUS_STYLE[a.accountStatus] || ACCOUNT_STATUS_STYLE.active;
                          return (
                            <div key={a._id} style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'10px 14px',
                              display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8, fontSize:13 }}>
                              <div>
                                <strong>Account #{i+1}</strong>
                                <span style={{ color:'var(--muted)', marginLeft:8 }}>{a.login}</span>
                                {a.plan && <span style={{ color:'var(--muted)', marginLeft:8 }}>{a.plan}</span>}
                              </div>
                              <div style={{ display:'flex', gap:14, alignItems:'center', fontSize:12, flexWrap:'wrap' }}>
                                <span style={{ color:'var(--muted)' }}>Provider Exp: {fmtDate(a.providerExpiryDate)}</span>
                                <span><span style={{ color:'var(--good)' }}>{a.available}</span> free / {a.totalSlots} total</span>
                                <span style={{ ...ast, fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:5 }}>
                                  {a.accountStatus?.replace('_',' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          {!sumLoading && summary.length === 0 && (
            <div style={{ textAlign:'center', padding:50, color:'var(--muted)' }}>
              No inventory yet. Click <strong>+ Add Account</strong> to add your first purchased account.
            </div>
          )}
        </>
      )}

      {/* ════════════════════════ ACCOUNTS TAB ════════════════════════ */}
      {tab === 'accounts' && (
        <>
          {/* Search + Status filter */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, alignItems:'center' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f.key} className={statusF === f.key ? 'chip active' : 'chip'} style={{ fontSize:12 }}
                onClick={() => setStatusF(f.key)}>{f.label}</button>
            ))}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search email / service…"
              style={{ marginLeft:'auto', width:220, padding:'8px 14px', borderRadius:10, fontSize:13,
                background:'oklch(0.14 0.014 265)', border:'1px solid var(--line)', color:'var(--text)' }} />
          </div>

          {accLoading && <p style={{ color:'var(--muted)' }}>Loading…</p>}

          {/* Grouped by service */}
          {Object.entries(accountsByService).map(([svcName, grp]) => (
            <div key={svcName} style={{ marginBottom:28 }}>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, marginBottom:12,
                color: grp.product?.accent || 'var(--text)' }}>
                {svcName}
                <span style={{ fontFamily:'inherit', fontSize:13, fontWeight:600, color:'var(--muted)', marginLeft:10 }}>
                  ({grp.accounts.length} account{grp.accounts.length !== 1 ? 's' : ''})
                </span>
              </h2>
              {grp.accounts.map(acc => (
                <AccountDetailCard key={acc._id} account={acc} products={products} onReload={reload} />
              ))}
            </div>
          ))}

          {!accLoading && accounts.length === 0 && (
            <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>
              No accounts found. Add accounts using <strong>+ Add Account</strong>.
            </div>
          )}
        </>
      )}

      {/* ════════════════════════ AVAILABLE SLOTS TAB ════════════════════════ */}
      {tab === 'available' && (
        <>
          {availLoading && <p style={{ color:'var(--muted)' }}>Loading…</p>}

          {!availLoading && avail.length === 0 && (
            <div style={{ textAlign:'center', padding:50, color:'var(--muted)' }}>
              No available slots right now. All slots are occupied or no accounts have been added yet.
            </div>
          )}

          {Object.entries(availByService).map(([svcName, grp]) => (
            <div key={svcName} style={{ marginBottom:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700,
                  color: grp.product?.accent || 'var(--text)' }}>{svcName}</h2>
                <span style={{ background:'oklch(0.72 0.16 150 / 0.18)', color:'var(--good)',
                  fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:99 }}>
                  {grp.slots.length} available
                </span>
              </div>

              <div style={{ background:'oklch(0.13 0.013 265)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden' }}>
                <table className="table">
                  <thead>
                    <tr><th>Account</th><th>Slot</th><th>Provider Expiry</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {grp.slots.map((sl, i) => {
                      const ast = ACCOUNT_STATUS_STYLE[sl.accountStatus] || ACCOUNT_STATUS_STYLE.active;
                      return (
                        <tr key={i}>
                          <td style={{ fontFamily:'ui-monospace,monospace', fontSize:13 }}>
                            Account #{sl.accountSeq} · {sl.accountLogin}
                          </td>
                          <td style={{ fontSize:13 }}>{sl.slotLabel}</td>
                          <td style={{ fontSize:12, color:'var(--muted)' }}>{fmtDate(sl.providerExpiryDate)}</td>
                          <td>
                            <span style={{ ...ast, fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:5 }}>
                              {sl.accountStatus?.replace('_',' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}

      {addOpen && <AddAccountModal products={products} onClose={() => setAddOpen(false)} onDone={reload} />}
    </>
  );
}

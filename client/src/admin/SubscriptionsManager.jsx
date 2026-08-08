import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';

const STATUS_COLORS = {
  pending_assignment: { bg: 'oklch(0.7 0.19 60 / 0.18)',   color: 'var(--warn)' },
  active:             { bg: 'oklch(0.72 0.16 150 / 0.18)',  color: 'var(--good)' },
  expiring_soon:      { bg: 'oklch(0.7 0.19 60 / 0.18)',   color: 'var(--warn)' },
  expiring_today:     { bg: 'oklch(0.65 0.22 25 / 0.18)',  color: 'var(--bad)'  },
  urgent:             { bg: 'oklch(0.65 0.22 25 / 0.18)',  color: 'var(--bad)'  },
  expired:            { bg: 'oklch(0.65 0.22 25 / 0.18)',  color: 'var(--bad)'  },
  cancelled:          { bg: 'oklch(0.5 0.01 265 / 0.18)',  color: 'var(--muted)'},
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
const remaining = (exp) => {
  if (!exp) return null;
  return Math.ceil((new Date(exp) - Date.now()) / 86400000);
};

/* ── Assign Modal ── */
function AssignModal({ order, onClose, onDone }) {
  const { data: slotsData, loading } = useApi('/subscriptions/admin/available-slots');
  const [accountId, setAccountId]   = useState('');
  const [slotIndex, setSlotIndex]   = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const slots  = slotsData?.slots || [];
  const item   = order.items?.[0];
  const months = item?.months || 1;

  // group by accountId
  const grouped = slots.reduce((m, s) => {
    const k = String(s.accountId);
    if (!m[k]) m[k] = { login: s.accountLogin, product: s.product, slots: [] };
    m[k].slots.push(s);
    return m;
  }, {});

  const submit = async () => {
    if (!accountId || !slotIndex) return setErr('Select an account and slot');
    setBusy(true); setErr('');
    try {
      await api.post('/subscriptions/admin/assign', {
        orderId: order._id, accountId, slotIndex: Number(slotIndex),
        productId: item?.product?._id || item?.product,
        months,
      });
      onDone();
      onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:500 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:19 }}>Assign Subscription</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:13 }}>
          <div><strong>{order.user?.name || order.user?.email}</strong></div>
          <div style={{ color:'var(--muted)', marginTop:4 }}>{item?.name} · {months} month{months > 1 ? 's' : ''}</div>
          <div style={{ color:'var(--muted)' }}>Ref: {order.reference}</div>
        </div>

        {loading && <p style={{ color:'var(--muted)' }}>Loading slots…</p>}

        {!loading && slots.length === 0 && (
          <div className="alert alert-error">No available slots found. Add stock first.</div>
        )}

        {!loading && slots.length > 0 && (
          <>
            <div className="field" style={{ marginBottom:12 }}>
              <label className="label">Select Account</label>
              <select value={accountId} onChange={e => { setAccountId(e.target.value); setSlotIndex(''); }}>
                <option value="">— choose account —</option>
                {Object.entries(grouped).map(([id, grp]) => (
                  <option key={id} value={id}>{grp.product?.name} · {grp.login} ({grp.slots.length} slot{grp.slots.length !== 1 ? 's' : ''} free)</option>
                ))}
              </select>
            </div>

            {accountId && (
              <div className="field" style={{ marginBottom:12 }}>
                <label className="label">Select Slot / Profile</label>
                <select value={slotIndex} onChange={e => setSlotIndex(e.target.value)}>
                  <option value="">— choose slot —</option>
                  {grouped[accountId]?.slots.map(s => (
                    <option key={s.slotIndex} value={s.slotIndex}>{s.slotLabel || `Profile ${s.slotIndex}`} — AVAILABLE</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {err && <div className="alert alert-error" style={{ marginBottom:12 }}>{err}</div>}
        <button className="btn btn-block" onClick={submit} disabled={busy || !accountId || !slotIndex}>
          {busy ? 'Assigning…' : 'Confirm Assignment'}
        </button>
      </div>
    </div>
  );
}

/* ── Renew Modal ── */
function RenewModal({ sub, onClose, onDone }) {
  const [days, setDays] = useState(30);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await api.patch(`/subscriptions/admin/${sub._id}/renew`, { days: Number(days), note });
      onDone(); onClose();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:420 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:19 }}>Renew Subscription</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:13 }}>
          <div><strong>{sub.user?.name || sub.user?.email}</strong> · {sub.product?.name}</div>
          <div style={{ color:'var(--muted)', marginTop:4 }}>Current expiry: {fmtDate(sub.expiryDate)}</div>
        </div>

        <div className="field" style={{ marginBottom:12 }}>
          <label className="label">Extend by (days)</label>
          <select value={days} onChange={e => setDays(e.target.value)}>
            {[7,14,30,60,90,180,365].map(d => <option key={d} value={d}>{d} days</option>)}
          </select>
        </div>
        <div className="field" style={{ marginBottom:12 }}>
          <label className="label">Note (optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Renewal note…" />
        </div>
        {err && <div className="alert alert-error" style={{ marginBottom:12 }}>{err}</div>}
        <button className="btn btn-block" onClick={submit} disabled={busy}>{busy ? 'Renewing…' : `Renew +${days} days`}</button>
      </div>
    </div>
  );
}

/* ── Detail Modal ── */
function DetailModal({ subId, onClose, onRenew }) {
  const { data, loading } = useApi(`/subscriptions/admin/${subId}`);
  const sub = data?.subscription;

  if (loading || !sub) return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', borderRadius:16, padding:40 }} onClick={e => e.stopPropagation()}>
        <p style={{ color:'var(--muted)' }}>Loading…</p>
      </div>
    </div>
  );

  const days = remaining(sub.expiryDate);
  const sc   = STATUS_COLORS[sub.status] || STATUS_COLORS.active;

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:19 }}>Subscription Detail</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
          {[
            ['Customer',  sub.user?.name || sub.user?.email || '—'],
            ['Email',     sub.user?.email || '—'],
            ['Service',   sub.product?.name || '—'],
            ['Quality',   sub.product?.quality || '—'],
            ['Account',   sub.account?.login || '—'],
            ['Slot',      sub.slotLabel || `Profile ${sub.slotIndex}` || '—'],
            ['Start',     fmtDate(sub.startDate)],
            ['Expiry',    fmtDate(sub.expiryDate)],
            ['Remaining', days != null ? `${days} day${days !== 1 ? 's' : ''}` : '—'],
            ['Order Ref', sub.order?.reference || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ background:'oklch(0.12 0.012 265)', borderRadius:8, padding:'10px 14px' }}>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{k}</div>
              <div style={{ fontSize:14 }}>{v}</div>
            </div>
          ))}
          <div style={{ background:'oklch(0.12 0.012 265)', borderRadius:8, padding:'10px 14px', gridColumn:'1 / -1' }}>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Status</div>
            <span style={{ ...sc, fontSize:12, fontWeight:800, padding:'3px 9px', borderRadius:6 }}>{sub.status.replace('_',' ').toUpperCase()}</span>
          </div>
        </div>

        {/* Account credentials */}
        {sub.account?.password && (
          <div style={{ background:'oklch(0.1 0.01 265)', borderRadius:10, padding:'12px 16px', marginBottom:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Account Credentials</div>
            <div style={{ fontFamily:'ui-monospace,monospace', fontSize:13, display:'flex', flexDirection:'column', gap:4 }}>
              <div>📧 {sub.account.login}</div>
              <div>🔑 {sub.account.password}</div>
              {sub.slotLabel && <div>👤 {sub.slotLabel}</div>}
            </div>
          </div>
        )}

        {/* Renewal history */}
        {sub.renewals?.length > 0 && (
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>Renewal History</div>
            {sub.renewals.map((r, i) => (
              <div key={i} style={{ background:'oklch(0.12 0.012 265)', borderRadius:8, padding:'8px 12px', marginBottom:6, fontSize:13, display:'flex', justifyContent:'space-between' }}>
                <span>+{r.daysAdded} days</span>
                <span style={{ color:'var(--muted)' }}>{fmtDate(r.renewedAt)} → {fmtDate(r.newExpiry)}</span>
              </div>
            ))}
          </div>
        )}

        {sub.status !== 'cancelled' && (
          <button className="btn btn-ghost" onClick={() => onRenew(sub)} style={{ width:'100%' }}>
            🔄 Renew Subscription
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function SubscriptionsManager() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [assignOrder,  setAssignOrder]  = useState(null);
  const [detailSubId,  setDetailSubId]  = useState(null);
  const [renewSub,     setRenewSub]     = useState(null);
  const [activeTab,    setActiveTab]    = useState('subscriptions'); // 'subscriptions' | 'pending'

  const { data: subData, loading: subLoading, reload: reloadSubs } = useApi(
    `/subscriptions/admin?page=${page}&limit=25${statusFilter ? `&status=${statusFilter}` : ''}${search ? `&search=${search}` : ''}`,
    { deps: [page, statusFilter, search] }
  );
  const { data: pendingData, loading: pendingLoading, reload: reloadPending } = useApi(
    '/subscriptions/admin/pending',
    { deps: [activeTab] }
  );

  const STATUS_FILTERS = ['', 'pending_assignment', 'active', 'expiring_soon', 'expiring_today', 'urgent', 'expired', 'cancelled'];

  const reload = () => { reloadSubs(); reloadPending(); };

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:700 }}>Subscriptions</h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Manage customer subscriptions and assignments</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:22 }}>
        {['subscriptions', 'pending'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding:'9px 20px', borderRadius:9, cursor:'pointer', fontFamily:'inherit',
            fontWeight:700, fontSize:13.5, border:'1.5px solid',
            borderColor: activeTab === t ? 'transparent' : 'var(--line)',
            background: activeTab === t
              ? 'linear-gradient(oklch(0.18 0.02 265),oklch(0.18 0.02 265)) padding-box, linear-gradient(135deg,var(--accent),var(--accent-2)) border-box'
              : 'oklch(0.11 0.012 265)',
            color: activeTab === t ? 'var(--accent)' : 'var(--muted)',
          }}>
            {t === 'pending'
              ? `⏳ Pending Assignment${pendingData?.orders?.length ? ` (${pendingData.orders.length})` : ''}`
              : '📋 All Subscriptions'}
          </button>
        ))}
      </div>

      {/* ── PENDING ASSIGNMENTS ── */}
      {activeTab === 'pending' && (
        <>
          {pendingLoading && <p style={{ color:'var(--muted)' }}>Loading…</p>}
          {!pendingLoading && (pendingData?.orders || []).length === 0 && (
            <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>No pending assignments 🎉</div>
          )}
          {!pendingLoading && (pendingData?.orders || []).length > 0 && (
            <div style={{ background:'oklch(0.13 0.013 265)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden' }}>
              <table className="table">
                <thead><tr><th>Order Ref</th><th>Customer</th><th>Service</th><th>Duration</th><th>Total</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {(pendingData?.orders || []).map(o => (
                    <tr key={o._id}>
                      <td style={{ fontFamily:'ui-monospace,monospace', fontSize:12 }}>{o.reference}</td>
                      <td style={{ fontSize:13 }}>{o.user?.name || o.user?.email || '—'}</td>
                      <td style={{ fontSize:13 }}>{o.items?.map(i => i.name).join(', ')}</td>
                      <td style={{ fontSize:13, color:'var(--muted)' }}>{o.items?.map(i => `${i.months}mo`).join(', ')}</td>
                      <td style={{ fontWeight:700 }}>Rs {o.total?.toLocaleString()}</td>
                      <td style={{ color:'var(--muted)', fontSize:12 }}>{fmtDate(o.createdAt)}</td>
                      <td>
                        <button className="btn btn-sm" onClick={() => setAssignOrder(o)}>Assign Slot</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── ALL SUBSCRIPTIONS ── */}
      {activeTab === 'subscriptions' && (
        <>
          {/* Filters */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14, alignItems:'center' }}>
            {STATUS_FILTERS.map(s => (
              <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={statusFilter === s ? 'chip active' : 'chip'} style={{ fontSize:12 }}>
                {s ? s.replace(/_/g,' ') : 'All'}
              </button>
            ))}
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search customer / service…"
              style={{ marginLeft:'auto', width:220, padding:'8px 14px', borderRadius:10, fontSize:13,
                background:'oklch(0.14 0.014 265)', border:'1px solid var(--line)', color:'var(--text)' }} />
          </div>

          {subLoading && <p style={{ color:'var(--muted)' }}>Loading…</p>}

          {!subLoading && (
            <div style={{ background:'oklch(0.13 0.013 265)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden' }}>
              <table className="table">
                <thead>
                  <tr><th>Customer</th><th>Service</th><th>Account</th><th>Slot</th><th>Start</th><th>Expiry</th><th>Days Left</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {(subData?.subscriptions || []).map(s => {
                    const days = remaining(s.expiryDate);
                    const sc   = STATUS_COLORS[s.status] || STATUS_COLORS.active;
                    return (
                      <tr key={s._id} style={{ cursor:'pointer' }} onClick={() => setDetailSubId(s._id)}>
                        <td style={{ fontSize:13 }}>{s.user?.name || s.user?.email || '—'}</td>
                        <td style={{ fontSize:13 }}>{s.product?.name || '—'}</td>
                        <td style={{ fontSize:12, color:'var(--muted)', fontFamily:'ui-monospace,monospace' }}>{s.account?.login?.split('@')[0] || '—'}</td>
                        <td style={{ fontSize:13 }}>{s.slotLabel || (s.slotIndex ? `Profile ${s.slotIndex}` : '—')}</td>
                        <td style={{ color:'var(--muted)', fontSize:12 }}>{fmtDate(s.startDate)}</td>
                        <td style={{ fontSize:12 }}>{fmtDate(s.expiryDate)}</td>
                        <td style={{ fontWeight:700, color: days != null && days <= 3 ? 'var(--bad)' : days != null && days <= 7 ? 'var(--warn)' : 'var(--good)' }}>
                          {days != null ? `${days}d` : '—'}
                        </td>
                        <td><span style={{ ...sc, fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:6 }}>{s.status.replace(/_/g,' ')}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setRenewSub(s); }}>Renew</button>
                        </td>
                      </tr>
                    );
                  })}
                  {!subData?.subscriptions?.length && (
                    <tr><td colSpan={9} style={{ textAlign:'center', color:'var(--muted)', padding:30 }}>No subscriptions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {subData?.total > 25 && (
            <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'center' }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>← Prev</button>
              <span style={{ color:'var(--muted)', fontSize:13, lineHeight:'36px' }}>Page {page} of {Math.ceil(subData.total / 25)}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(subData.total / 25)} onClick={() => setPage(p => p+1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {assignOrder  && <AssignModal order={assignOrder}  onClose={() => setAssignOrder(null)}  onDone={reload} />}
      {detailSubId  && <DetailModal subId={detailSubId}  onClose={() => setDetailSubId(null)}  onRenew={s => { setDetailSubId(null); setRenewSub(s); }} />}
      {renewSub     && <RenewModal  sub={renewSub}        onClose={() => setRenewSub(null)}    onDone={reload} />}
    </>
  );
}

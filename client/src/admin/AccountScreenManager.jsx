import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

function SlotBadge({ slot }) {
  const ok = slot.status === 'available';
  return (
    <div style={{
      background: ok ? 'oklch(0.72 0.16 150 / 0.12)' : 'oklch(0.6 0.18 250 / 0.12)',
      border: `1px solid ${ok ? 'oklch(0.72 0.16 150 / 0.35)' : 'oklch(0.6 0.18 250 / 0.35)'}`,
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: ok ? 0 : 6 }}>
        <strong>{slot.label || `Profile ${slot.index}`}</strong>
        <span style={{
          fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:5,
          background: ok ? 'oklch(0.72 0.16 150 / 0.2)' : 'oklch(0.6 0.18 250 / 0.2)',
          color: ok ? 'var(--good)' : 'var(--accent)',
        }}>{ok ? 'AVAILABLE' : 'ASSIGNED'}</span>
      </div>
      {!ok && slot.assignedTo && (
        <div style={{ color:'var(--muted)', fontSize:12, marginTop:4 }}>
          Assigned · {fmtDate(slot.assignedAt)}
        </div>
      )}
    </div>
  );
}

function AccountCard({ account, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const available = (account.slots || []).filter(s => s.status === 'available').length;
  const occupied  = (account.slots || []).filter(s => s.status === 'assigned').length;
  const accent    = account.product?.accent || '#54d6e8';

  return (
    <div style={{
      background:'oklch(0.13 0.013 265)', border:`1.5px solid ${accent}33`,
      borderRadius:14, overflow:'hidden', marginBottom:12,
    }}>
      {/* header strip */}
      <div style={{ height:3, background:`linear-gradient(90deg,${accent},${accent}66)` }} />
      <div style={{ padding:'14px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{account.product?.name || '—'}</div>
            <div style={{ fontFamily:'ui-monospace,monospace', fontSize:13, color:'var(--muted)', marginTop:2 }}>{account.login}</div>
          </div>
          <div style={{ display:'flex', gap:20, alignItems:'center' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'var(--good)' }}>{available}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>free</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:'var(--accent)' }}>{occupied}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>used</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20 }}>{account.totalSlots || 0}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>total</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(account)}>Edit Slots</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(e => !e)}>
                {expanded ? 'Hide ▲' : 'Slots ▼'}
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:8, marginTop:14 }}>
            {(account.slots || []).map((sl, i) => <SlotBadge key={i} slot={sl} />)}
            {account.slots?.length === 0 && (
              <p style={{ color:'var(--muted)', fontSize:13 }}>No slots configured. Click Edit Slots to set up.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EditSlotsModal({ account, onClose, onDone }) {
  const [totalSlots, setTotalSlots] = useState(account.totalSlots || 1);
  const [note,       setNote]       = useState(account.note || '');
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState('');

  const save = async () => {
    setBusy(true); setErr('');
    try {
      await api.patch(`/subscriptions/admin/accounts/${account._id}`, { totalSlots: Number(totalSlots), note });
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
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18 }}>Configure Slots</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>
        <div style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13 }}>
          <strong>{account.product?.name}</strong> · {account.login}
        </div>
        <div className="field" style={{ marginBottom:12 }}>
          <label className="label">Total Slots / Profiles</label>
          <input type="number" min="1" max="50" value={totalSlots} onChange={e => setTotalSlots(e.target.value)} />
          <span style={{ fontSize:12, color:'var(--muted)' }}>Slots will be auto-created. Reducing will trim from the end.</span>
        </div>
        <div className="field" style={{ marginBottom:16 }}>
          <label className="label">Admin Note</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note…" />
        </div>
        {err && <div className="alert alert-error" style={{ marginBottom:12 }}>{err}</div>}
        <button className="btn btn-block" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Configuration'}</button>
      </div>
    </div>
  );
}

export default function AccountScreenManager() {
  const [productFilter, setProductFilter] = useState('');
  const [editAccount,   setEditAccount]   = useState(null);
  const { data: accountsData, loading, error, reload } = useApi(
    `/subscriptions/admin/accounts${productFilter ? `?productId=${productFilter}` : ''}`,
    { deps: [productFilter] }
  );
  const { data: invData } = useApi('/subscriptions/admin/inventory');

  const accounts = accountsData?.accounts || [];
  const inventory = invData?.inventory || [];

  return (
    <>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:700 }}>Account & Screen Manager</h1>
        <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Configure slots per account and view availability</p>
      </div>

      {/* Inventory summary */}
      {inventory.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12, marginBottom:28 }}>
          {inventory.map(inv => (
            <div key={inv.product._id} style={{
              background:'oklch(0.13 0.013 265)', border:`1px solid ${inv.product.accent || 'var(--line)'}44`,
              borderRadius:12, padding:'14px 16px',
            }}>
              <div style={{ fontWeight:700, marginBottom:8 }}>{inv.product.name}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:13 }}>
                <div><span style={{ color:'var(--muted)' }}>Accounts</span><br/><strong>{inv.totalAccounts}</strong></div>
                <div><span style={{ color:'var(--muted)' }}>Slots</span><br/><strong>{inv.totalSlots}</strong></div>
                <div><span style={{ color:'var(--good)' }}>Free</span><br/><strong style={{ color:'var(--good)' }}>{inv.available}</strong></div>
                <div><span style={{ color:'var(--accent)' }}>Used</span><br/><strong style={{ color:'var(--accent)' }}>{inv.occupied}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter by product */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18, alignItems:'center' }}>
        <button className={!productFilter ? 'chip active' : 'chip'} onClick={() => setProductFilter('')}>All Services</button>
        {inventory.map(inv => (
          <button key={inv.product._id}
            className={productFilter === inv.product._id ? 'chip active' : 'chip'}
            onClick={() => setProductFilter(inv.product._id)}>
            {inv.product.name}
          </button>
        ))}
      </div>

      {loading && <p style={{ color:'var(--muted)' }}>Loading…</p>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && accounts.length === 0 && (
        <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>
          No accounts found. Add accounts via Stock Manager first.
        </div>
      )}

      {!loading && accounts.map(acc => (
        <AccountCard key={acc._id} account={acc} onEdit={setEditAccount} />
      ))}

      {editAccount && (
        <EditSlotsModal account={editAccount} onClose={() => setEditAccount(null)} onDone={reload} />
      )}
    </>
  );
}

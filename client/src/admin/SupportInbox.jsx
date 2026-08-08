import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';

const STATUS_COLORS = {
  open:             { bg:'oklch(0.7 0.19 60 / 0.18)',  color:'var(--warn)' },
  waiting_customer: { bg:'oklch(0.6 0.18 250 / 0.18)', color:'var(--accent)' },
  resolved:         { bg:'oklch(0.72 0.16 150 / 0.18)',color:'var(--good)' },
};

const fmtTime = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
};

function ConversationDetail({ convoId, onClose, onStatusChange }) {
  const { data, loading, reload } = useApi(`/support/admin/conversations/${convoId}`);
  const [reply, setReply] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [err,   setErr]   = useState('');

  const convo    = data?.conversation;
  const messages = data?.messages || [];

  const sendReply = async () => {
    if (!reply.trim()) return;
    setBusy(true); setErr('');
    try {
      await api.post(`/support/admin/conversations/${convoId}/reply`, { body: reply.trim() });
      setReply('');
      reload();
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/support/admin/conversations/${convoId}/status`, { status });
      reload();
      onStatusChange();
    } catch (e) { setErr(e.message); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, width:'100%', maxWidth:640, maxHeight:'90vh',
        display:'flex', flexDirection:'column' }}
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0 }}>
          <div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:17, marginBottom:4 }}>
              {convo?.user?.name || convo?.user?.email || 'Support'}
            </h2>
            {convo && (
              <div style={{ fontSize:12, color:'var(--muted)', display:'flex', gap:12, flexWrap:'wrap' }}>
                {convo.product?.name && <span>📺 {convo.product.name}</span>}
                {convo.account?.login && <span>📧 {convo.account.login.split('@')[0]}</span>}
                {convo.slotIndex && <span>👤 Profile {convo.slotIndex}</span>}
                {convo.subscription?.expiryDate && <span>📅 Exp: {new Date(convo.subscription.expiryDate).toLocaleDateString()}</span>}
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {convo?.status !== 'resolved' && (
              <button className="btn btn-ghost btn-sm" onClick={() => updateStatus('resolved')}>✓ Resolve</button>
            )}
            {convo?.status === 'resolved' && (
              <button className="btn btn-ghost btn-sm" onClick={() => updateStatus('open')}>Reopen</button>
            )}
            <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer', padding:'0 4px' }}>×</button>
          </div>
        </div>

        {/* messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 22px', display:'flex', flexDirection:'column', gap:10 }}>
          {loading && <p style={{ color:'var(--muted)' }}>Loading…</p>}
          {messages.map(m => (
            <div key={m._id} style={{
              display:'flex', flexDirection:'column',
              alignItems: m.senderRole === 'admin' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth:'78%', padding:'10px 14px', borderRadius:12, fontSize:14,
                background: m.senderRole === 'admin' ? 'oklch(0.85 0.13 195 / 0.18)' : 'oklch(0.18 0.016 265)',
                border: `1px solid ${m.senderRole === 'admin' ? 'oklch(0.85 0.13 195 / 0.35)' : 'var(--line)'}`,
              }}>{m.body}</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>
                {m.senderRole === 'admin' ? 'Admin' : m.sender?.name || 'Customer'} · {fmtTime(m.createdAt)}
              </div>
            </div>
          ))}
        </div>

        {/* reply box */}
        {convo?.status !== 'resolved' && (
          <div style={{ padding:'14px 22px', borderTop:'1px solid var(--line)', flexShrink:0 }}>
            {err && <div className="alert alert-error" style={{ marginBottom:10, fontSize:13 }}>{err}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                placeholder="Type your reply…"
                style={{ flex:1, minHeight:70, resize:'none', fontFamily:'inherit', fontSize:14 }}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendReply(); }} />
              <button className="btn" onClick={sendReply} disabled={busy || !reply.trim()}
                style={{ alignSelf:'flex-end', padding:'10px 18px' }}>
                {busy ? '…' : 'Send'}
              </button>
            </div>
            <div style={{ fontSize:11, color:'var(--muted)', marginTop:6 }}>Ctrl+Enter to send</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportInbox() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page,         setPage]         = useState(1);
  const [openConvoId,  setOpenConvoId]  = useState(null);

  const { data, loading, error, reload } = useApi(
    `/support/admin/conversations?page=${page}&limit=30${statusFilter ? `&status=${statusFilter}` : ''}`,
    { deps: [page, statusFilter] }
  );

  const convos      = data?.conversations || [];
  const totalUnread = data?.totalUnread   || 0;

  const STATUS_FILTERS = [
    { key:'',                label:'All' },
    { key:'open',            label:'Open' },
    { key:'waiting_customer',label:'Waiting Customer' },
    { key:'resolved',        label:'Resolved' },
  ];

  return (
    <>
      <div style={{ marginBottom:24, display:'flex', alignItems:'center', gap:14 }}>
        <div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:700 }}>
            Support Inbox
            {totalUnread > 0 && (
              <span style={{ marginLeft:10, background:'var(--bad)', color:'#fff', fontSize:13,
                fontWeight:800, padding:'2px 8px', borderRadius:99, verticalAlign:'middle' }}>
                {totalUnread}
              </span>
            )}
          </h1>
          <p style={{ color:'var(--muted)', fontSize:14, marginTop:4 }}>Private customer support conversations</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        {STATUS_FILTERS.map(f => (
          <button key={f.key} className={statusFilter === f.key ? 'chip active' : 'chip'}
            onClick={() => { setStatusFilter(f.key); setPage(1); }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color:'var(--muted)' }}>Loading…</p>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && (
        <div style={{ background:'oklch(0.13 0.013 265)', border:'1px solid var(--line)', borderRadius:14, overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Customer</th><th>Service</th><th>Slot</th><th>Last Message</th><th>Time</th><th>Status</th><th>Unread</th><th></th></tr>
            </thead>
            <tbody>
              {convos.map(c => {
                const sc = STATUS_COLORS[c.status] || STATUS_COLORS.open;
                return (
                  <tr key={c._id} style={{ cursor:'pointer', background: c.unreadAdmin > 0 ? 'oklch(0.85 0.13 195 / 0.04)' : undefined }}
                    onClick={() => setOpenConvoId(c._id)}>
                    <td style={{ fontWeight: c.unreadAdmin > 0 ? 700 : 400, fontSize:13 }}>
                      {c.user?.name || c.user?.email || '—'}
                    </td>
                    <td style={{ fontSize:13 }}>{c.product?.name || '—'}</td>
                    <td style={{ fontSize:12, color:'var(--muted)' }}>{c.slotIndex ? `Profile ${c.slotIndex}` : '—'}</td>
                    <td style={{ fontSize:13, color:'var(--muted)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {c.subject || '—'}
                    </td>
                    <td style={{ color:'var(--muted)', fontSize:12, whiteSpace:'nowrap' }}>{fmtTime(c.lastMessageAt)}</td>
                    <td><span style={{ ...sc, fontSize:11, fontWeight:800, padding:'3px 8px', borderRadius:6 }}>{c.status.replace('_',' ')}</span></td>
                    <td>
                      {c.unreadAdmin > 0 && (
                        <span style={{ background:'var(--bad)', color:'#fff', fontSize:11, fontWeight:800, padding:'2px 7px', borderRadius:99 }}>
                          {c.unreadAdmin}
                        </span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setOpenConvoId(c._id); }}>
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!convos.length && (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--muted)', padding:30 }}>No conversations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data?.total > 30 && (
        <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p-1)}>← Prev</button>
          <span style={{ color:'var(--muted)', fontSize:13, lineHeight:'36px' }}>Page {page} of {Math.ceil(data.total / 30)}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(data.total / 30)} onClick={() => setPage(p => p+1)}>Next →</button>
        </div>
      )}

      {openConvoId && (
        <ConversationDetail convoId={openConvoId} onClose={() => setOpenConvoId(null)} onStatusChange={reload} />
      )}
    </>
  );
}

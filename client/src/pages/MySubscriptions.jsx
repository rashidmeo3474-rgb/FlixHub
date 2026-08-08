import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';

const STATUS_COLORS = {
  pending_assignment: { bg:'oklch(0.7 0.19 60 / 0.18)',  color:'var(--warn)' },
  active:             { bg:'oklch(0.72 0.16 150 / 0.18)', color:'var(--good)' },
  expiring_soon:      { bg:'oklch(0.7 0.19 60 / 0.18)',  color:'var(--warn)' },
  expiring_today:     { bg:'oklch(0.65 0.22 25 / 0.18)', color:'var(--bad)' },
  urgent:             { bg:'oklch(0.65 0.22 25 / 0.18)', color:'var(--bad)' },
  expired:            { bg:'oklch(0.65 0.22 25 / 0.18)', color:'var(--bad)' },
  cancelled:          { bg:'oklch(0.5 0.01 265 / 0.18)', color:'var(--muted)' },
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
const remaining = (exp) => exp ? Math.ceil((new Date(exp) - Date.now()) / 86400000) : null;

function SupportModal({ sub, onClose }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err,  setErr]  = useState('');

  const send = async () => {
    if (!body.trim()) return setErr('Please enter a message');
    setBusy(true); setErr('');
    try {
      await api.post('/support/conversations', {
        subscriptionId: sub._id,
        subject: `Support: ${sub.product?.name}`,
        body: body.trim(),
      });
      setSent(true);
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:460 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18 }}>Private Support</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ background:'oklch(0.11 0.012 265)', borderRadius:10, padding:'12px 16px', marginBottom:18, fontSize:13 }}>
          <div style={{ fontWeight:700 }}>{sub.product?.name}</div>
          {sub.slotLabel && <div style={{ color:'var(--muted)', marginTop:2 }}>Slot: {sub.slotLabel}</div>}
          <div style={{ color:'var(--muted)' }}>Expires: {fmtDate(sub.expiryDate)}</div>
        </div>

        {sent ? (
          <div className="alert alert-ok">
            ✅ Message sent! Admin will reply shortly. Check your conversations in My Orders.
          </div>
        ) : (
          <>
            <div className="field" style={{ marginBottom:14 }}>
              <label className="label">Your Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)}
                placeholder={`e.g. "${sub.product?.name} is not working properly."`}
                style={{ minHeight:100, resize:'vertical' }} />
            </div>
            {err && <div className="alert alert-error" style={{ marginBottom:12 }}>{err}</div>}
            <button className="btn btn-block" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : 'Send Message'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CredentialsModal({ sub, onClose }) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div style={{ position:'fixed', inset:0, background:'oklch(0 0 0 / 0.72)', zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={onClose}>
      <div style={{ background:'oklch(0.15 0.014 265)', border:'1px solid var(--line)',
        borderRadius:16, padding:28, width:'100%', maxWidth:420 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18 }}>Access Credentials</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:22, cursor:'pointer' }}>×</button>
        </div>

        <div style={{ background:'oklch(0.1 0.01 265)', borderRadius:12, padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Account Email</div>
            <div style={{ fontFamily:'ui-monospace,monospace', fontSize:14, background:'oklch(0.14 0.012 265)', padding:'8px 12px', borderRadius:8 }}>
              {sub.account?.login || '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Password</div>
            <div style={{ fontFamily:'ui-monospace,monospace', fontSize:14, background:'oklch(0.14 0.012 265)', padding:'8px 12px', borderRadius:8,
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>{showPass ? (sub.account?.password || '—') : '••••••••••'}</span>
              <button onClick={() => setShowPass(v => !v)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {sub.slotLabel && (
            <div>
              <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Assigned Profile / Slot</div>
              <div style={{ fontFamily:'ui-monospace,monospace', fontSize:14, background:'oklch(0.14 0.012 265)', padding:'8px 12px', borderRadius:8 }}>
                {sub.slotLabel}
              </div>
            </div>
          )}
        </div>

        <p style={{ fontSize:12, color:'var(--muted)', marginTop:14, textAlign:'center' }}>
          Keep these credentials private. Do not share with others.
        </p>
      </div>
    </div>
  );
}

export default function MySubscriptions() {
  const { t } = useI18n();
  const { data, loading, error } = useApi('/subscriptions/mine');
  const [supportSub, setSupportSub] = useState(null);
  const [credsSub,   setCredsSub]   = useState(null);

  const subs = data?.subscriptions || [];

  return (
    <section className="wrap section">
      <h1 style={{ fontSize:'clamp(26px, 3vw, 36px)', marginBottom:8 }}>My Subscriptions</h1>
      <p className="muted" style={{ marginBottom:28 }}>Your active and past streaming subscriptions</p>

      {loading && <p className="muted">{t('loading')}</p>}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && subs.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:40 }}>
          <p className="muted" style={{ marginBottom:16 }}>No subscriptions yet.</p>
          <Link className="btn" to="/shop">Browse Plans →</Link>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {subs.map(sub => {
          const days = remaining(sub.expiryDate);
          const sc   = STATUS_COLORS[sub.status] || STATUS_COLORS.active;
          const accent = sub.product?.accent || '#54d6e8';
          const canAccess = sub.status !== 'pending_assignment' && sub.status !== 'cancelled' && sub.account;

          return (
            <div key={sub._id} style={{
              background:'oklch(0.13 0.014 265)',
              border:`1.5px solid ${accent}33`,
              borderRadius:16, overflow:'hidden',
            }}>
              <div style={{ height:3, background:`linear-gradient(90deg,${accent},${accent}66)` }} />
              <div style={{ padding:'18px 22px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700 }}>{sub.product?.name || '—'}</h2>
                      <span style={{ ...sc, fontSize:11, fontWeight:800, padding:'3px 9px', borderRadius:6 }}>
                        {sub.status.replace(/_/g,' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:16, fontSize:13, color:'var(--muted)' }}>
                      {sub.slotLabel && <span>👤 {sub.slotLabel}</span>}
                      <span>📅 {fmtDate(sub.startDate)} → {fmtDate(sub.expiryDate)}</span>
                      {days != null && (
                        <span style={{ color: days <= 3 ? 'var(--bad)' : days <= 7 ? 'var(--warn)' : 'var(--good)', fontWeight:700 }}>
                          {days > 0 ? `${days} days remaining` : 'Expired'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {canAccess && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setCredsSub(sub)}>
                        🔑 Credentials
                      </button>
                    )}
                    {sub.status !== 'expired' && sub.status !== 'cancelled' && (
                      <button className="btn btn-sm" onClick={() => setSupportSub(sub)}
                        style={{ background:`linear-gradient(135deg,${accent},${accent}99)`, color:'#000' }}>
                        💬 Private Help
                      </button>
                    )}
                  </div>
                </div>

                {sub.status === 'pending_assignment' && (
                  <div style={{ marginTop:12, background:'oklch(0.7 0.19 60 / 0.1)', border:'1px solid oklch(0.7 0.19 60 / 0.3)', borderRadius:9, padding:'10px 14px', fontSize:13, color:'var(--warn)' }}>
                    ⏳ Your payment has been approved. Admin is assigning your account slot — this is usually done within a few minutes.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {supportSub && <SupportModal sub={supportSub} onClose={() => setSupportSub(null)} />}
      {credsSub   && <CredentialsModal sub={credsSub} onClose={() => setCredsSub(null)} />}
    </section>
  );
}

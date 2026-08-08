import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { money, formatDate } from '../utils/format.js';

function ProofModal({ proof, onClose, onSave }) {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    if (!action) return setErr('Select an action');
    if (action === 'reject' && !reason.trim()) return setErr('Rejection reason is required');
    setBusy(true); setErr(null);
    try {
      await api.post(`/payments/admin/${proof._id}/review`, { action, rejectionReason: reason, adminNotes: notes });
      onSave();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'oklch(0.15 0.014 265)', border: '1px solid var(--line)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20 }}>Review Payment Proof</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[
            ['Order Ref', proof.order?.reference || '—'],
            ['Customer', proof.user?.email || '—'],
            ['Method', proof.paymentMethod],
            ['Amount Paid', money(proof.amountPaid)],
            ['Transaction ID', proof.transactionId || '—'],
            ['Submitted', formatDate(proof.createdAt)],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Proof files */}
        {proof.files?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Proof Files</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {proof.files.map((f, i) => (
                <a key={i} href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${f}`} target="_blank" rel="noreferrer"
                  style={{ display: 'block', background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: 'var(--accent)', border: '1px solid var(--line)' }}>
                  📎 File {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {proof.notes && (
          <div style={{ background: 'oklch(0.12 0.012 265)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Customer Note:</strong> {proof.notes}
          </div>
        )}

        {/* Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['approve', 'reject'].map((a) => (
              <button key={a} onClick={() => setAction(a)} style={{
                flex: 1, padding: '11px 0', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', border: '2px solid',
                borderColor: action === a ? (a === 'approve' ? 'var(--good)' : 'var(--bad)') : 'var(--line)',
                background: action === a ? (a === 'approve' ? 'oklch(0.72 0.16 150 / 0.2)' : 'oklch(0.65 0.22 25 / 0.2)') : 'transparent',
                color: action === a ? (a === 'approve' ? 'var(--good)' : 'var(--bad)') : 'var(--muted)'
              }}>
                {a === 'approve' ? '✅ Approve' : '❌ Reject'}
              </button>
            ))}
          </div>

          {action === 'reject' && (
            <div className="field">
              <label className="label">Rejection Reason *</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Wrong amount, blurry screenshot…" />
            </div>
          )}

          <div className="field">
            <label className="label">Admin Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 70 }} placeholder="Internal notes…" />
          </div>

          {err && <div className="alert alert-error">{err}</div>}
          <button className="btn" onClick={submit} disabled={busy || !action}>
            {busy ? 'Processing…' : `Confirm ${action || 'Action'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentProofs() {
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const { data, loading, error, reload } = useApi('/payments/admin/pending', { deps: [statusFilter] });

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Payment Proofs</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          Review customer payment screenshots before delivering accounts.
        </p>
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && (
        <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Order Ref</th><th>Customer</th><th>Method</th><th>Amount</th><th>Txn ID</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {(data?.proofs || []).map((p) => (
                <tr key={p._id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                  <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{p.order?.reference || '—'}</td>
                  <td style={{ fontSize: 13 }}>{p.user?.email || '—'}</td>
                  <td style={{ fontSize: 13 }}>{p.paymentMethod}</td>
                  <td style={{ fontWeight: 700 }}>{money(p.amountPaid)}</td>
                  <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: 'var(--muted)' }}>{p.transactionId || '—'}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                      background: p.status === 'approved' ? 'rgba(0,255,135,0.14)'  : p.status === 'pending' ? 'rgba(255,214,0,0.14)'  : 'rgba(255,46,147,0.14)',
                      color:      p.status === 'approved' ? '#00FF87'               : p.status === 'pending' ? '#FFD600'                : '#FF2E93',
                      border:     p.status === 'approved' ? '1px solid rgba(0,255,135,0.25)' : p.status === 'pending' ? '1px solid rgba(255,214,0,0.25)' : '1px solid rgba(255,46,147,0.25)',
                      boxShadow:  p.status === 'approved' ? '0 0 8px rgba(0,255,135,0.28)' : p.status === 'pending' ? '0 0 8px rgba(255,214,0,0.25)' : '0 0 8px rgba(255,46,147,0.25)' }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(p.createdAt)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>Review</button>
                  </td>
                </tr>
              ))}
              {!data?.proofs?.length && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 30 }}>
                  No pending payment proofs 🎉
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && <ProofModal proof={selected} onClose={() => setSelected(null)} onSave={reload} />}
    </>
  );
}

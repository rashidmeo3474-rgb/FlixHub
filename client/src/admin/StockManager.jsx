import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { money } from '../utils/format.js';

const parseAccounts = (text) => text
  .split('\n').map((l) => l.trim()).filter(Boolean)
  .map((line) => {
    const [login, password, profile = ''] = line.split(/[:,\t]/).map((p) => p?.trim());
    return { login, password, profile };
  }).filter((a) => a.login && a.password);

export default function StockManager() {
  const { data, loading, error, reload } = useApi('/admin/stock');
  const [productId, setProductId] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const accounts = parseAccounts(text);
    if (!productId || !accounts.length)
      return setStatus({ type: 'error', message: 'Pick a product and paste at least one login:password line.' });
    setBusy(true); setStatus(null);
    try {
      const { data: res } = await api.post('/admin/stock', { productId, accounts });
      setStatus({ type: 'ok', message: `${res.added} account(s) added to stock.` });
      setText('');
      reload();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally { setBusy(false); }
  };

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading…</p>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  const rows = data?.stock || [];
  const total = rows.reduce((s, r) => s + r.available, 0);

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Stock Manager</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{total} total available accounts</p>
      </div>

      {/* Stock overview table */}
      <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
        <table className="table">
          <thead>
            <tr><th>Product</th><th>Quality</th><th>Monthly</th><th>Available</th><th>Assigned</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong style={{ fontSize: 14 }}>{r.name}</strong></td>
                <td style={{ color: 'var(--muted)', fontSize: 13 }}>{r.quality}</td>
                <td style={{ fontWeight: 700 }}>{money(r.monthlyPrice)}</td>
                <td>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18,
                    color: r.available === 0 ? 'var(--bad)' : r.available < 10 ? 'var(--warn)' : 'var(--good)' }}>
                    {r.available}
                  </span>
                </td>
                <td style={{ color: 'var(--muted)', fontWeight: 600 }}>{r.assigned}</td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                    background: r.available === 0 ? 'oklch(0.65 0.22 25 / 0.18)' : r.available < 10 ? 'oklch(0.7 0.19 60 / 0.18)' : 'oklch(0.72 0.16 150 / 0.18)',
                    color: r.available === 0 ? 'var(--bad)' : r.available < 10 ? 'var(--warn)' : 'var(--good)' }}>
                    {r.available === 0 ? 'OUT OF STOCK' : r.available < 10 ? 'LOW STOCK' : 'OK'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setProductId(r.id); setExpandedId(r.id); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>
                    + Add Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add stock form */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>➕ Add Stock</h2>
      <form onSubmit={submit} style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label className="label">Product</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">— select product —</option>
            {rows.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.available} available</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label">Credentials — one per line: <code style={{ fontSize: 11 }}>email:password:profile</code></label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ minHeight: 140, fontFamily: 'ui-monospace,monospace', fontSize: 13 }}
            placeholder={'user1@mail.com:Password1!:Profile 1\nuser2@mail.com:Password2!:Profile 2'} />
          {text && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{parseAccounts(text).length} valid account(s) parsed</span>}
        </div>
        {status && <div className={status.type === 'ok' ? 'alert alert-ok' : 'alert alert-error'}>{status.message}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Adding…' : 'Add to Stock'}</button>
      </form>
    </>
  );
}

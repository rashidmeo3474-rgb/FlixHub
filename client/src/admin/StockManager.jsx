import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Paste one credential per line: email:password  (optional third field = profile) */
const parseAccounts = (text) => text
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [login, password, profile = ''] = line.split(/[:,\t]/).map((p) => p?.trim());
    return { login, password, profile };
  })
  .filter((a) => a.login && a.password);

export default function StockManager() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi('/admin/stock');
  const [productId, setProductId] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const accounts = parseAccounts(text);
    if (!productId || accounts.length === 0) {
      return setStatus({ type: 'error', message: 'Pick a product and paste at least one login:password line.' });
    }
    setBusy(true); setStatus(null);
    try {
      const { data: res } = await api.post('/admin/stock', { productId, accounts });
      setStatus({ type: 'ok', message: `${res.added} accounts added to stock.` });
      setText('');
      reload();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="muted">{t('loading')}</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const rows = data.stock || [];

  return (
    <>
      <h1 style={{ fontSize: 30 }}>{t('stock')}</h1>

      <div className="card" style={{ padding: 8, margin: '22px 0 26px' }}>
        <table className="table">
          <thead>
            <tr><th>Product</th><th>Quality</th><th>Available</th><th>Assigned</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td className="muted">{r.quality}</td>
                <td className="display" style={{ fontWeight: 700, color: r.available < 10 ? 'var(--warn)' : 'var(--good)' }}>{r.available}</td>
                <td className="muted">{r.assigned}</td>
                <td><span className={r.available < 10 ? 'badge badge-warn' : 'badge badge-good'}>{r.available < 10 ? t('lowStock') : 'OK'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 14 }}>{t('addStock')}</h2>
      <form className="card stack" onSubmit={submit} style={{ maxWidth: 640 }}>
        <div className="field">
          <label className="label" htmlFor="product">Product</label>
          <select id="product" value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">— select —</option>
            {rows.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="accounts">Credentials (one per line: email:password:profile)</label>
          <textarea id="accounts" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={'user1@mail.com:Passw0rd!:Profile 1\nuser2@mail.com:Passw0rd2!'} />
        </div>
        {status && <div className={status.type === 'ok' ? 'alert alert-ok' : 'alert alert-error'}>{status.message}</div>}
        <button className="btn" type="submit" disabled={busy}>{busy ? t('loading') : t('addStock')}</button>
      </form>
    </>
  );
}

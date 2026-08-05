import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';

const EMPTY = { name: '', quality: '4K UHD', monthlyPrice: '', compareAt: '', accent: '#54d6e8', category: 'movies', logo: '' };

export default function ProductsManager() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi('/products');
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setStatus(null);
    try {
      await api.post('/admin/products', {
        ...form,
        monthlyPrice: Number(form.monthlyPrice),
        compareAt: Number(form.compareAt || 0)
      });
      setStatus({ type: 'ok', message: 'Product saved.' });
      setForm(EMPTY);
      reload();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const archive = async (id) => { await api.delete(`/admin/products/${id}`); reload(); };

  if (loading) return <p className="muted">{t('loading')}</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <h1 style={{ fontSize: 30 }}>{t('products')}</h1>

      <div className="card" style={{ padding: 8, margin: '22px 0 26px' }}>
        <table className="table">
          <thead><tr><th>Name</th><th>Quality</th><th>Monthly</th><th>Compare at</th><th>Stock</th><th /></tr></thead>
          <tbody>
            {(data.products || []).map((p) => (
              <tr key={p._id}>
                <td><strong>{p.name}</strong></td>
                <td className="muted">{p.quality}</td>
                <td>{money(p.monthlyPrice)}</td>
                <td className="muted">{p.compareAt ? money(p.compareAt) : '—'}</td>
                <td>{p.inStock}</td>
                <td><button className="btn btn-danger btn-sm" onClick={() => archive(p._id)}>Archive</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 20, marginBottom: 14 }}>Add / update product</h2>
      <form className="card grid grid-2" onSubmit={submit} style={{ maxWidth: 720, gap: 14 }}>
        <div className="field"><label className="label">Name</label><input required value={form.name} onChange={change('name')} /></div>
        <div className="field"><label className="label">Quality</label><input value={form.quality} onChange={change('quality')} /></div>
        <div className="field"><label className="label">Monthly price (Rs)</label><input required type="number" min="1" value={form.monthlyPrice} onChange={change('monthlyPrice')} /></div>
        <div className="field"><label className="label">Compare at (Rs)</label><input type="number" min="0" value={form.compareAt} onChange={change('compareAt')} /></div>
        <div className="field"><label className="label">Accent colour</label><input type="color" value={form.accent} onChange={change('accent')} style={{ padding: 6, height: 46 }} /></div>
        <div className="field">
          <label className="label">Category</label>
          <select value={form.category} onChange={change('category')}>
            <option value="movies">movies</option>
            <option value="bundle">bundle</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label className="label">Logo URL</label><input value={form.logo} onChange={change('logo')} placeholder="https://…" /></div>
        {status && <div className={status.type === 'ok' ? 'alert alert-ok' : 'alert alert-error'} style={{ gridColumn: '1 / -1' }}>{status.message}</div>}
        <button className="btn" type="submit" disabled={busy} style={{ gridColumn: '1 / -1' }}>{busy ? t('loading') : t('save')}</button>
      </form>
    </>
  );
}

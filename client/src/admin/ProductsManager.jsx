import { useState } from 'react';
import api from '../api/client.js';
import useApi from '../hooks/useApi.js';
import { money } from '../utils/format.js';

const EMPTY = { name: '', quality: '4K UHD', monthlyPrice: '', compareAt: '', accent: '#54d6e8', category: 'movies', logo: '', warrantyMonths: 1 };

// Available services for easy selection
const PREDEFINED_SERVICES = [
  { name: 'Netflix', accent: '#e50914', logo: '/logos/netflix.jpg' },
  { name: 'Prime Video', accent: '#00a8e1', logo: '/logos/prime-video-card.jpeg' },
  { name: 'HBO Max', accent: '#9b30ff', logo: '/logos/hbo-max-shop.png' },
  { name: 'Disney+', accent: '#4b6cf7', logo: '/logos/disney.png' },
  { name: 'Apple TV+', accent: '#d8d8d8', logo: '/logos/apple.png' },
  { name: 'Netflix + Prime Video', accent: '#ff6b00', logo: '/logos/netflix-prime-home.png', category: 'bundle' },
  { name: 'Netflix + HBO Max', accent: '#c026d3', logo: '/logos/hbo-max-shop.png', category: 'bundle' },
  { name: 'All Streaming Bundle', accent: '#6366f1', logo: '/logos/netflix-prime-shop.png', category: 'bundle' },
];

export default function ProductsManager() {
  const { data, loading, error, reload } = useApi('/products');
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const fillService = (service) => {
    setForm({
      ...form,
      name: service.name,
      accent: service.accent,
      logo: service.logo,
      category: service.category || 'movies'
    });
  };

  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const startEdit = (p) => {
    setEditId(p._id);
    setForm({ name: p.name, quality: p.quality, monthlyPrice: p.monthlyPrice, compareAt: p.compareAt || '', accent: p.accent || '#54d6e8', category: p.category, logo: p.logo || '', warrantyMonths: p.warrantyMonths || 1 });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const reset = () => { setEditId(null); setForm(EMPTY); setStatus(null); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setStatus(null);
    try {
      await api.post('/admin/products', {
        id: editId || undefined,
        ...form,
        monthlyPrice: Number(form.monthlyPrice),
        compareAt: Number(form.compareAt || 0),
        warrantyMonths: Number(form.warrantyMonths || 1)
      });
      setStatus({ type: 'ok', message: editId ? 'Product updated.' : 'Product created.' });
      reset();
      reload();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally { setBusy(false); }
  };

  const archive = async (id) => {
    if (!confirm('Archive this product?')) return;
    await api.delete(`/admin/products/${id}`);
    reload();
  };

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading…</p>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Products</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>{data?.products?.length || 0} products</p>
      </div>

      <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Quality</th><th>Monthly</th><th>Compare At</th><th>Category</th><th>Stock</th><th>Active</th><th></th></tr>
          </thead>
          <tbody>
            {(data?.products || []).map((p) => (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.accent && <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.accent, flexShrink: 0 }} />}
                    <strong style={{ fontSize: 14 }}>{p.name}</strong>
                  </div>
                </td>
                <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.quality}</td>
                <td style={{ fontWeight: 700 }}>{money(p.monthlyPrice)}</td>
                <td style={{ color: 'var(--muted)' }}>{p.compareAt ? money(p.compareAt) : '—'}</td>
                <td style={{ fontSize: 12 }}><span className="badge badge-good">{p.category}</span></td>
                <td style={{ fontWeight: 700, color: p.inStock < 5 ? 'var(--warn)' : 'var(--good)' }}>{p.inStock ?? '—'}</td>
                <td>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                    background: p.active !== false ? 'oklch(0.72 0.16 150 / 0.18)' : 'oklch(0.65 0.22 25 / 0.18)',
                    color: p.active !== false ? 'var(--good)' : 'var(--bad)' }}>
                    {p.active !== false ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => archive(p._id)}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
        {editId ? '✏️ Edit Product' : '➕ Add Product'}
        {editId && <button onClick={reset} style={{ marginLeft: 12, fontSize: 12, background: 'none', border: '1px solid var(--line)', borderRadius: 6, padding: '4px 10px', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>}
      </h2>
      
      {/* Quick Service Selector */}
      {!editId && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 8, display: 'block' }}>Quick Select Service:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PREDEFINED_SERVICES.map((service, i) => (
              <button
                key={i}
                type="button"
                onClick={() => fillService(service)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: form.name === service.name ? service.accent : 'oklch(0.10 0.01 265)',
                  color: form.name === service.name ? '#fff' : 'var(--text)',
                  border: `1px solid ${form.name === service.name ? service.accent : 'var(--line)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={submit} style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 760 }}>
        <div className="field"><label className="label">Name *</label><input required value={form.name} onChange={change('name')} placeholder="Netflix" /></div>
        <div className="field"><label className="label">Quality</label><input value={form.quality} onChange={change('quality')} placeholder="4K UHD" /></div>
        <div className="field"><label className="label">Monthly Price (Rs) *</label><input required type="number" min="1" value={form.monthlyPrice} onChange={change('monthlyPrice')} /></div>
        <div className="field"><label className="label">Compare At (Rs)</label><input type="number" min="0" value={form.compareAt} onChange={change('compareAt')} /></div>
        <div className="field"><label className="label">Category</label>
          <select value={form.category} onChange={change('category')}>
            <option value="movies">movies</option>
            <option value="bundle">bundle</option>
          </select>
        </div>
        <div className="field"><label className="label">Warranty (months)</label><input type="number" min="1" value={form.warrantyMonths} onChange={change('warrantyMonths')} /></div>
        <div className="field"><label className="label">Accent Colour</label><input type="color" value={form.accent} onChange={change('accent')} style={{ padding: 4, height: 44 }} /></div>
        <div className="field"><label className="label">Logo URL</label><input value={form.logo} onChange={change('logo')} placeholder="https://…" /></div>
        {status && <div className={status.type === 'ok' ? 'alert alert-ok' : 'alert alert-error'} style={{ gridColumn: '1 / -1' }}>{status.message}</div>}
        <button className="btn" type="submit" disabled={busy} style={{ gridColumn: '1 / -1' }}>{busy ? 'Saving…' : editId ? 'Update Product' : 'Create Product'}</button>
      </form>
    </>
  );
}

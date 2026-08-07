import { useEffect, useState } from 'react';
import api from '../api/client.js';

const EMPTY_METHOD = { key: '', label: '', accountName: '', mobileNumber: '', accountNumber: '', iban: '', instructions: '', active: true };

export default function PaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [methodForm, setMethodForm] = useState(EMPTY_METHOD);
  const [showMethodForm, setShowMethodForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/payments/settings');
      setSettings(data.settings);
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const { data } = await api.put('/payments/settings', settings);
      setSettings(data.settings);
      setMsg({ type: 'ok', text: 'Settings saved successfully.' });
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setSaving(false);
  };

  const set = (key) => (e) => setSettings({ ...settings, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const startEditMethod = (idx) => {
    setEditIdx(idx);
    setMethodForm({ ...settings.paymentMethods[idx] });
    setShowMethodForm(true);
  };

  const startAddMethod = () => {
    setEditIdx(null);
    setMethodForm(EMPTY_METHOD);
    setShowMethodForm(true);
  };

  const saveMethod = () => {
    const methods = [...(settings.paymentMethods || [])];
    if (editIdx !== null) methods[editIdx] = methodForm;
    else methods.push(methodForm);
    setSettings({ ...settings, paymentMethods: methods });
    setShowMethodForm(false);
  };

  const removeMethod = (idx) => {
    const methods = settings.paymentMethods.filter((_, i) => i !== idx);
    setSettings({ ...settings, paymentMethods: methods });
  };

  const toggleMethod = (idx) => {
    const methods = settings.paymentMethods.map((m, i) => i === idx ? { ...m, active: !m.active } : m);
    setSettings({ ...settings, paymentMethods: methods });
  };

  const mf = (key) => (e) => setMethodForm({ ...methodForm, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  if (loading) return <p style={{ color: 'var(--muted)' }}>Loading payment settings…</p>;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Payment Settings</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Configure payment methods shown to customers</p>
      </div>

      {msg && <div className={msg.type === 'ok' ? 'alert alert-ok' : 'alert alert-error'} style={{ marginBottom: 18 }}>{msg.text}</div>}

      {/* Payment Methods */}
      <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Payment Methods</h2>
          <button className="btn btn-ghost btn-sm" onClick={startAddMethod}>+ Add Method</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(settings?.paymentMethods || []).map((m, i) => (
            <div key={i} style={{ background: 'oklch(0.11 0.012 265)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${m.active ? 'var(--line)' : 'oklch(0.65 0.22 25 / 0.3)'}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: 15 }}>{m.label}</strong>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11, color: 'var(--muted)', background: 'oklch(0.14 0.014 265)', padding: '2px 7px', borderRadius: 4 }}>{m.key}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                    background: m.active ? 'oklch(0.72 0.16 150 / 0.18)' : 'oklch(0.65 0.22 25 / 0.18)',
                    color: m.active ? 'var(--good)' : 'var(--bad)' }}>
                    {m.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                {m.mobileNumber && <div style={{ fontSize: 12, color: 'var(--muted)' }}>📱 {m.mobileNumber}</div>}
                {m.accountName && <div style={{ fontSize: 12, color: 'var(--muted)' }}>👤 {m.accountName}</div>}
                {m.iban && <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'ui-monospace,monospace' }}>IBAN: {m.iban}</div>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => toggleMethod(i)}>{m.active ? 'Disable' : 'Enable'}</button>
                <button className="btn btn-ghost btn-sm" onClick={() => startEditMethod(i)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeMethod(i)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Method editor modal */}
      {showMethodForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowMethodForm(false)}>
          <div style={{ background: 'oklch(0.15 0.014 265)', border: '1px solid var(--line)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, marginBottom: 18 }}>{editIdx !== null ? 'Edit' : 'Add'} Payment Method</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['key','Key (e.g. jazzcash)'],['label','Display Label'],['accountName','Account Name'],['mobileNumber','Mobile Number'],['accountNumber','Account Number'],['iban','IBAN']].map(([k, lbl]) => (
                <div className="field" key={k}>
                  <label className="label">{lbl}</label>
                  <input value={methodForm[k] || ''} onChange={mf(k)} />
                </div>
              ))}
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Instructions for customer</label>
                <textarea value={methodForm.instructions || ''} onChange={mf('instructions')} style={{ minHeight: 70 }} />
              </div>
              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10, gridColumn: '1 / -1' }}>
                <input type="checkbox" id="mactive" checked={methodForm.active} onChange={mf('active')} style={{ width: 'auto' }} />
                <label htmlFor="mactive" style={{ fontSize: 14, cursor: 'pointer' }}>Active (visible to customers)</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn" onClick={saveMethod} style={{ flex: 1 }}>Save Method</button>
              <button className="btn btn-ghost" onClick={() => setShowMethodForm(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* General settings */}
      <div style={{ background: 'oklch(0.13 0.013 265)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24, maxWidth: 680 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, gridColumn: '1 / -1' }}>General Settings</h2>
        <div className="field">
          <label className="label">Max File Size (MB)</label>
          <input type="number" min="1" max="50" value={settings?.maxFileSizeMB || 5} onChange={set('maxFileSizeMB')} />
        </div>
        <div className="field">
          <label className="label">Max Reminder Count</label>
          <input type="number" min="0" max="10" value={settings?.maxReminderCount || 3} onChange={set('maxReminderCount')} />
        </div>
        <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="notif" checked={settings?.enableNotifications || false} onChange={set('enableNotifications')} style={{ width: 'auto' }} />
          <label htmlFor="notif" style={{ fontSize: 14, cursor: 'pointer' }}>Enable notifications</label>
        </div>
        <div className="field">
          <label className="label">Notification Retention (days)</label>
          <input type="number" min="1" value={settings?.notificationRetentionDays || 90} onChange={set('notificationRetentionDays')} />
        </div>
      </div>

      <button className="btn" onClick={save} disabled={saving} style={{ minWidth: 180 }}>
        {saving ? 'Saving…' : '💾 Save All Settings'}
      </button>
    </>
  );
}

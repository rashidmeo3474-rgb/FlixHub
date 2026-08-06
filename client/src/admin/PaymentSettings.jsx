import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function PaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/payments/settings');
    setSettings(data.settings);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const { data } = await api.put('/payments/settings', settings);
    setSettings(data.settings);
    setMessage('Saved');
    setSaving(false);
  };

  if (loading) return <p>Loading payment settings…</p>;

  return (
    <div className="stack">
      <h1 style={{ fontSize: 30 }}>Payment settings</h1>
      {message && <div className="alert alert-good">{message}</div>}
      <div className="card stack">
        <div className="field">
          <label className="label">Enable notifications</label>
          <input type="checkbox" checked={settings?.enableNotifications || false} onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })} />
        </div>
        <div className="field">
          <label className="label">Max file size (MB)</label>
          <input type="number" value={settings?.maxFileSizeMB || 5} onChange={(e) => setSettings({ ...settings, maxFileSizeMB: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label className="label">Max reminder count</label>
          <input type="number" value={settings?.maxReminderCount || 3} onChange={(e) => setSettings({ ...settings, maxReminderCount: Number(e.target.value) })} />
        </div>
        <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
      </div>
    </div>
  );
}

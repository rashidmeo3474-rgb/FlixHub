import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');

  const load = async () => {
    const { data } = await api.get('/payments/notifications');
    setItems(data.notifications || []);
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.post('/payments/notifications/read');
    load();
  };

  const deleteItem = async (id) => {
    await api.delete(`/payments/notifications/${id}`);
    load();
  };

  const filtered = items.filter((item) => `${item.title} ${item.message}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <section className="wrap section">
      <div className="spread" style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 30, margin: 0 }}>Notification center</h1>
        <button className="btn btn-ghost" onClick={markAllRead}>Mark all read</button>
      </div>
      <div className="field" style={{ marginBottom: 16 }}>
        <label className="label">Search notifications</label>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      </div>
      <div className="stack">
        {filtered.map((item) => (
          <div key={item._id} className="card" style={{ border: item.read ? '1px solid var(--line)' : '1px solid var(--accent)' }}>
            <div className="spread">
              <div>
                <strong>{item.title}</strong>
                <div className="muted" style={{ marginTop: 4 }}>{item.read ? 'Read' : 'Unread'}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => deleteItem(item._id)}>Delete</button>
            </div>
            <div className="muted" style={{ marginTop: 6 }}>{item.message}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

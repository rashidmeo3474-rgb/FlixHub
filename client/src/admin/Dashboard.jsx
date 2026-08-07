import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { money, formatDate } from '../utils/format.js';

const Stat = ({ label, value, color, icon, sub }) => (
  <div style={{
    background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)',
    borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 700, color }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
  </div>
);

const statusStyle = (s) => {
  if (s === 'delivered') return { background: 'oklch(0.72 0.16 150 / 0.18)', color: 'var(--good)' };
  if (s === 'pending')   return { background: 'oklch(0.7 0.19 60 / 0.18)',   color: 'var(--warn)' };
  if (s === 'paid')      return { background: 'oklch(0.6 0.18 250 / 0.18)',   color: 'var(--accent)' };
  return { background: 'oklch(0.65 0.22 25 / 0.18)', color: 'var(--bad)' };
};

export default function Dashboard() {
  const { data: s, loading, error } = useApi('/admin/stats');
  const { data: ordersData } = useApi('/admin/orders?limit=8');
  const { data: proofsData } = useApi('/payments/admin/pending');

  if (loading) return <div style={{ color: 'var(--muted)', padding: 20 }}>Loading dashboard…</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700 }}>Dashboard</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>Welcome back — here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 32 }}>
        <Stat label="Orders Today"     value={s.ordersToday}       color="var(--accent)"   icon="📋" />
        <Stat label="Revenue Today"    value={money(s.revenueToday)} color="var(--good)"   icon="💰" sub={`Month: ${money(s.revenueMonth)}`} />
        <Stat label="Pending Orders"   value={s.pendingOrders}      color="var(--warn)"    icon="⏳" />
        <Stat label="Accounts In Stock" value={s.accountsInStock}   color="var(--accent-2)" icon="🗄️" />
        <Stat label="Low Stock"        value={s.lowStockProducts}   color={s.lowStockProducts > 0 ? 'var(--bad)' : 'var(--good)'} icon="⚠️" />
        <Stat label="Total Customers"  value={s.customers}          color="var(--text)"    icon="👥" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent orders */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div style={{ background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr><th>Ref</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {(ordersData?.orders || []).map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{o.reference}</td>
                    <td style={{ fontSize: 13 }}>{o.user?.email || o.guestEmail || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{money(o.total)}</td>
                    <td><span style={{ ...statusStyle(o.status), fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>{o.status}</span></td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
                {!ordersData?.orders?.length && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending payment proofs */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Pending Payment Proofs</h2>
            <Link to="/admin/payment-proofs" style={{ fontSize: 13, color: 'var(--accent)' }}>Review all →</Link>
          </div>
          <div style={{ background: 'oklch(0.14 0.014 265)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr><th>Order Ref</th><th>User</th><th>Method</th><th>Amount</th><th>Date</th></tr>
              </thead>
              <tbody>
                {(proofsData?.proofs || []).slice(0, 8).map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{p.order?.reference || '—'}</td>
                    <td style={{ fontSize: 13 }}>{p.user?.email || '—'}</td>
                    <td style={{ fontSize: 13 }}>{p.paymentMethod}</td>
                    <td style={{ fontWeight: 700 }}>{money(p.amountPaid)}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
                {!proofsData?.proofs?.length && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No pending proofs</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

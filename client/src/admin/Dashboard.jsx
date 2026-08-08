import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { money, formatDate } from '../utils/format.js';

const Stat = ({ label, value, color, icon, sub }) => (
  <div style={{
    background: 'rgba(10,15,28,0.82)',
    border: `1px solid ${color === 'var(--good)' || color === '#00FF87' ? 'rgba(0,255,135,0.20)' :
                         color === 'var(--warn)' || color === '#FFD600' ? 'rgba(255,214,0,0.18)' :
                         color === 'var(--bad)'  || color === '#FF2E93' ? 'rgba(255,46,147,0.18)' :
                         color === 'var(--accent-2)' || color === '#9D00FF' ? 'rgba(157,0,255,0.20)' :
                         'rgba(0,240,255,0.18)'}`,
    borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6,
    backdropFilter: 'blur(14px)',
    boxShadow: `0 0 20px ${
      color === 'var(--good)' || color === '#00FF87' ? 'rgba(0,255,135,0.08)' :
      color === 'var(--warn)' || color === '#FFD600' ? 'rgba(255,214,0,0.08)' :
      color === 'var(--bad)'  || color === '#FF2E93' ? 'rgba(255,46,147,0.08)' :
      color === 'var(--accent-2)' || color === '#9D00FF' ? 'rgba(157,0,255,0.08)' :
      'rgba(0,240,255,0.08)'}, 0 4px 20px rgba(0,0,0,0.45)`,
    transition: 'transform 0.25s cubic-bezier(0.2,0.8,0.3,1.4), box-shadow 0.25s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 700, color,
      textShadow: `0 0 20px ${color}` }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sub}</div>}
  </div>
);

const statusStyle = (s) => {
  if (s === 'delivered') return { background: 'rgba(0,255,135,0.14)',  color: '#00FF87', border: '1px solid rgba(0,255,135,0.25)',  boxShadow: '0 0 8px rgba(0,255,135,0.30)'  };
  if (s === 'pending')   return { background: 'rgba(255,214,0,0.14)',  color: '#FFD600', border: '1px solid rgba(255,214,0,0.25)',  boxShadow: '0 0 8px rgba(255,214,0,0.28)'  };
  if (s === 'paid')      return { background: 'rgba(0,240,255,0.14)',  color: '#00F0FF', border: '1px solid rgba(0,240,255,0.25)',  boxShadow: '0 0 8px rgba(0,240,255,0.28)'  };
  return                        { background: 'rgba(255,46,147,0.14)', color: '#FF2E93', border: '1px solid rgba(255,46,147,0.25)', boxShadow: '0 0 8px rgba(255,46,147,0.28)' };
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
        <Stat label="Orders Today"     value={s.ordersToday}       color="#00F0FF"  icon="📋" />
        <Stat label="Revenue Today"    value={money(s.revenueToday)} color="#00FF87" icon="💰" sub={`Month: ${money(s.revenueMonth)}`} />
        <Stat label="Pending Orders"   value={s.pendingOrders}      color="#FFD600"  icon="⏳" />
        <Stat label="Accounts In Stock" value={s.accountsInStock}   color="#9D00FF"  icon="🗄️" />
        <Stat label="Low Stock"        value={s.lowStockProducts}   color={s.lowStockProducts > 0 ? '#FF2E93' : '#00FF87'} icon="⚠️" />
        <Stat label="Total Customers"  value={s.customers}          color="#E8EEFF"  icon="👥" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent orders */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700 }}>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: 13, color: 'var(--accent)' }}>View all →</Link>
          </div>
          <div style={{ background: 'rgba(10,14,26,0.82)', border: '1px solid rgba(0,240,255,0.10)', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
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
          <div style={{ background: 'rgba(10,14,26,0.82)', border: '1px solid rgba(0,240,255,0.10)', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
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

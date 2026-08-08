import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useApi from '../hooks/useApi.js';

const SITE = import.meta.env.VITE_SITE_NAME || 'FlixHub';

const NAV = [
  { to: '/admin',                end: true,  icon: '⊞', label: 'Dashboard' },
  { to: '/admin/orders',         icon: '📋', label: 'Orders' },
  { to: '/admin/payment-proofs', icon: '💳', label: 'Payment Proofs' },
  { to: '/admin/subscriptions',  icon: '🎬', label: 'Subscriptions' },
  { to: '/admin/accounts',       icon: '🖥️', label: 'Screen Manager' },
  { to: '/admin/support',        icon: '💬', label: 'Support' },
  { to: '/admin/products',       icon: '📦', label: 'Products' },
  { to: '/admin/stock',          icon: '🗄️', label: 'Stock' },
  { to: '/admin/users',          icon: '👥', label: 'Users' },
  { to: '/admin/activity',       icon: '📊', label: 'Activity Log' },
  { to: '/admin/settings',       icon: '⚙️', label: 'Payment Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: statsData } = useApi('/admin/stats');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 230, flexShrink: 0,
        background: 'oklch(0.11 0.013 265)',
        borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto'
      }}>
        {/* Brand */}
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--line)' }}>
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{
              width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center',
              background: 'linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.65 0.22 25))',
              color: '#000', fontWeight: 800, fontSize: 16
            }}>⚙</span>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{SITE}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '10px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, end, icon, label }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
              fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
              background: isActive ? 'oklch(0.82 0.18 65 / 0.15)' : 'transparent',
              color: isActive ? 'oklch(0.9 0.14 70)' : 'oklch(0.78 0.01 265)',
              borderLeft: isActive ? '3px solid oklch(0.82 0.18 65)' : '3px solid transparent',
            })}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
              {label}
              {label === 'Support' && statsData?.supportUnread > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--bad)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>
                  {statsData.supportUnread}
                </span>
              )}
              {label === 'Payment Proofs' && statsData?.pendingProofs > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--bad)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>
                  {statsData.pendingProofs}
                </span>
              )}
              {label === 'Orders' && statsData?.pendingOrders > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--warn)', color: '#000', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>
                  {statsData.pendingOrders}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 12px 16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '0 4px' }}>
            <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 11 }}>{user?.email}</div>
          </div>
          <Link to="/" style={{
            display: 'block', textAlign: 'center', padding: '8px 12px', borderRadius: 8,
            background: 'oklch(1 0 0 / 0.06)', border: '1px solid var(--line)',
            color: 'var(--text)', textDecoration: 'none', fontSize: 13, fontWeight: 600
          }}>← View Store</Link>
          <button onClick={() => { logout(); navigate('/admin/login'); }} style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid oklch(0.65 0.22 25 / 0.4)',
            background: 'oklch(0.65 0.22 25 / 0.1)', color: 'var(--bad)',
            cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit'
          }}>Logout</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, padding: '32px 36px 60px', overflowX: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}

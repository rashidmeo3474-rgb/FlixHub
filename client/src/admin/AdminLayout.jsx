import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

const SITE = import.meta.env.VITE_SITE_NAME || 'PrimeVault';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/admin" className="brand" style={{ fontSize: 17, marginBottom: 14 }}>
          <span className="mark">⚙</span>{SITE}
        </Link>
        <NavLink to="/admin" end>{t('dashboard')}</NavLink>
        <NavLink to="/admin/stock">{t('stock')}</NavLink>
        <NavLink to="/admin/orders">{t('orders')}</NavLink>
        <NavLink to="/admin/products">{t('products')}</NavLink>
        <NavLink to="/admin/payments">Payments</NavLink>
        <div style={{ marginTop: 'auto', display: 'grid', gap: 8, paddingTop: 18 }}>
          <span className="muted" style={{ fontSize: 12.5 }}>{user?.email}</span>
          <Link className="btn btn-ghost btn-sm" to="/">{t('viewStore')}</Link>
          <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/admin/login'); }}>
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="admin-main"><Outlet /></main>
    </div>
  );
}

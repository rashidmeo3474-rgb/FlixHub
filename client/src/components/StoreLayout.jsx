import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const SITE = import.meta.env.VITE_SITE_NAME || 'PrimeVault';

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      <header className="app-header">
        <div className="inner">
          <Link to="/" className="brand"><span className="mark">◆</span>{SITE}</Link>
          <nav className="nav">
            <NavLink to="/" end>{t('home')}</NavLink>
            <NavLink to="/shop">{t('shop')}</NavLink>
            <NavLink to="/orders">{t('orders')}</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
            <NavLink to="/contact">{t('contact')}</NavLink>
          </nav>
          <div className="header-actions">
            <LanguageSwitcher />
            {user
              ? <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>👤 {t('logout')}</button>
              : <Link className="btn btn-ghost btn-sm" to="/login">{t('login')}</Link>}
            <Link className="btn btn-sm" to="/cart">🛒 {count}</Link>
          </div>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="footer">
        <div className="inner">
          <span>© {SITE} — {t('heroBadge')}</span>
          <Link to="/admin/login" style={{ color: 'inherit', textDecoration: 'underline' }}>{t('adminPortal')}</Link>
        </div>
      </footer>
    </>
  );
}

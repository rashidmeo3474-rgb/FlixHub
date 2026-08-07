import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const SITE = import.meta.env.VITE_SITE_NAME || 'FlixHub';

// Local scene images from /public/scenes/ — 40 tiles fill the 8×5 grid
const POSTERS = [
  '/scenes/tile-01.png', '/scenes/tile-02.png', '/scenes/tile-03.png',
  '/scenes/tile-04.png', '/scenes/tile-05.png', '/scenes/tile-06.png',
  '/scenes/tile-07.png', '/scenes/tile-08.png', '/scenes/tile-09.png',
  '/scenes/n01.jpg',  '/scenes/n02.jpg',  '/scenes/n03.jpg',
  '/scenes/n04.jpg',  '/scenes/n07.jpg',  '/scenes/n08.jpg',
  '/scenes/n09.jpg',  '/scenes/n10.jpg',  '/scenes/n11.jpg',
  '/scenes/p01.jpg',  '/scenes/p02.jpg',  '/scenes/p03.jpg',
  '/scenes/p04.jpg',  '/scenes/p07.jpg',  '/scenes/p08.jpg',
  '/scenes/p09.jpg',  '/scenes/p10.jpg',  '/scenes/p11.jpg',
  '/scenes/f01.jpg',  '/scenes/f02.jpg',  '/scenes/f03.jpg',
  '/scenes/f04.jpg',  '/scenes/f05.jpg',  '/scenes/f06.jpg',
  '/scenes/src-05.jpg', '/scenes/src-06.jpg', '/scenes/src-07.jpg',
  '/scenes/src-08.jpg', '/scenes/src-09.jpg', '/scenes/src-10.jpg',
  '/scenes/src-11.jpg', '/scenes/src-12.jpg',
];

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <>
      {/* cinematic movie-poster background */}
      <div className="cinema-bg" aria-hidden="true">
        <div className="cinema-grid">
          {POSTERS.map((url, i) => (
            <div key={i} className="cinema-poster" style={{ backgroundImage: `url(${url})` }} />
          ))}
        </div>
        <div className="cinema-overlay" />
      </div>

      <header className="app-header">
        <div className="inner">
          <Link to="/" className="brand"><span className="mark">◆</span>{SITE}</Link>
          <nav className="nav">
            <NavLink to="/" end>{t('home')}</NavLink>
            <NavLink to="/shop">{t('shop')}</NavLink>
            <NavLink to="/orders">{t('orders')}</NavLink>
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

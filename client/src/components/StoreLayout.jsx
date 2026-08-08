import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const SITE = import.meta.env.VITE_SITE_NAME || 'FlixHub';

// All scene images from /public/scenes/ — every available poster
const SCENE_POOL = [
  '/scenes/tile-01.png','/scenes/tile-02.png','/scenes/tile-03.png',
  '/scenes/tile-04.png','/scenes/tile-05.png','/scenes/tile-06.png',
  '/scenes/tile-07.png','/scenes/tile-08.png','/scenes/tile-09.png',
  '/scenes/n01.jpg','/scenes/n02.jpg','/scenes/n03.jpg','/scenes/n04.jpg',
  '/scenes/n07.jpg','/scenes/n08.jpg','/scenes/n09.jpg','/scenes/n10.jpg',
  '/scenes/n11.jpg','/scenes/n12.jpg','/scenes/n13.jpg','/scenes/n14.jpg',
  '/scenes/n15.jpg','/scenes/n16.jpg','/scenes/n17.jpg','/scenes/n18.jpg',
  '/scenes/n19.jpg','/scenes/n20.jpg','/scenes/n21.jpg','/scenes/n22.jpg',
  '/scenes/n23.jpg','/scenes/n24.jpg','/scenes/n25.jpg','/scenes/n26.jpg',
  '/scenes/n27.jpg','/scenes/n28.jpg','/scenes/n29.jpg','/scenes/n30.jpg',
  '/scenes/n31.jpg','/scenes/n32.jpg','/scenes/n33.jpg','/scenes/n34.jpg',
  '/scenes/n35.jpg','/scenes/n36.jpg','/scenes/n37.jpg','/scenes/n38.jpg',
  '/scenes/n39.jpg','/scenes/n40.jpg','/scenes/n41.jpg','/scenes/n42.jpg',
  '/scenes/n43.jpg','/scenes/n44.jpg','/scenes/n45.jpg','/scenes/n46.jpg',
  '/scenes/n47.jpg','/scenes/n48.jpg','/scenes/n49.jpg','/scenes/n50.jpg',
  '/scenes/n51.jpg',
  '/scenes/p01.jpg','/scenes/p02.jpg','/scenes/p03.jpg','/scenes/p04.jpg',
  '/scenes/p07.jpg','/scenes/p08.jpg','/scenes/p09.jpg','/scenes/p10.jpg',
  '/scenes/p11.jpg','/scenes/p12.jpg','/scenes/p13.jpg','/scenes/p14.jpg',
  '/scenes/p15.jpg','/scenes/p16.jpg','/scenes/p17.jpg','/scenes/p18.jpg',
  '/scenes/p19.jpg','/scenes/p20.jpg','/scenes/p21.jpg','/scenes/p22.jpg',
  '/scenes/p23.jpg','/scenes/p24.jpg','/scenes/p25.jpg','/scenes/p26.jpg',
  '/scenes/p27.jpg','/scenes/p28.jpg','/scenes/p29.jpg','/scenes/p30.jpg',
  '/scenes/p31.jpg','/scenes/p32.jpg','/scenes/p33.jpg','/scenes/p34.jpg',
  '/scenes/p35.jpg','/scenes/p36.jpg','/scenes/p37.jpg','/scenes/p38.jpg',
  '/scenes/p39.jpg','/scenes/p40.jpg','/scenes/p41.jpg','/scenes/p42.jpg',
  '/scenes/p43.jpg','/scenes/p44.jpg',
  '/scenes/f01.jpg','/scenes/f02.jpg','/scenes/f03.jpg','/scenes/f04.jpg',
  '/scenes/f05.jpg','/scenes/f06.jpg','/scenes/f07.jpg','/scenes/f08.jpg',
  '/scenes/f09.jpg','/scenes/f10.jpg','/scenes/f11.jpg','/scenes/f12.jpg',
  '/scenes/f13.jpg','/scenes/f14.jpg','/scenes/f15.jpg','/scenes/f16.jpg',
  '/scenes/f17.jpg','/scenes/f18.jpg','/scenes/f19.jpg','/scenes/f20.jpg',
  '/scenes/f21.jpg','/scenes/f22.jpg','/scenes/f23.jpg','/scenes/f24.jpg',
  '/scenes/f25.jpg','/scenes/f26.jpg','/scenes/f27.jpg','/scenes/f28.jpg',
  '/scenes/f29.png',
  '/scenes/src-05.jpg','/scenes/src-06.jpg','/scenes/src-07.jpg',
  '/scenes/src-08.jpg','/scenes/src-09.jpg','/scenes/src-10.jpg',
  '/scenes/src-11.jpg','/scenes/src-12.jpg','/scenes/src-13.jpg',
  '/scenes/src-14.jpg','/scenes/src-15.jpg','/scenes/src-16.jpg',
  '/scenes/src-17.jpg','/scenes/src-18.jpg','/scenes/src-19.jpg',
  '/scenes/src-20.jpg','/scenes/src-21.jpg','/scenes/src-22.jpg',
  '/scenes/src-23.jpg','/scenes/src-24.jpg','/scenes/src-25.jpg',
  '/scenes/src-26.jpg','/scenes/src-27.jpg',
];

// 10 columns × ~22 rows = 220 tiles needed to fill 200% height.
// Repeat the pool until we have 220 entries, shuffled for variety.
const POSTERS = (() => {
  const needed = 220;
  const out = [];
  for (let i = 0; i < needed; i++) {
    // interleave different sections of the pool so repetition isn't obvious
    out.push(SCENE_POOL[(i * 7) % SCENE_POOL.length]);
  }
  return out;
})();

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
            <NavLink to="/subscriptions">My Subscriptions</NavLink>
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

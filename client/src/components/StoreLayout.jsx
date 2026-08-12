import { useState, useEffect } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.app-header')) {
        closeMenu();
      }
    };

    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
      // Prevent body scroll when menu is open on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen, isMobile]);

  const navigationItems = [
    { to: '/', label: t('home'), end: true, icon: '🏠' },
    { to: '/shop', label: t('shop'), icon: '🛍️' },
    { to: '/orders', label: t('orders'), icon: '📋' },
    { to: '/subscriptions', label: 'My Subscriptions', icon: '🎬' },
    { to: '/contact', label: t('contact'), icon: '📞' },
  ];

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
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="mark">◆</span>
            <span className="brand-text">{SITE}</span>
          </Link>

          {/* Desktop nav — hidden on mobile via CSS */}
          <nav className="nav desktop-nav">
            {navigationItems.map(({ to, label, end, icon }) => (
              <NavLink 
                key={to} 
                to={to} 
                end={end}
                className="nav-link"
                title={label}
              >
                <span className="nav-icon desktop-only">{icon}</span>
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="header-actions desktop-actions">
            <LanguageSwitcher />
            {user ? (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => { logout(); navigate('/'); }}
                title={t('logout')}
              >
                👤 <span className="desktop-only">{t('logout')}</span>
              </button>
            ) : (
              <Link 
                className="btn btn-ghost btn-sm" 
                to="/login"
                title={t('login')}
              >
                👤 <span className="desktop-only">{t('login')}</span>
              </Link>
            )}
            <Link 
              className="btn btn-sm cart-btn" 
              to="/cart"
              title={`Cart (${count} items)`}
            >
              🛒 
              <span className="cart-count">{count}</span>
            </Link>
          </div>

          {/* Mobile right side — cart + hamburger */}
          <div className="mobile-header-right">
            <Link 
              className="btn btn-sm mobile-cart-btn" 
              to="/cart" 
              title={`Cart (${count} items)`}
              style={{ 
                padding: '10px 12px', 
                fontSize: 14,
                position: 'relative',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              🛒
              {count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              style={{
                background: 'none', 
                border: '1px solid var(--line)',
                borderRadius: 9, 
                padding: '10px', 
                cursor: 'pointer',
                color: 'var(--text)', 
                fontSize: 18, 
                lineHeight: 1,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
                transition: 'transform 0.2s ease, background 0.2s ease',
                transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu with enhanced UX */}
        {menuOpen && (
          <>
            <div 
              className="mobile-menu"
              style={{
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0,
                background: 'oklch(0.10 0.013 265 / 0.98)',
                borderBottom: '1px solid var(--line)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                zIndex: 50,
                padding: '16px',
                display: 'flex', 
                flexDirection: 'column', 
                gap: 8,
                animation: 'gateBackdropIn 0.18s ease-out both',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              {/* Navigation Links */}
              <div className="mobile-nav-section">
                {navigationItems.map(({ to, label, end, icon }) => (
                  <NavLink 
                    key={to} 
                    to={to} 
                    end={end}
                    onClick={closeMenu}
                    className="mobile-nav-link"
                    style={({ isActive }) => ({
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      padding: '14px 16px', 
                      borderRadius: 12,
                      fontWeight: 600, 
                      fontSize: 16, 
                      textDecoration: 'none',
                      background: isActive ? 'var(--accent)' : 'transparent',
                      color: isActive ? 'var(--bg)' : 'var(--text)',
                      transition: 'all 0.15s ease',
                      minHeight: '48px',
                      border: isActive ? 'none' : '1px solid transparent',
                    })}
                  >
                    <span style={{ fontSize: '18px', minWidth: '20px' }}>{icon}</span>
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
              {/* Divider */}
              <div style={{ 
                height: 1, 
                background: 'var(--line)', 
                margin: '8px 0',
                opacity: 0.5,
              }} />

              {/* Action Buttons */}
              <div className="mobile-actions-section">
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'auto 1fr', 
                  gap: 12, 
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                  <LanguageSwitcher />
                  {user ? (
                    <button 
                      className="btn btn-ghost mobile-full-width" 
                      style={{ 
                        justifyContent: 'flex-start',
                        gap: 8,
                        minHeight: '44px',
                      }}
                      onClick={() => { 
                        logout(); 
                        navigate('/'); 
                        closeMenu(); 
                      }}
                    >
                      <span>👤</span>
                      <span>{t('logout')}</span>
                    </button>
                  ) : (
                    <Link 
                      className="btn btn-ghost mobile-full-width" 
                      to="/login"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 8,
                        minHeight: '44px',
                        textDecoration: 'none',
                      }}
                      onClick={closeMenu}
                    >
                      <span>👤</span>
                      <span>{t('login')}</span>
                    </Link>
                  )}
                </div>

                {/* Mobile Cart Summary */}
                <Link 
                  className="btn mobile-cart-summary"
                  to="/cart"
                  onClick={closeMenu}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: count > 0 ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'oklch(1 0 0 / 0.06)',
                    color: count > 0 ? 'var(--bg)' : 'var(--text)',
                    textDecoration: 'none',
                    borderRadius: 12,
                    border: count > 0 ? 'none' : '1px solid var(--line)',
                    fontWeight: 600,
                    minHeight: '52px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '20px' }}>🛒</span>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '700' }}>
                        {count > 0 ? `${count} item${count > 1 ? 's' : ''}` : 'Cart is empty'}
                      </div>
                      <div style={{ 
                        fontSize: '13px', 
                        opacity: 0.8,
                        marginTop: 2,
                      }}>
                        {count > 0 ? 'Tap to view & checkout' : 'Browse our products'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '18px' }}>→</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      <main style={{ position: 'relative', zIndex: 1, minHeight: '60vh' }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="inner">
          <span>© {SITE} — {t('heroBadge')}</span>
          <Link 
            to="/admin/login" 
            style={{ 
              color: 'inherit', 
              textDecoration: 'underline',
              fontSize: isMobile ? '13px' : 'inherit',
            }}
          >
            {t('adminPortal')}
          </Link>
        </div>
      </footer>
    </>
  );
}

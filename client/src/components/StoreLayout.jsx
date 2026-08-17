import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const SITE = import.meta.env.VITE_SITE_NAME || 'FlixHub';

// Optimized scene pool for cinematic background
const SCENE_POOL = [
  '/scenes/tile-01.png','/scenes/tile-02.png','/scenes/tile-03.png',
  '/scenes/n01.jpg','/scenes/n02.jpg','/scenes/n03.jpg','/scenes/n04.jpg',
  '/scenes/n07.jpg','/scenes/n08.jpg','/scenes/n09.jpg','/scenes/n10.jpg',
  '/scenes/p01.jpg','/scenes/p02.jpg','/scenes/p03.jpg','/scenes/p04.jpg',
  '/scenes/f01.jpg','/scenes/f02.jpg','/scenes/f03.jpg','/scenes/f04.jpg',
];

// Balanced poster count for good performance
const POSTERS = (() => {
  const needed = 80; // Balanced between performance and visual richness
  const out = [];
  for (let i = 0; i < needed; i++) {
    out.push(SCENE_POOL[i % SCENE_POOL.length]);
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
      {/* Restore your beautiful cinematic movie-poster background */}
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

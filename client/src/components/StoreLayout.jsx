import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

const SITE = import.meta.env.VITE_SITE_NAME || 'FlixHub';

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    { to: '/', label: 'Home', end: true, icon: '🏠' },
    { to: '/shop', label: 'Shop', icon: '🛍️' },
    { to: '/orders', label: 'Orders', icon: '📋' },
    { to: '/contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <>
      <header className="app-header">
        <div className="inner">
          <Link to="/" className="brand" onClick={closeMenu}>
            <span className="mark">◆</span>
            <span className="brand-text">{SITE}</span>
          </Link>

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

          <div className="header-actions desktop-actions">
            {user ? (
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => { logout(); navigate('/'); }}
                title="Logout"
              >
                👤 Logout
              </button>
            ) : (
              <Link 
                className="btn btn-ghost btn-sm" 
                to="/login"
                title="Login"
              >
                👤 Login
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

          <div className="mobile-header-right">
            <Link 
              className="btn btn-sm mobile-cart-btn" 
              to="/cart" 
              title={`Cart (${count} items)`}
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
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-section">
              {navigationItems.map(({ to, label, end, icon }) => (
                <NavLink 
                  key={to} 
                  to={to} 
                  end={end}
                  onClick={closeMenu}
                  className="mobile-nav-link"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main style={{ position: 'relative', zIndex: 1, minHeight: '60vh' }}>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="inner">
          <span>© {SITE} — Premium Streaming Services</span>
          <Link to="/admin/login">
            Admin Portal
          </Link>
        </div>
      </footer>
    </>
  );
}
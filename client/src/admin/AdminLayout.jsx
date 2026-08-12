import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useApi from '../hooks/useApi.js';

const SITE = import.meta.env.VITE_SITE_NAME || 'FlixHub';

const NAV = [
  { to: '/admin',                end: true,  icon: '⊞', label: 'Dashboard', shortLabel: 'Home' },
  { to: '/admin/orders',         icon: '📋', label: 'Orders', shortLabel: 'Orders' },
  { to: '/admin/payment-proofs', icon: '💳', label: 'Payment Proofs', shortLabel: 'Payments' },
  { to: '/admin/subscriptions',  icon: '🎬', label: 'Subscriptions', shortLabel: 'Subs' },
  { to: '/admin/accounts',       icon: '🖥️', label: 'Screen Manager', shortLabel: 'Screens' },
  { to: '/admin/inventory',      icon: '🗃️', label: 'Subscription Inventory', shortLabel: 'Inventory' },
  { to: '/admin/support',        icon: '💬', label: 'Support', shortLabel: 'Support' },
  { to: '/admin/products',       icon: '📦', label: 'Products', shortLabel: 'Products' },
  { to: '/admin/stock',          icon: '🗄️', label: 'Stock', shortLabel: 'Stock' },
  { to: '/admin/users',          icon: '👥', label: 'Users', shortLabel: 'Users' },
  { to: '/admin/activity',       icon: '📊', label: 'Activity Log', shortLabel: 'Activity' },
  { to: '/admin/settings',       icon: '⚙️', label: 'Payment Settings', shortLabel: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: statsData } = useApi('/admin/stats');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Close sidebar when switching to desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && !event.target.closest('.admin-sidebar') && !event.target.closest('.mobile-sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen && isMobile) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getBadgeCount = (label) => {
    if (label === 'Support' && statsData?.supportUnread > 0) {
      return { count: statsData.supportUnread, type: 'error' };
    }
    if (label === 'Payment Proofs' && statsData?.pendingProofs > 0) {
      return { count: statsData.pendingProofs, type: 'error' };
    }
    if (label === 'Orders' && statsData?.pendingOrders > 0) {
      return { count: statsData.pendingOrders, type: 'warning' };
    }
    return null;
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--bg)',
      position: 'relative',
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'oklch(0.11 0.013 265)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 1000,
        }}>
          <Link 
            to="/admin" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              textDecoration: 'none' 
            }}
          >
            <span style={{
              width: 28, 
              height: 28, 
              borderRadius: 7, 
              display: 'grid', 
              placeItems: 'center',
              background: 'linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.65 0.22 25))',
              color: '#000', 
              fontWeight: 800, 
              fontSize: 14
            }}>⚙</span>
            <div>
              <div style={{ 
                fontFamily: "'Space Grotesk',sans-serif", 
                fontWeight: 700, 
                fontSize: 14, 
                color: 'var(--text)' 
              }}>
                {SITE}
              </div>
              <div style={{ 
                fontSize: 10, 
                color: 'var(--muted)',
                lineHeight: 1,
              }}>
                Admin
              </div>
            </div>
          </Link>

          <button
            className="mobile-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: '8px 10px',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              transition: 'all 0.2s ease',
              transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </header>
      )}

      {/* Mobile Sidebar Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1001,
            animation: 'gateBackdropIn 0.2s ease-out both',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside 
        className="admin-sidebar"
        style={{
          width: isMobile ? '280px' : '240px',
          flexShrink: 0,
          background: 'oklch(0.11 0.013 265)',
          borderRight: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? '60px' : 0,
          left: isMobile ? (sidebarOpen ? 0 : '-280px') : 0,
          height: isMobile ? 'calc(100vh - 60px)' : '100vh',
          overflowY: 'auto',
          zIndex: 1002,
          transition: isMobile ? 'left 0.3s ease' : 'none',
        }}
      >
        {/* Brand - Only show on desktop */}
        {!isMobile && (
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
        )}

        {/* Nav links */}
        <nav style={{ 
          padding: isMobile ? '16px 12px' : '10px 8px', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? 4 : 2 
        }}>
          {NAV.map(({ to, end, icon, label, shortLabel }) => {
            const badge = getBadgeCount(label);
            const displayLabel = isMobile && shortLabel ? shortLabel : label;
            
            return (
              <NavLink 
                key={to} 
                to={to} 
                end={end} 
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: isMobile ? 12 : 10,
                  padding: isMobile ? '14px 16px' : '10px 12px', 
                  borderRadius: isMobile ? 12 : 10, 
                  textDecoration: 'none',
                  fontSize: isMobile ? 15 : 14, 
                  fontWeight: 600, 
                  transition: 'all 0.15s',
                  background: isActive ? 'oklch(0.82 0.18 65 / 0.15)' : 'transparent',
                  color: isActive ? 'oklch(0.9 0.14 70)' : 'oklch(0.78 0.01 265)',
                  borderLeft: isActive && !isMobile ? '3px solid oklch(0.82 0.18 65)' : '3px solid transparent',
                  border: isActive && isMobile ? '2px solid oklch(0.82 0.18 65)' : '2px solid transparent',
                  minHeight: isMobile ? '48px' : 'auto',
                })}
              >
                <span style={{ 
                  fontSize: isMobile ? 18 : 16, 
                  width: isMobile ? 22 : 20, 
                  textAlign: 'center' 
                }}>
                  {icon}
                </span>
                <span style={{ 
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {displayLabel}
                </span>
                {badge && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    background: badge.type === 'error' ? 'var(--bad)' : 'var(--warn)', 
                    color: badge.type === 'error' ? '#fff' : '#000', 
                    fontSize: isMobile ? 11 : 10, 
                    fontWeight: 800, 
                    padding: isMobile ? '3px 7px' : '2px 6px', 
                    borderRadius: 99,
                    minWidth: isMobile ? '20px' : '18px',
                    textAlign: 'center',
                  }}>
                    {badge.count > 99 ? '99+' : badge.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ 
          padding: isMobile ? '16px 12px 20px' : '12px 12px 16px', 
          borderTop: '1px solid var(--line)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? 12 : 8 
        }}>
          <div style={{ 
            fontSize: isMobile ? 13 : 12, 
            color: 'var(--muted)', 
            padding: '0 4px' 
          }}>
            <div style={{ 
              fontWeight: 600, 
              color: 'var(--text)', 
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.name || 'Admin'}
            </div>
            <div style={{ 
              fontSize: isMobile ? 12 : 11,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.email}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? 10 : 8 
          }}>
            <Link 
              to="/" 
              onClick={handleNavClick}
              style={{
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: isMobile ? '12px 16px' : '8px 12px', 
                borderRadius: isMobile ? 10 : 8,
                background: 'oklch(1 0 0 / 0.06)', 
                border: '1px solid var(--line)',
                color: 'var(--text)', 
                textDecoration: 'none', 
                fontSize: isMobile ? 14 : 13, 
                fontWeight: 600,
                minHeight: isMobile ? '44px' : 'auto',
                transition: 'all 0.2s ease',
              }}
            >
              <span>←</span>
              <span>View Store</span>
            </Link>
            
            <button 
              onClick={() => { 
                logout(); 
                navigate('/admin/login'); 
                if (isMobile) setSidebarOpen(false);
              }} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: isMobile ? '12px 16px' : '8px 12px', 
                borderRadius: isMobile ? 10 : 8, 
                border: '1px solid oklch(0.65 0.22 25 / 0.4)',
                background: 'oklch(0.65 0.22 25 / 0.1)', 
                color: 'var(--bad)',
                cursor: 'pointer', 
                fontSize: isMobile ? 14 : 13, 
                fontWeight: 700, 
                fontFamily: 'inherit',
                minHeight: isMobile ? '44px' : 'auto',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ 
        flex: 1, 
        padding: isMobile ? '20px 16px 40px' : '32px 36px 60px',
        marginTop: isMobile ? '60px' : 0,
        marginLeft: isMobile ? 0 : 0,
        overflowX: 'auto', 
        minWidth: 0,
        minHeight: isMobile ? 'calc(100vh - 60px)' : '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

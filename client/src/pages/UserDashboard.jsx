import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import useApi from '../hooks/useApi.js';

export default function UserDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data: ordersData } = useApi('/orders/mine');
  const { data: subsData } = useApi('/subscriptions/mine');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const orders = ordersData?.orders || [];
  const subscriptions = subsData?.subscriptions || [];
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const recentOrders = orders.slice(0, 3);

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="wrap section">
        <div className="alert alert-error">
          Please log in to access your dashboard.
        </div>
      </div>
    );
  }

  return (
    <section className="wrap section">
      {/* Welcome Header */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, oklch(0.18 0.014 265), oklch(0.16 0.016 280))',
        border: '1px solid oklch(0.3 0.02 265 / 0.3)',
        marginBottom: isMobile ? 20 : 28,
      }}>
        <div className="row" style={{ 
          gap: isMobile ? 14 : 18, 
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <div 
            className="user-avatar" 
            style={{
              width: isMobile ? 56 : 64,
              height: isMobile ? 56 : 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.65 0.22 25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 20 : 24,
              fontWeight: 800,
              color: 'var(--bg)',
              flexShrink: 0,
            }}
          >
            {getInitials(user.name || user.email)}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ 
              fontSize: isMobile ? 20 : 26, 
              marginBottom: 4,
              wordBreak: 'break-word',
            }}>
              Welcome back, {user.name || user.email.split('@')[0]}! 👋
            </h1>
            <div className="muted" style={{ 
              fontSize: isMobile ? 12 : 13,
              lineHeight: 1.4,
            }}>
              <div>Member since {formatJoinDate(user.createdAt || Date.now())}</div>
              <div>{user.email}</div>
              {user.phone && <div>📞 {user.phone}</div>}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'column', 
            gap: isMobile ? 12 : 8,
            flexWrap: 'wrap',
          }}>
            <span className="badge badge-good" style={{ 
              fontSize: isMobile ? 10 : 11,
              whiteSpace: 'nowrap',
            }}>
              {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid" style={{ 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 12 : 16,
        marginBottom: isMobile ? 20 : 28,
      }}>
        <div className="card stat-card" style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: isMobile ? 20 : 24, 
            fontWeight: 800, 
            color: 'var(--accent)',
            marginBottom: 4,
          }}>
            {activeSubscriptions.length}
          </div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            Active Subscriptions
          </div>
        </div>

        <div className="card stat-card" style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: isMobile ? 20 : 24, 
            fontWeight: 800, 
            color: 'var(--good)',
            marginBottom: 4,
          }}>
            {orders.length}
          </div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            Total Orders
          </div>
        </div>

        <div className="card stat-card" style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: isMobile ? 20 : 24, 
            fontWeight: 800, 
            color: 'var(--warn)',
            marginBottom: 4,
          }}>
            {subscriptions.filter(s => s.status === 'expiring_soon').length}
          </div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            Expiring Soon
          </div>
        </div>

        <div className="card stat-card" style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: isMobile ? 20 : 24, 
            fontWeight: 800, 
            color: 'var(--muted)',
            marginBottom: 4,
          }}>
            PKR
          </div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            Currency
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid" style={{ 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? 12 : 16,
        marginBottom: isMobile ? 24 : 32,
      }}>
        <Link 
          to="/shop" 
          className="card action-card"
          style={{ 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, oklch(0.82 0.18 65 / 0.1), oklch(0.65 0.22 25 / 0.1))',
            border: '1px solid oklch(0.82 0.18 65 / 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: isMobile ? 28 : 32, marginBottom: 8 }}>🛍️</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Browse Store</div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            Discover new streaming services
          </div>
        </Link>

        <Link 
          to="/subscriptions" 
          className="card action-card"
          style={{ 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, oklch(0.72 0.16 150 / 0.1), oklch(0.65 0.18 170 / 0.1))',
            border: '1px solid oklch(0.72 0.16 150 / 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: isMobile ? 28 : 32, marginBottom: 8 }}>📺</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>My Subscriptions</div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            Manage active subscriptions
          </div>
        </Link>

        <Link 
          to="/orders" 
          className="card action-card"
          style={{ 
            textDecoration: 'none',
            background: 'linear-gradient(135deg, oklch(0.7 0.19 240 / 0.1), oklch(0.65 0.22 260 / 0.1))',
            border: '1px solid oklch(0.7 0.19 240 / 0.2)',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: isMobile ? 28 : 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Order History</div>
          <div className="muted" style={{ fontSize: isMobile ? 11 : 12 }}>
            View all your orders
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid" style={{ 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? 16 : 20,
        alignItems: 'start',
      }}>
        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ 
            fontSize: isMobile ? 16 : 18, 
            marginBottom: isMobile ? 14 : 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            📦 Recent Orders
          </h3>
          {recentOrders.length > 0 ? (
            <div className="stack" style={{ gap: isMobile ? 10 : 12 }}>
              {recentOrders.map((order) => (
                <div 
                  key={order._id}
                  style={{
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    background: 'oklch(0.14 0.012 265)',
                    borderRadius: 8,
                    border: '1px solid oklch(0.25 0.015 265 / 0.2)',
                  }}
                >
                  <div className="row" style={{ 
                    gap: 8, 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        fontSize: isMobile ? 13 : 14, 
                        fontWeight: 600,
                        marginBottom: 2,
                      }}>
                        {order.items?.[0]?.name || 'Order'}
                      </div>
                      <div className="muted" style={{ fontSize: isMobile ? 10 : 11 }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span 
                      className={`badge ${
                        order.status === 'delivered' ? 'badge-good' : 
                        order.status === 'pending' ? 'badge-warn' : 'badge-bad'
                      }`}
                      style={{ fontSize: isMobile ? 9 : 10 }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted" style={{ 
              textAlign: 'center', 
              fontSize: isMobile ? 12 : 13,
              padding: isMobile ? 16 : 20,
            }}>
              No orders yet. <Link to="/shop">Start shopping!</Link>
            </div>
          )}
          {orders.length > 3 && (
            <Link 
              to="/orders"
              className="btn btn-ghost btn-sm"
              style={{ 
                marginTop: isMobile ? 12 : 14,
                width: '100%',
              }}
            >
              View All Orders →
            </Link>
          )}
        </div>

        {/* Active Subscriptions */}
        <div className="card">
          <h3 style={{ 
            fontSize: isMobile ? 16 : 18, 
            marginBottom: isMobile ? 14 : 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            ⚡ Active Subscriptions
          </h3>
          {activeSubscriptions.length > 0 ? (
            <div className="stack" style={{ gap: isMobile ? 10 : 12 }}>
              {activeSubscriptions.slice(0, 3).map((sub) => (
                <div 
                  key={sub._id}
                  style={{
                    padding: isMobile ? '10px 12px' : '12px 14px',
                    background: 'oklch(0.14 0.012 265)',
                    borderRadius: 8,
                    border: '1px solid oklch(0.25 0.015 265 / 0.2)',
                  }}
                >
                  <div className="row" style={{ 
                    gap: 8, 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ 
                        fontSize: isMobile ? 13 : 14, 
                        fontWeight: 600,
                        marginBottom: 2,
                      }}>
                        {sub.product?.name || 'Subscription'}
                      </div>
                      <div className="muted" style={{ fontSize: isMobile ? 10 : 11 }}>
                        {sub.expiryDate ? `Expires ${new Date(sub.expiryDate).toLocaleDateString()}` : 'Active'}
                      </div>
                    </div>
                    <span 
                      className="badge badge-good"
                      style={{ fontSize: isMobile ? 9 : 10 }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted" style={{ 
              textAlign: 'center', 
              fontSize: isMobile ? 12 : 13,
              padding: isMobile ? 16 : 20,
            }}>
              No active subscriptions. <Link to="/shop">Browse services!</Link>
            </div>
          )}
          {activeSubscriptions.length > 3 && (
            <Link 
              to="/subscriptions"
              className="btn btn-ghost btn-sm"
              style={{ 
                marginTop: isMobile ? 12 : 14,
                width: '100%',
              }}
            >
              View All Subscriptions →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
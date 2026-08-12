import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

/**
 * LoginGateModal
 * Shows when a guest clicks a product card.
 * Props:
 *   product  — the product object clicked
 *   onClose  — close handler
 */
export default function LoginGateModal({ product, onClose }) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [tab,   setTab]   = useState('login');
  const [form,  setForm]  = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detect screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 640;
      const tablet = window.innerWidth > 640 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await login(form.email, form.password);
      onClose();
      navigate(`/product/${product.slug}`);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setBusy(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      onClose();
      navigate(`/product/${product.slug}`);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setBusy(false);
  };

  const accent = product?.accent || '#54d6e8';

  return (
    <div
      onClick={onClose}
      className="modal-backdrop"
      style={{
        position: 'fixed', 
        inset: 0, 
        zIndex: 200,
        background: 'oklch(0 0 0 / 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', 
        alignItems: isMobile ? 'flex-end' : 'center', 
        justifyContent: 'center',
        padding: isMobile ? 0 : 20,
        animation: 'gateBackdropIn 0.22s ease-out both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className={`gate-modal-inner ${isMobile ? 'mobile' : ''}`}
        style={{
          width: '100%', 
          maxWidth: isMobile ? 'none' : 440,
          background: 'oklch(0.12 0.014 265 / 0.98)',
          border: `1.5px solid ${accent}44`,
          borderRadius: isMobile ? '20px 20px 0 0' : 20,
          overflow: 'hidden',
          boxShadow: `0 0 60px ${accent}22, 0 32px 80px oklch(0 0 0 / 0.72)`,
          animation: isMobile 
            ? 'slideUpModalIn 0.3s cubic-bezier(0.2,0.8,0.3,1) both' 
            : 'gateModalIn 0.28s cubic-bezier(0.2,0.8,0.3,1.4) both',
          ...(isMobile ? {
            height: 'auto',
            maxHeight: '90vh',
            overflowY: 'auto',
          } : {}),
        }}
      >
        {/* top accent bar */}
        <div style={{ 
          height: isMobile ? 4 : 3, 
          background: `linear-gradient(90deg, ${accent}, ${accent}55)` 
        }} />

        {/* product strip */}
        <div style={{ 
          padding: isMobile ? '20px 20px 0' : '18px 22px 0', 
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? 12 : 14 
        }}>
          <div style={{
            width: isMobile ? 40 : 44, 
            height: isMobile ? 40 : 44, 
            borderRadius: isMobile ? 8 : 10, 
            overflow: 'hidden',
            flexShrink: 0, 
            background: `${accent}22`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
          }}>
            {product?.logo
              ? <img 
                  src={product.logo} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              : <span style={{ 
                  fontWeight: 800, 
                  fontSize: isMobile ? 16 : 18, 
                  color: accent 
                }}>
                  {product?.name?.[0] || '◆'}
                </span>
            }
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontSize: isMobile ? 10 : 11, 
              color: 'var(--muted)', 
              fontWeight: 700,
              textTransform: 'uppercase', 
              letterSpacing: '0.07em' 
            }}>
              You selected
            </div>
            <div style={{ 
              fontFamily: "'Space Grotesk',sans-serif", 
              fontWeight: 700,
              fontSize: isMobile ? 14 : 15, 
              marginTop: 2, 
              color: accent,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {product?.name}
              {product?.quality && (
                <span style={{ 
                  fontSize: isMobile ? 10 : 11, 
                  color: 'var(--muted)', 
                  fontWeight: 600,
                  marginLeft: 8 
                }}>
                  {product.quality}
                </span>
              )}
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            aria-label="Close" 
            style={{
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none',
              color: 'var(--muted)', 
              fontSize: isMobile ? 20 : 22, 
              cursor: 'pointer',
              lineHeight: 1, 
              padding: isMobile ? 8 : 4, 
              borderRadius: 6,
              transition: 'color 0.15s ease',
              minWidth: isMobile ? '44px' : 'auto',
              minHeight: isMobile ? '44px' : 'auto',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            ×
          </button>
        </div>

        {/* heading */}
        <div style={{ 
          padding: isMobile ? '16px 20px 0' : '14px 22px 0', 
          textAlign: 'center' 
        }}>
          <h2 style={{ 
            fontFamily: "'Space Grotesk',sans-serif", 
            fontSize: isMobile ? 18 : 21,
            fontWeight: 700, 
            lineHeight: 1.2 
          }}>
            Sign in to continue
          </h2>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: isMobile ? 12 : 13, 
            marginTop: 6, 
            lineHeight: 1.5,
            padding: isMobile ? '0 10px' : 0,
          }}>
            Log in or create a free account to purchase.
          </p>
        </div>

        {/* tab switcher */}
        <div style={{
          display: 'flex', 
          margin: isMobile ? '18px 20px 0' : '16px 22px 0',
          background: 'oklch(0.09 0.01 265)', 
          borderRadius: isMobile ? 10 : 12, 
          padding: isMobile ? 3 : 4, 
          gap: isMobile ? 3 : 4,
        }}>
          {['login', 'register'].map(tabKey => (
            <button key={tabKey}
              onClick={() => { setTab(tabKey); setError(''); }}
              style={{
                flex: 1, 
                padding: isMobile ? '11px 0' : '9px 0', 
                borderRadius: isMobile ? 8 : 9,
                border: 'none', 
                cursor: 'pointer', 
                fontFamily: 'inherit',
                fontWeight: 700, 
                fontSize: isMobile ? 13 : 13.5,
                minHeight: isMobile ? '44px' : 'auto',
                background: tab === tabKey
                  ? `linear-gradient(135deg, ${accent}cc, ${accent}66)`
                  : 'transparent',
                color: tab === tabKey ? '#000' : 'var(--muted)',
                transition: 'all 0.18s ease',
              }}>
              {tabKey === 'login' ? 'Log In' : 'Register'}
            </button>
          ))}
        </div>

        {/* form */}
        <form
          onSubmit={tab === 'login' ? handleLogin : handleRegister}
          style={{ 
            padding: isMobile ? '18px 20px 24px' : '16px 22px 22px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? 14 : 11 
          }}
        >
          {tab === 'register' && (
            <div className="field">
              <label 
                className="label"
                style={{
                  fontSize: isMobile ? 11 : 12.5,
                }}
              >
                Full Name
              </label>
              <input 
                type="text" 
                required 
                placeholder="Ali Ahmed"
                value={form.name} 
                onChange={e => set('name', e.target.value)}
                style={{
                  padding: isMobile ? '14px 16px' : '13px 15px',
                  fontSize: isMobile ? 16 : 15, // 16px to prevent zoom on iOS
                  borderRadius: isMobile ? 10 : 11,
                }}
              />
            </div>
          )}
          
          <div className="field">
            <label 
              className="label"
              style={{
                fontSize: isMobile ? 11 : 12.5,
              }}
            >
              Email
            </label>
            <input 
              type="email" 
              required 
              placeholder="you@example.com"
              value={form.email} 
              onChange={e => set('email', e.target.value)}
              style={{
                padding: isMobile ? '14px 16px' : '13px 15px',
                fontSize: isMobile ? 16 : 15,
                borderRadius: isMobile ? 10 : 11,
              }}
            />
          </div>
          
          <div className="field">
            <label 
              className="label"
              style={{
                fontSize: isMobile ? 11 : 12.5,
              }}
            >
              Password
            </label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={form.password} 
              onChange={e => set('password', e.target.value)}
              style={{
                padding: isMobile ? '14px 16px' : '13px 15px',
                fontSize: isMobile ? 16 : 15,
                borderRadius: isMobile ? 10 : 11,
              }}
            />
          </div>

          {error && (
            <div 
              className="alert alert-error" 
              style={{ 
                fontSize: isMobile ? 12 : 13,
                padding: isMobile ? '12px 14px' : '10px 12px',
                borderRadius: isMobile ? 8 : 11,
              }}
            >
              {error}
            </div>
          )}

          <button 
            className="btn btn-block" 
            type="submit" 
            disabled={busy}
            style={{ 
              marginTop: isMobile ? 6 : 4,
              padding: isMobile ? '16px 24px' : '13px 22px',
              fontSize: isMobile ? 15 : 15,
              fontWeight: 700,
              minHeight: isMobile ? '52px' : 'auto',
              background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
              color: '#000' 
            }}
          >
            {busy
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : (tab === 'login' ? 'Log In & Continue →' : 'Register & Continue →')}
          </button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isMobile ? 8 : 10,
            margin: isMobile ? '8px 0 4px' : '4px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ 
              fontSize: isMobile ? 11 : 12, 
              color: 'var(--muted)' 
            }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <Link 
            to="/shop" 
            onClick={onClose} 
            style={{
              display: 'block', 
              textAlign: 'center', 
              padding: isMobile ? '14px 20px' : '10px',
              borderRadius: isMobile ? 10 : 11, 
              fontSize: isMobile ? 14 : 13.5, 
              fontWeight: 700,
              minHeight: isMobile ? '48px' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--line)', 
              color: 'var(--muted)',
              textDecoration: 'none', 
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { 
              e.currentTarget.style.background = 'oklch(1 0 0 / 0.05)'; 
              e.currentTarget.style.color = 'var(--text)'; 
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.background = 'transparent'; 
              e.currentTarget.style.color = 'var(--muted)'; 
            }}
          >
            Browse as guest →
          </Link>
        </form>
      </div>
    </div>
  );
}

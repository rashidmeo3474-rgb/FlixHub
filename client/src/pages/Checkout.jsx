import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel } from '../utils/format.js';

const METHODS = [
  { key: 'jazzcash',  label: 'JazzCash',         note: 'Mobile wallet · instant approval', logo: '/logos/jazzcash.png' },
  { key: 'easypaisa', label: 'EasyPaisa',         note: 'Mobile wallet · instant approval', logo: '/logos/easypaisa.png' },
  { key: 'nayapay',   label: 'NayaPay',           note: 'Mobile wallet · instant approval', logo: '/logos/nayapay.png' },
  { key: 'ubl',       label: 'UBL Bank',          note: 'Bank transfer',                    logo: '/logos/ubl.jpg' },
  { key: 'mcb',       label: 'MCB Bank',          note: 'Bank transfer',                    logo: '/logos/mcb.png' },
  { key: 'card',      label: 'Visa / Mastercard', note: 'Any bank debit or credit card',    logo: '/logos/visa.jpg' },
];

export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [method, setMethod] = useState('jazzcash');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

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

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ productId: i.productId, months: i.months })),
        paymentMethod: method, email, phone
      });
      navigate(`/payment/${data.order._id}`, { state: { intent: data.intent, reference: data.order.reference } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section 
      className="wrap-sm section"
      style={{
        padding: isMobile ? '24px 0 40px' : '48px 0 64px',
      }}
    >
      <h1 style={{ 
        fontSize: isMobile ? 'clamp(22px, 6vw, 28px)' : isTablet ? 'clamp(24px, 4vw, 32px)' : 'clamp(26px, 3.2vw, 38px)',
        textAlign: isMobile ? 'center' : 'left',
        marginBottom: isMobile ? 16 : 20,
      }}>
        {t('checkout')}
      </h1>

        <div 
          className="steps" 
          style={{
            marginBottom: isMobile ? 24 : 32,
            gap: isMobile ? 6 : 10,
          }}
        >
          {[t('email'), t('pay'), t('delivered')].map((label, i) => (
            <div key={label} style={{ flex: 1 }}>
              <div 
                className={i === 0 ? 'bar on' : 'bar'} 
                style={{
                  height: isMobile ? 3 : 4,
                }}
              />
              <span style={{ 
                fontSize: isMobile ? 11 : 12.5, 
                fontWeight: 600,
                display: 'block',
                marginTop: isMobile ? 6 : 8,
                textAlign: 'center',
                color: i === 0 ? 'var(--accent)' : 'var(--muted)',
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

      <form 
        className={isMobile ? 'checkout-mobile' : 'grid grid-2 checkout-grid'} 
        onSubmit={submit} 
        style={{ 
          alignItems: 'start',
          gap: isMobile ? 20 : 24,
        }}
      >
        {/* Order summary - Show first on mobile */}
        <aside 
          className="card stack checkout-summary" 
          style={{ 
            gap: isMobile ? 10 : 12,
            order: isMobile ? 1 : 2,
            padding: isMobile ? '18px' : '20px',
          }}
        >
          <span 
            className="label"
            style={{
              fontSize: isMobile ? 11 : 12.5,
              textAlign: isMobile ? 'center' : 'left',
            }}
          >
            {t('orderSummary')}
          </span>
          
          {items.map((i, k) => (
            <div 
              className="spread" 
              key={k} 
              style={{ 
                fontSize: isMobile ? 13 : 14,
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span 
                className="muted" 
                style={{
                  flex: 1,
                  lineHeight: 1.3,
                }}
              >
                {i.name} · {monthsLabel(i.months, t)}
              </span>
              <strong style={{
                fontSize: isMobile ? 14 : 15,
              }}>
                {money(i.price)}
              </strong>
            </div>
          ))}
          
          <div 
            className="spread" 
            style={{ 
              borderTop: '1px dashed var(--line)', 
              paddingTop: isMobile ? 10 : 12,
              marginTop: isMobile ? 4 : 8,
            }}
          >
            <span 
              className="label"
              style={{
                fontSize: isMobile ? 12 : 12.5,
              }}
            >
              {t('total')}
            </span>
            <span 
              className="price" 
              style={{ 
                fontSize: isMobile ? 20 : 24,
              }}
            >
              {money(total)}
            </span>
          </div>
        </aside>

        {/* Payment form */}
        <div 
          className="card stack" 
          style={{
            order: isMobile ? 2 : 1,
            padding: isMobile ? '18px' : '20px',
            gap: isMobile ? 16 : 18,
          }}
        >
          {/* Email field */}
          <div className="field">
            <label 
              className="label" 
              htmlFor="email"
              style={{
                fontSize: isMobile ? 11 : 12.5,
              }}
            >
              {t('email')}
            </label>
            <input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@mail.com"
              style={{
                padding: isMobile ? '12px 14px' : '13px 15px',
                fontSize: isMobile ? 15 : 15, // 16px to prevent zoom on iOS
                borderRadius: isMobile ? 10 : 11,
              }}
            />
          </div>
          
          {/* Phone field */}
          <div className="field">
            <label 
              className="label" 
              htmlFor="phone"
              style={{
                fontSize: isMobile ? 11 : 12.5,
              }}
            >
              {t('phone')}
            </label>
            <input 
              id="phone" 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+92 300 0000000"
              style={{
                padding: isMobile ? '12px 14px' : '13px 15px',
                fontSize: isMobile ? 15 : 15,
                borderRadius: isMobile ? 10 : 11,
              }}
            />
          </div>
          
          {/* Payment methods */}
          <div className="field">
            <span 
              className="label"
              style={{
                fontSize: isMobile ? 11 : 12.5,
              }}
            >
              {t('paymentMethod')}
            </span>
            <div className="stack" style={{ gap: isMobile ? 8 : 10 }}>
              {METHODS.map((m) => (
                <button 
                  type="button" 
                  key={m.key} 
                  onClick={() => setMethod(m.key)}
                  className={method === m.key ? 'duration active' : 'duration'}
                  style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: isMobile ? '12px 14px' : '14px 16px',
                    minHeight: isMobile ? '64px' : '72px',
                    borderRadius: isMobile ? 10 : 12,
                  }}
                >
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 10 : 12,
                    flex: 1,
                    minWidth: 0,
                  }}>
                    {m.logo ? (
                      <img 
                        src={m.logo} 
                        alt={m.label}
                        style={{ 
                          height: isMobile ? 24 : 28, 
                          maxWidth: isMobile ? 60 : 80, 
                          objectFit: 'contain', 
                          borderRadius: 4,
                          background: '#fff', 
                          padding: '2px 6px',
                          flexShrink: 0,
                        }} 
                      />
                    ) : (
                      <span style={{ 
                        width: isMobile ? 60 : 80, 
                        height: isMobile ? 24 : 28, 
                        borderRadius: 4, 
                        background: 'oklch(1 0 0 / 0.08)',
                        display: 'grid', 
                        placeItems: 'center', 
                        fontSize: isMobile ? 10 : 11, 
                        fontWeight: 700,
                        color: 'var(--muted)', 
                        flexShrink: 0,
                      }}>
                        {m.label.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    
                    <span style={{ 
                      textAlign: 'start',
                      flex: 1,
                      minWidth: 0,
                    }}>
                      <strong style={{ 
                        display: 'block', 
                        fontSize: isMobile ? 13 : 14,
                        marginBottom: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {m.label}
                      </strong>
                      <span 
                        className="muted" 
                        style={{ 
                          fontSize: isMobile ? 11 : 12,
                          lineHeight: 1.2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {m.note}
                      </span>
                    </span>
                  </span>
                  
                  <span style={{ 
                    fontSize: isMobile ? 16 : 18,
                    marginLeft: 8,
                  }}>
                    {method === m.key ? '●' : '○'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div 
              className="alert alert-error"
              style={{
                padding: isMobile ? '12px 14px' : '12px 15px',
                fontSize: isMobile ? 13 : 14,
                borderRadius: isMobile ? 8 : 11,
              }}
            >
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button 
            className="btn" 
            type="submit" 
            disabled={busy}
            style={{
              padding: isMobile ? '16px 24px' : '13px 22px',
              fontSize: isMobile ? 15 : 15,
              minHeight: isMobile ? '52px' : 'auto',
              fontWeight: 700,
              marginTop: isMobile ? 8 : 4,
            }}
          >
            {busy ? t('loading') : `${t('continueToPayment')} →`}
          </button>
        </div>
      </form>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money, monthsLabel } from '../utils/format.js';

export default function Cart() {
  const { items, remove, total } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
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
        {t('cart')} {items.length > 0 && (
          <span style={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 600,
            color: 'var(--muted)',
            marginLeft: 8,
          }}>
            ({items.length} item{items.length !== 1 ? 's' : ''})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            marginTop: isMobile ? 20 : 24, 
            textAlign: 'center', 
            padding: isMobile ? '32px 20px' : '40px',
          }}
        >
          <div style={{
            fontSize: isMobile ? '48px' : '64px',
            marginBottom: isMobile ? 12 : 16,
          }}>
            🛒
          </div>
          <h3 style={{
            fontSize: isMobile ? 18 : 20,
            fontWeight: 600,
            marginBottom: isMobile ? 8 : 12,
          }}>
            Your cart is empty
          </h3>
          <p 
            className="muted" 
            style={{ 
              marginBottom: isMobile ? 20 : 24,
              fontSize: isMobile ? 14 : 15,
            }}
          >
            {t('emptyCart')}
          </p>
          <Link 
            className="btn" 
            to="/shop"
            style={{
              padding: isMobile ? '14px 24px' : '13px 22px',
              fontSize: isMobile ? 14 : 15,
              minHeight: isMobile ? '48px' : 'auto',
            }}
          >
            {t('shop')} →
          </Link>
        </div>
      ) : (
        <div className="stack" style={{ marginTop: isMobile ? 20 : 24, gap: isMobile ? 12 : 16 }}>
          {items.map((item, index) => (
            <div 
              className="card cart-item-row" 
              key={`${item.productId}-${index}`} 
              style={{ 
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 12 : 16,
                alignItems: isMobile ? 'stretch' : 'center',
                padding: isMobile ? '16px' : '20px',
              }}
            >
              {/* Logo and main info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 12 : 16,
                flex: isMobile ? 'none' : 1,
                minWidth: 0,
              }}>
                <div 
                  className="logo-tile cart-logo-tile" 
                  style={{ 
                    width: isMobile ? 48 : isTablet ? 56 : 64, 
                    height: isMobile ? 48 : isTablet ? 56 : 64, 
                    flex: 'none', 
                    background: `linear-gradient(135deg, ${item.accent || '#54d6e8'}33, oklch(0.22 0.02 265))`,
                    borderRadius: isMobile ? 8 : 12,
                  }}
                >
                  {item.logo ? (
                    <img 
                      src={item.logo} 
                      alt="" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: isMobile ? 6 : 10,
                      }}
                    />
                  ) : (
                    <span 
                      className="fallback" 
                      style={{ 
                        fontSize: isMobile ? 9 : 11,
                        textAlign: 'center',
                        padding: '4px',
                      }}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ 
                    fontSize: isMobile ? 14 : 15.5, 
                    display: 'block',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.name}
                  </strong>
                  <div 
                    className="muted" 
                    style={{ 
                      fontSize: isMobile ? 12 : 13,
                      lineHeight: 1.3,
                    }}
                  >
                    {monthsLabel(item.months, t)} · {item.quality}
                  </div>
                </div>
              </div>

              {/* Price and remove button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'space-between' : 'flex-end',
                gap: isMobile ? 12 : 16,
                flexShrink: 0,
              }}>
                <span 
                  className="price" 
                  style={{ 
                    fontSize: isMobile ? 16 : 19,
                    fontWeight: 700,
                  }}
                >
                  {money(item.price)}
                </span>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => remove(index)} 
                  aria-label="Remove item"
                  style={{
                    padding: isMobile ? '8px 10px' : '9px 15px',
                    fontSize: isMobile ? 14 : 13.5,
                    minWidth: isMobile ? '40px' : 'auto',
                    minHeight: isMobile ? '40px' : 'auto',
                    borderRadius: isMobile ? 8 : 'inherit',
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Total and checkout */}
          <div 
            className="card" 
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 16 : 20,
              padding: isMobile ? '20px' : '24px',
              marginTop: isMobile ? 8 : 12,
            }}
          >
            <div style={{
              textAlign: isMobile ? 'center' : 'left',
            }}>
              <span 
                className="label"
                style={{
                  fontSize: isMobile ? 11 : 12.5,
                }}
              >
                {t('total')}
              </span>
              <div 
                className="price price-lg"
                style={{
                  fontSize: isMobile ? 'clamp(24px, 8vw, 32px)' : '32px',
                  marginTop: 4,
                }}
              >
                {money(total)}
              </div>
            </div>
            
            <button 
              className="btn" 
              onClick={() => navigate('/checkout')}
              style={{
                padding: isMobile ? '16px 24px' : '13px 22px',
                fontSize: isMobile ? 15 : 15,
                minHeight: isMobile ? '52px' : 'auto',
                fontWeight: 700,
              }}
            >
              {t('checkout')} →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

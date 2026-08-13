import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoginGateModal from '../components/LoginGateModal.jsx';

export default function Home() {
  const { t }    = useI18n();
  const { user } = useAuth();
  const { data, loading } = useApi('/products');
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

  const HOME_SLUGS = ['netflix-480p', 'netflix-720p', 'netflix', 'prime-video', 'disney', 'apple-tv-1080p', 'netflix-prime', 'hbo-max-480p', 'hbo-max'];
  const all = data?.products || [];

  const FALLBACK_CARDS = {
    // Netflix Quality Variants
    'netflix-480p':   { _id: 'netflix-480p',   slug: 'netflix-480p',   name: 'Netflix Mobile',        accent: '#e50914', monthlyPrice: 250,  compareAt: 350,  inStock: 12, quality: '480p SD', logo: '/logos/netflix.jpg'       },
    'netflix-720p':   { _id: 'netflix-720p',   slug: 'netflix-720p',   name: 'Netflix Basic',         accent: '#e50914', monthlyPrice: 350,  compareAt: 450,  inStock: 10, quality: '720p HD', logo: '/logos/netflix.jpg'       },
    'netflix':        { _id: 'netflix',        slug: 'netflix',        name: 'Netflix Premium',       accent: '#e50914', monthlyPrice: 450,  compareAt: 600,  inStock: 8, quality: '1080p HD', logo: '/logos/netflix.jpg'       },
    
    // Other Services
    'prime-video':    { _id: 'prime-video',    slug: 'prime-video',    name: 'Prime Video',           accent: '#00a8e1', monthlyPrice: 350,  compareAt: 500,  inStock: 8, quality: '4K UHD', logo: '/logos/prime-video-new.png'   },
    'disney':         { _id: 'disney',         slug: 'disney',         name: 'Disney+',               accent: '#4b6cf7', monthlyPrice: 400,  compareAt: 550,  inStock: 8, quality: '4K UHD', logo: null                       },
    'apple-tv-1080p': { _id: 'apple-tv-1080p', slug: 'apple-tv-1080p', name: 'Apple TV+',             accent: '#d8d8d8', monthlyPrice: 1800, compareAt: 2500, inStock: 3, quality: '8K UHD', logo: '/logos/apple-tv.png'      },
    
    // Bundle
    'netflix-prime':  { _id: 'netflix-prime',  slug: 'netflix-prime',  name: 'Netflix + Prime Video', accent: '#ff6b00', monthlyPrice: 600,  compareAt: 1000, inStock: 5, quality: '4K UHD',  logo: '/logos/netflix-prime-home.png' },
    
    // HBO Max Quality Variants
    'hbo-max-480p':  { _id: 'hbo-max-480p',  slug: 'hbo-max-480p',  name: 'HBO Max Basic',         accent: '#9b30ff', monthlyPrice: 300,  compareAt: 450,  inStock: 9, quality: '480p SD', logo: '/logos/hbo-max-new.png'       },
    'hbo-max':       { _id: 'hbo-max',       slug: 'hbo-max',       name: 'HBO Max Premium',       accent: '#9b30ff', monthlyPrice: 450,  compareAt: 600,  inStock: 6, quality: '4K UHD', logo: '/logos/hbo-max-new.png'       },
  };

  const products = HOME_SLUGS.map(slug => all.find(p => p.slug === slug) || FALLBACK_CARDS[slug]);

  const [gateProduct, setGateProduct] = useState(null);

  const steps = [
    { 
      n: '1', 
      title: t('viewPlan'),  
      body: t('duration'),
      icon: '👁️'
    },
    { 
      n: '2', 
      title: t('pay'),       
      body: t('paymentMethod'),
      icon: '💳'
    },
    { 
      n: '3', 
      title: t('delivered'), 
      body: t('credentials'),
      icon: '✅'
    },
  ];

  const handleCardClick = (e, product) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setGateProduct(product);
    }
  };

  // Get responsive grid columns
  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  return (
    <>
      {gateProduct && !user && (
        <LoginGateModal
          product={gateProduct}
          onClose={() => setGateProduct(null)}
        />
      )}

      {/* hero */}
      <section 
        className="hero-section"
        style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          padding: isMobile ? '60px 0 48px' : isTablet ? '70px 0 56px' : '80px 0 72px' 
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: isMobile 
            ? 'linear-gradient(to bottom, oklch(0.07 0.01 265 / 0.85) 0%, oklch(0.07 0.01 265 / 0.60) 70%, transparent 100%)'
            : 'linear-gradient(to right, oklch(0.07 0.01 265 / 0.82) 0%, oklch(0.07 0.01 265 / 0.45) 55%, transparent 100%)',
        }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="stack" style={{ 
            maxWidth: isMobile ? '100%' : isTablet ? 520 : 600,
            textAlign: isMobile ? 'center' : 'left',
          }}>
            <span 
              className="badge badge-good" 
              style={{ 
                width: 'fit-content', 
                padding: isMobile ? '6px 12px' : '7px 14px', 
                borderRadius: 999, 
                fontSize: isMobile ? 12 : 13,
                alignSelf: isMobile ? 'center' : 'flex-start',
              }}
            >
              {t('heroBadge')}
            </span>
            <h1 style={{ 
              fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : isTablet ? 'clamp(32px, 6vw, 48px)' : 'clamp(36px, 5vw, 58px)', 
              lineHeight: isMobile ? 1.1 : 1.04,
              marginBottom: isMobile ? 8 : 0,
            }}>
              {t('heroTitle')}
            </h1>
            <p 
              className="muted" 
              style={{ 
                fontSize: isMobile ? 16 : 18, 
                lineHeight: 1.55, 
                maxWidth: isMobile ? '100%' : 540,
              }}
            >
              {t('heroSub')}
            </p>
            <div 
              className="row" 
              style={{ 
                marginTop: isMobile ? 12 : 8,
                justifyContent: isMobile ? 'center' : 'flex-start',
                gap: isMobile ? 8 : 12,
              }}
            >
              <Link 
                className="btn" 
                to="/shop"
                style={{
                  padding: isMobile ? '14px 20px' : '13px 22px',
                  fontSize: isMobile ? 14 : 15,
                }}
              >
                {t('browse')} →
              </Link>
              <a 
                className="btn btn-ghost" 
                href="#how"
                style={{
                  padding: isMobile ? '14px 20px' : '13px 22px',
                  fontSize: isMobile ? 14 : 15,
                }}
              >
                {t('howItWorks')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* product grid */}
      <section 
        className="product-showcase"
        style={{ 
          padding: isMobile ? '0 14px 48px' : isTablet ? '0 16px 56px' : '0 16px 64px', 
          maxWidth: 1400, 
          margin: '0 auto' 
        }}
      >
        <div 
          className="spread" 
          style={{ 
            marginBottom: isMobile ? 16 : 22,
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'center',
            textAlign: isMobile ? 'center' : 'left',
            gap: isMobile ? 12 : 16,
          }}
        >
          <h2 style={{ 
            fontSize: isMobile ? 'clamp(20px, 6vw, 28px)' : isTablet ? 'clamp(22px, 4vw, 30px)' : 'clamp(24px, 3vw, 34px)',
            margin: 0,
          }}>
            {t('shop')}
          </h2>
          <Link 
            to="/shop"
            style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 600,
              padding: isMobile ? '8px 16px' : '6px 12px',
              borderRadius: isMobile ? 8 : 6,
              background: isMobile ? 'oklch(1 0 0 / 0.06)' : 'transparent',
              border: isMobile ? '1px solid var(--line)' : 'none',
              textDecoration: 'none',
              color: 'var(--accent)',
              transition: 'all 0.2s ease',
            }}
          >
            {t('browse')} →
          </Link>
        </div>

        {loading && (
          <div 
            className="home-product-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`, 
              gap: isMobile ? 12 : isTablet ? 14 : 16,
            }}
          >
            {Array.from({ length: getGridColumns() * 2 }, (_, i) => (
              <div 
                key={i} 
                style={{
                  borderRadius: 18, 
                  height: isMobile ? 280 : isTablet ? 320 : 340,
                  background: 'oklch(0.13 0.014 265 / 0.97)',
                  animation: 'skeletonPulse 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                }} 
              />
            ))}
          </div>
        )}

        {!loading && (
          <div 
            className="home-product-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`, 
              gap: isMobile ? 12 : isTablet ? 14 : 16,
            }}
          >
            {products.map((p, index) => (
              <div 
                key={p._id} 
                onClickCapture={e => handleCardClick(e, p)}
                style={{ 
                  cursor: user ? 'default' : 'pointer',
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
        
        {/* Mobile "View All" button */}
        {isMobile && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link 
              className="btn btn-ghost"
              to="/shop"
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '14px 24px',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              View All Products →
            </Link>
          </div>
        )}
      </section>

      {/* how it works */}
      <section 
        id="how" 
        className="wrap section" 
        style={{ 
          paddingTop: 0,
          paddingBottom: isMobile ? 40 : isTablet ? 56 : 64,
        }}
      >
        <h2 style={{ 
          fontSize: isMobile ? 'clamp(20px, 6vw, 28px)' : isTablet ? 'clamp(22px, 4vw, 30px)' : 'clamp(24px, 3vw, 34px)', 
          marginBottom: isMobile ? 16 : 22,
          textAlign: isMobile ? 'center' : 'left',
        }}>
          {t('howItWorks')}
        </h2>
        <div 
          className={isMobile ? 'grid grid-1' : isTablet ? 'grid grid-2' : 'grid grid-3'}
          style={{
            gap: isMobile ? 16 : isTablet ? 18 : 20,
          }}
        >
          {steps.map((s, index) => (
            <div 
              className="card" 
              key={s.n}
              style={{
                padding: isMobile ? '20px 16px' : isTablet ? '22px 18px' : '24px 20px',
                textAlign: isMobile ? 'center' : 'left',
                animation: `fadeInUp 0.6s ease-out ${0.3 + index * 0.15}s both`,
              }}
            >
              <div style={{
                width: isMobile ? 40 : isTablet ? 44 : 46, 
                height: isMobile ? 40 : isTablet ? 44 : 46, 
                borderRadius: isMobile ? 10 : isTablet ? 12 : 13,
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                color: 'var(--bg)', 
                display: 'grid', 
                placeItems: 'center',
                fontFamily: "'Space Grotesk', sans-serif", 
                fontWeight: 700, 
                fontSize: isMobile ? 16 : isTablet ? 18 : 20,
                margin: isMobile ? '0 auto 12px' : '0 0 16px 0',
              }}>
                {s.n}
              </div>
              <h3 style={{ 
                fontSize: isMobile ? 16 : isTablet ? 17 : 19, 
                marginTop: isMobile ? 0 : 16,
                marginBottom: isMobile ? 8 : 8,
              }}>
                {s.title}
              </h3>
              <p 
                className="muted" 
                style={{ 
                  marginTop: 8, 
                  fontSize: isMobile ? 13.5 : 14.5,
                  lineHeight: 1.5,
                }}
              >
                {s.body}
              </p>
              {/* Mobile icon enhancement */}
              {isMobile && s.icon && (
                <div style={{
                  fontSize: 24,
                  opacity: 0.3,
                  marginTop: 8,
                }}>
                  {s.icon}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile CTA */}
        {isMobile && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: 32,
          }}>
            <Link 
              className="btn"
              to="/shop"
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '16px 24px',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              Get Started Now →
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

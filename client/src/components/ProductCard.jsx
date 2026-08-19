import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';

const LOGOS = {
  netflix: '/logos/netflix.jpg',
  'netflix-prime': '/logos/netflix-prime-home.png',
  'prime-video': '/logos/prime-video-card.jpeg',
  'apple-tv-1080p': '/logos/apple.png',
  'disney': '/logos/disney.png',
  'hbo-max': '/logos/hbo-max-new.png'
};

export default function ProductCard({ product, index = 0 }) {
  // Use the logo from the product object first, then fallback to LOGOS mapping
  const logoSrc = product.logo || LOGOS[product.slug] || '/logos/netflix.jpg';
  const basePrice = product.monthlyPrice || product.prices?.[0]?.amount || 0;

  return (
    <Link
      to={`/product/${product.slug}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, oklch(0.15 0.02 280) 0%, oklch(0.12 0.03 260) 100%)',
          borderRadius: 18,
          padding: 20,
          height: '100%',
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          border: '1px solid oklch(0.2 0.02 260 / 0.3)'
        }}
      >
        <div style={{
          width: '100%',
          height: 140,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={logoSrc}
            alt={product.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 8
            }}
            onError={e => {
              console.log('Image failed to load:', e.target.src);
              e.target.src = '/logos/netflix.jpg';
            }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
            lineHeight: 1.3,
            color: 'oklch(0.95 0.01 280)'
          }}>
            {product.name}
          </h3>

          <p style={{
            color: 'oklch(0.7 0.01 260)',
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 16,
            flex: 1
          }}>
            {product.description}
          </p>

          {product.quality && (
            <div style={{
              display: 'inline-flex',
              backgroundColor: 'oklch(0.2 0.05 260 / 0.8)',
              color: 'oklch(0.8 0.02 280)',
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              marginBottom: 12,
              alignSelf: 'flex-start'
            }}>
              {product.quality}
            </div>
          )}

          <div style={{
            marginTop: 'auto',
            padding: '12px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                color: 'oklch(0.6 0.01 260)',
                fontSize: 13
              }}>
                Starting from
              </span>
              <div style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'oklch(0.9 0.02 280)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 4
              }}>
                {money(basePrice)}
                <span style={{
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'oklch(0.6 0.01 260)'
                }}>
                  /month
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
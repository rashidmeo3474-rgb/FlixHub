import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { money, priceFor } from '../utils/format.js';
import LoginGateModal from '../components/LoginGateModal.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { data, loading } = useApi(`/products/${slug}`);
  
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [showGate, setShowGate] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const product = data?.product;

  useEffect(() => {
    if (!loading && !product) {
      navigate('/shop');
    }
  }, [product, loading, navigate]);

  const currentPrice = useMemo(() => {
    if (!product) return 0;
    return priceFor(product, selectedDuration);
  }, [product, selectedDuration]);

  const durations = [1, 2, 3, 4, 5, 6];

  const handleAddToCart = () => {
    if (!user) {
      setShowGate(true);
      return;
    }
    
    addToCart({
      productId: product._id,
      duration: selectedDuration,
      quantity: quantity
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ 
          height: 400, 
          background: 'var(--muted-bg)', 
          borderRadius: 16,
          animation: 'skeletonPulse 1.5s ease-in-out infinite'
        }} />
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      {showGate && (
        <LoginGateModal
          product={product}
          onClose={() => setShowGate(false)}
        />
      )}

      <div style={{ padding: '40px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <Link 
          to="/shop" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            marginBottom: 24,
            color: 'var(--muted)',
            textDecoration: 'none'
          }}
        >
          Back to Shop
        </Link>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: isMobile ? 24 : 40
        }}>
          <div>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 16,
                objectFit: 'cover'
              }}
            />
          </div>

          <div>
            <h1 style={{ fontSize: 32, marginBottom: 16 }}>
              {product.name}
            </h1>
            
            <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
              {product.description}
            </p>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>Duration</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {durations.map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`duration ${selectedDuration === duration ? 'active' : ''}`}
                    style={{
                      minWidth: 80,
                      height: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <strong>{duration}</strong>
                    <span style={{ fontSize: 11 }}>
                      month{duration !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              padding: 20,
              background: 'var(--muted-bg)',
              borderRadius: 12,
              marginBottom: 24
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: 18,
                fontWeight: 600
              }}>
                <span>Price:</span>
                <span>{money(currentPrice * quantity)}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                height: 50,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
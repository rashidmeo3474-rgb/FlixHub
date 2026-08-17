import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { money } from '../utils/format.js';
import LoginGateModal from '../components/LoginGateModal.jsx';
import ShopProductCard from '../components/ShopProductCard.jsx';

export default function Shop() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data, loading } = useApi('/api/products');
  const [gateProduct, setGateProduct] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Complete product list with all variants and pricing options for Shop page
  const ALL_PRODUCTS = [
    // Netflix variants with movie backgrounds
    { 
      _id: 'netflix-720p', 
      slug: 'netflix', 
      name: 'Netflix', 
      quality: '720p HD', 
      monthlyPrice: 450, 
      compareAt: 600, 
      accent: '#e50914', 
      category: 'streaming', 
      inStock: 8, 
      active: true, 
      backgroundImage: '/scenes/n01.jpg',
      logo: '/logos/netflix.png',
      prices: { '1': 450, '2': 810, '3': 1125, '4': 1350, '5': 1575, '6': 1800 },
      features: ['Netflix Premium HD', 'Multiple screens', 'Download offline', '24/7 Support'],
      badge: 'POPULAR',
      rating: 4.8,
      description: 'Stream your favorite movies and TV shows in HD quality with Netflix Premium.'
    },
    { 
      _id: 'netflix-480p', 
      slug: 'netflix-480p', 
      name: 'Netflix', 
      quality: '480p SD', 
      monthlyPrice: 350, 
      compareAt: 500, 
      accent: '#e50914', 
      category: 'streaming', 
      inStock: 5, 
      active: true, 
      backgroundImage: '/scenes/n02.jpg',
      logo: '/logos/netflix.png',
      prices: { '1': 350, '2': 630, '3': 875, '4': 1050, '5': 1225, '6': 1400 },
      features: ['Netflix Standard', 'Single screen', 'Basic quality', 'Instant access'],
      rating: 4.6
    },
    { 
      _id: 'netflix-1080p', 
      slug: 'netflix-1080p', 
      name: 'Netflix', 
      quality: '1080p HD', 
      monthlyPrice: 550, 
      compareAt: 750, 
      accent: '#e50914', 
      category: 'streaming', 
      inStock: 3, 
      active: true, 
      backgroundImage: '/scenes/n03.jpg',
      logo: '/logos/netflix.png',
      prices: { '1': 550, '2': 990, '3': 1375, '4': 1650, '5': 1925, '6': 2200 },
      features: ['Netflix Premium Full HD', 'Multiple screens', 'Ultra HD available', 'Download offline'],
      badge: 'BEST VALUE',
      rating: 4.9
    },
    
    // Netflix + Prime Bundle with background
    { 
      _id: 'netflix-prime-4k', 
      slug: 'netflix-prime', 
      name: 'Netflix + Prime Video', 
      quality: '4K UHD', 
      monthlyPrice: 600, 
      compareAt: 1000, 
      accent: '#ff6b00', 
      category: 'bundle', 
      inStock: 5, 
      active: true, 
      backgroundImage: '/scenes/f01.jpg',
      logo: '/logos/netflix-prime.jpg',
      prices: { '1': 600, '2': 1100, '3': 1500, '4': 1800, '5': 2100, '6': 2400 },
      features: ['Netflix Premium 4K', 'Prime Video 4K', 'Download offline', 'Multiple screens'],
      badge: 'POPULAR',
      icon: 'crown',
      rating: 4.9,
      description: 'The ultimate streaming bundle with Netflix and Prime Video in 4K quality.'
    },
    
    // Prime Video variants with backgrounds
    { 
      _id: 'prime-480p', 
      slug: 'prime-video-480p', 
      name: 'Prime Video', 
      quality: '480p SD', 
      monthlyPrice: 250, 
      compareAt: 400, 
      accent: '#00a8e1', 
      category: 'streaming', 
      inStock: 8, 
      active: true, 
      backgroundImage: '/uploads/images (4).jpeg',
      logo: '/logos/prime-video.png',
      prices: { '1': 250, '2': 450, '3': 625, '4': 750, '5': 875, '6': 1000 },
      features: ['Prime Video Standard', 'Amazon Originals', 'Basic quality', 'Instant streaming'],
      rating: 4.5
    },
    { 
      _id: 'prime-720p', 
      slug: 'prime-video-720p', 
      name: 'Prime Video', 
      quality: '720p HD', 
      monthlyPrice: 300, 
      compareAt: 450, 
      accent: '#00a8e1', 
      category: 'streaming', 
      inStock: 6, 
      active: true, 
      backgroundImage: '/scenes/p01.jpg',
      logo: '/logos/prime-video.png',
      prices: { '1': 300, '2': 540, '3': 750, '4': 900, '5': 1050, '6': 1200 },
      features: ['Prime Video HD', 'Amazon Originals', 'HD Quality', 'Multiple devices'],
      rating: 4.7
    },
    { 
      _id: 'prime-1080p', 
      slug: 'prime-video', 
      name: 'Prime Video', 
      quality: '1080p HD', 
      monthlyPrice: 350, 
      compareAt: 500, 
      accent: '#00a8e1', 
      category: 'streaming', 
      inStock: 4, 
      active: true, 
      backgroundImage: '/scenes/p02.jpg',
      logo: '/logos/prime-video.png',
      prices: { '1': 350, '2': 630, '3': 875, '4': 1050, '5': 1225, '6': 1400 },
      features: ['Prime Video Full HD', 'Amazon Originals', 'Full HD Quality', 'Download offline'],
      rating: 4.8
    },
    
    // Disney+ variants with backgrounds  
    { 
      _id: 'disney-480p', 
      slug: 'disney-480p', 
      name: 'Disney+', 
      quality: '480p SD', 
      monthlyPrice: 280, 
      compareAt: 400, 
      accent: '#4b6cf7', 
      category: 'streaming', 
      inStock: 8, 
      active: true, 
      backgroundImage: '/uploads/images (2).jpeg',
      logo: '/uploads/images (2).jpeg',
      prices: { '1': 280, '2': 504, '3': 700, '4': 840, '5': 980, '6': 1120 },
      features: ['Disney+ Standard', 'Marvel & Star Wars', 'Family content', 'Kids profiles'],
      rating: 4.6
    },
    { 
      _id: 'disney-720p', 
      slug: 'disney-720p', 
      name: 'Disney+', 
      quality: '720p HD', 
      monthlyPrice: 340, 
      compareAt: 500, 
      accent: '#4b6cf7', 
      category: 'streaming', 
      inStock: 6, 
      active: true, 
      backgroundImage: '/uploads/images (3).jpeg',
      logo: '/uploads/images (3).jpeg',
      prices: { '1': 340, '2': 612, '3': 850, '4': 1020, '5': 1190, '6': 1360 },
      features: ['Disney+ HD', 'Marvel & Star Wars', 'HD Quality', 'Multiple profiles'],
      rating: 4.7
    },
    { 
      _id: 'disney-1080p', 
      slug: 'disney', 
      name: 'Disney+', 
      quality: '1080p HD', 
      monthlyPrice: 400, 
      compareAt: 550, 
      accent: '#4b6cf7', 
      category: 'streaming', 
      inStock: 4, 
      active: true, 
      backgroundImage: '/uploads/images (5).jpeg',
      logo: '/uploads/images (5).jpeg',
      prices: { '1': 400, '2': 720, '3': 1000, '4': 1200, '5': 1400, '6': 1600 },
      features: ['Disney+ Premium', 'Marvel & Star Wars', 'Full HD + 4K', 'Download offline'],
      rating: 4.8
    },
    
    // HBO Max variants with backgrounds
    { 
      _id: 'hbo-480p', 
      slug: 'hbo-max-480p', 
      name: 'HBO Max', 
      quality: '480p SD', 
      monthlyPrice: 300, 
      compareAt: 450, 
      accent: '#9b30ff', 
      category: 'streaming', 
      inStock: 8, 
      active: true, 
      backgroundImage: '/scenes/f02.jpg',
      logo: '/logos/hbo-max.png',
      prices: { '1': 300, '2': 540, '3': 750, '4': 900, '5': 1050, '6': 1200 },
      features: ['HBO Max Standard', 'Premium content', 'Same-day releases', 'Original series'],
      rating: 4.7
    },
    { 
      _id: 'hbo-720p', 
      slug: 'hbo-max', 
      name: 'HBO Max', 
      quality: '720p HD', 
      monthlyPrice: 380, 
      compareAt: 550, 
      accent: '#9b30ff', 
      category: 'streaming', 
      inStock: 6, 
      active: true, 
      backgroundImage: '/scenes/f03.jpg',
      logo: '/logos/hbo-max.png',
      prices: { '1': 380, '2': 684, '3': 950, '4': 1140, '5': 1330, '6': 1520 },
      features: ['HBO Max HD', 'Premium content', 'HD Quality', 'Same-day releases'],
      rating: 4.8
    },
    
    // Apple TV+ variants with background
    { 
      _id: 'apple-tv-8k', 
      slug: 'apple-tv', 
      name: 'Apple TV+', 
      quality: '8K UHD', 
      monthlyPrice: 1800, 
      compareAt: 2500, 
      accent: '#d8d8d8', 
      category: 'premium', 
      inStock: 3, 
      active: true, 
      backgroundImage: '/logos/apple-tv.png',
      logo: '/logos/apple-tv.png',
      prices: { '1': 1800, '2': 3240, '3': 4500, '4': 5400, '5': 6300, '6': 7200 },
      features: ['Apple TV+ 8K', 'Apple Originals', '8K Ultra HD', 'Dolby Vision'],
      badge: 'PREMIUM',
      icon: 'crown',
      rating: 4.9,
      description: 'Experience the ultimate in streaming quality with Apple TV+ in stunning 8K resolution.'
    },
  ];

  const products = data?.products || ALL_PRODUCTS;

  const handleAddToCart = useCallback((product) => {
    // Handle add to cart functionality
    console.log('Added to cart:', product);
    // You can add actual cart logic here
  }, []);

  const handleCardClick = (e, product) => {
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setGateProduct(product);
    }
  };

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'streaming', label: 'Streaming' },
    { id: 'bundle', label: 'Bundles' },
    { id: 'premium', label: 'Premium' },
  ];

  // Get responsive grid columns
  const getGridColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  if (loading) {
    return (
      <div className="wrap section">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`, 
          gap: isMobile ? 12 : isTablet ? 14 : 16,
        }}>
          {Array.from({ length: getGridColumns() * 4 }, (_, i) => (
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
      </div>
    );
  }

  return (
    <div className="wrap section">
      {gateProduct && !user && (
        <LoginGateModal
          product={gateProduct}
          onClose={() => setGateProduct(null)}
        />
      )}

      {/* Header */}
      <div className="spread" style={{ 
        marginBottom: 32, 
        flexWrap: 'wrap', 
        gap: isMobile ? 16 : 24,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 28 : 34 }}>Shop</h1>
          <p className="muted" style={{ fontSize: isMobile ? 14 : 15, marginTop: 4 }}>
            {filteredProducts.length} premium streaming accounts available
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          flexWrap: 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          paddingBottom: isMobile ? 4 : 0,
        }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontSize: isMobile ? 13 : 14,
                padding: isMobile ? '8px 14px' : '10px 16px',
                flexShrink: 0,
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Products Grid with ShopProductCard Components */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`, 
          gap: isMobile ? 16 : isTablet ? 20 : 24,
        }}
      >
        {filteredProducts.map((product, index) => (
          <div 
            key={product._id} 
            onClickCapture={e => handleCardClick(e, product)}
            style={{ 
              cursor: user ? 'default' : 'pointer',
              animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
            }}
          >
            <ShopProductCard 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ marginBottom: 8 }}>No products found</h3>
          <p className="muted">Try selecting a different category.</p>
        </div>
      )}
    </div>
  );
}
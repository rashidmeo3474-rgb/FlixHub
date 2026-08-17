import { useState, useCallback, memo } from 'react';
import { ShoppingCart, Star, Zap, Crown, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../utils/format.js';

const ShopProductCard = memo(function ShopProductCard({ product, onAddToCart }) {
  const [selectedDuration, setSelectedDuration] = useState('1');
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleDurationChange = useCallback((duration) => {
    setSelectedDuration(duration);
  }, []);

  const handleAddToCart = useCallback(() => {
    const productWithDuration = {
      ...product,
      duration: selectedDuration,
      totalPrice: product.prices?.[selectedDuration] || product.monthlyPrice,
    };
    if (onAddToCart) {
      onAddToCart(productWithDuration);
    }
  }, [product, selectedDuration, onAddToCart]);

  // Create pricing structure if not available
  const prices = product.prices || {
    '1': product.monthlyPrice,
    '2': Math.round(product.monthlyPrice * 1.8),
    '3': Math.round(product.monthlyPrice * 2.5),
    '4': Math.round(product.monthlyPrice * 3.0),
    '5': Math.round(product.monthlyPrice * 3.5),
    '6': Math.round(product.monthlyPrice * 4.0)
  };

  const currentPrice = prices[selectedDuration] || product.monthlyPrice;
  const monthlyPrice = currentPrice / parseInt(selectedDuration);

  // Features array
  const features = product.features || [
    `${product.quality || '1080p HD'} Quality`,
    'Instant Delivery',
    '24/7 Support',
    'Secure Payment'
  ];

  const rating = product.rating || 4.5;

  return (
    <div 
      className="bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-red-500/20 group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundImage: product.backgroundImage || product.logo ? `url(${product.backgroundImage || product.logo})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50"></div>
      
      <div className="relative z-10 p-6">
        {/* Header with Logo and Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {(product.logo && product.logo !== product.backgroundImage) && (
              <img 
                src={product.logo} 
                alt={product.name}
                className="h-8 w-auto object-contain max-w-[120px]"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            )}
            {!product.logo || product.logo === product.backgroundImage ? (
              <h3 className="text-lg font-bold text-white">{product.name}</h3>
            ) : null}
            {product.badge && (
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                product.badge === 'POPULAR' ? 'bg-red-600 text-white' :
                product.badge === 'BEST VALUE' ? 'bg-green-600 text-white' :
                'bg-blue-600 text-white'
              }`}>
                {product.badge}
              </span>
            )}
          </div>
          
          {product.icon && (
            <div className="text-yellow-400">
              {product.icon === 'crown' && <Crown size={20} />}
              {product.icon === 'zap' && <Zap size={20} />}
              {product.icon === 'shield' && <Shield size={20} />}
            </div>
          )}
        </div>

        {/* Title (if logo wasn't shown) */}
        {product.logo && product.logo !== product.backgroundImage && (
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
            {product.name}
          </h3>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Features */}
        <div className="mb-4">
          <ul className="text-gray-300 text-sm space-y-1">
            {features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Quality Badges */}
        {product.quality && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-zinc-800 text-white text-xs rounded border border-zinc-700">
              {product.quality}
            </span>
          </div>
        )}

        {/* Duration Selector */}
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-2">Duration</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(prices).map(([duration, price]) => (
              <button
                key={duration}
                onClick={() => handleDurationChange(duration)}
                className={`p-2 text-xs rounded border transition-all ${
                  selectedDuration === duration
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : 'border-zinc-700 bg-zinc-800 text-gray-300 hover:border-zinc-600'
                }`}
              >
                {duration} Month{duration !== '1' ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={16} 
                fill={i < Math.floor(rating) ? 'currentColor' : 'none'} 
              />
            ))}
          </div>
          <span className="ml-2 text-gray-400 text-sm">
            ({rating}/5)
          </span>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold text-white">
                {money(currentPrice)}
              </span>
              {parseInt(selectedDuration) > 1 && (
                <span className="text-gray-400 text-sm ml-2">
                  ({money(monthlyPrice)}/month)
                </span>
              )}
            </div>
            {product.compareAt && product.compareAt > currentPrice && (
              <span className="text-gray-500 line-through text-sm">
                {money(product.compareAt)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-lg group-hover:shadow-red-500/25"
        >
          <ShoppingCart size={18} />
          <span>Add to Cart</span>
        </button>

        {/* Hover Effects */}
        {isHovered && !isMobile && (
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none rounded-xl transition-all duration-300" />
        )}
      </div>
    </div>
  );
});

export default ShopProductCard;
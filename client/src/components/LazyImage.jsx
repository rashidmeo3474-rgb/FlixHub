import { useState, useRef, useEffect } from 'react';

export default function LazyImage({ 
  src, 
  alt = '', 
  className = '', 
  style = {}, 
  fallback = null,
  threshold = 0.1,
  ...props 
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || typeof IntersectionObserver === 'undefined') {
      // Fallback for older browsers
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(img);
        }
      },
      { 
        threshold,
        // Add margin to start loading before element is visible
        rootMargin: '50px' 
      }
    );

    observer.observe(img);
    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  return (
    <div 
      ref={imgRef}
      className={className}
      style={{
        ...style,
        backgroundColor: isLoaded ? 'transparent' : 'oklch(0.15 0.01 265 / 0.5)',
        transition: 'background-color 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      {...props}
    >
      {/* Loading placeholder */}
      {!isLoaded && !error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `
            linear-gradient(90deg, 
              oklch(0.15 0.01 265 / 0.3) 25%, 
              oklch(0.20 0.01 265 / 0.5) 50%, 
              oklch(0.15 0.01 265 / 0.3) 75%
            )
          `,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }}>
          <style>
            {`
              @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
            `}
          </style>
        </div>
      )}

      {/* Actual image */}
      {isInView && src && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            transform: 'translate3d(0, 0, 0)', // GPU acceleration
          }}
          loading="lazy"
        />
      )}

      {/* Error fallback */}
      {error && fallback && fallback}
      
      {/* Default error state */}
      {error && !fallback && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'oklch(0.15 0.01 265 / 0.8)',
          color: 'var(--muted)',
          fontSize: 12,
          fontWeight: 600
        }}>
          📷
        </div>
      )}
    </div>
  );
}
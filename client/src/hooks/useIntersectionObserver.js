import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  skip = false
} = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element || skip || typeof IntersectionObserver === 'undefined') {
      // Fallback for older browsers or when skipped
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    // Don't create observer if already intersected and triggerOnce is true
    if (triggerOnce && hasIntersected) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting) {
          setHasIntersected(true);
          
          // If triggerOnce, disconnect after first intersection
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, skip, hasIntersected]);

  return [elementRef, isIntersecting, hasIntersected];
}

// Hook for lazy loading images
export function useLazyImage(src, { threshold = 0.1, rootMargin = '50px' } = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [ref, isInView] = useIntersectionObserver({ threshold, rootMargin });

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsError(false);
    };
    
    img.onerror = () => {
      setIsError(true);
      setIsLoaded(false);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src]);

  return {
    ref,
    isInView,
    isLoaded,
    isError,
    shouldLoad: isInView
  };
}

// Hook for staggered animations
export function useStaggeredReveal(items = [], delay = 100) {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const timeouts = useRef([]);

  useEffect(() => {
    // Clear previous timeouts
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    // Reset visible items
    setVisibleItems(new Set());

    // Stagger the reveal
    items.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);
      
      timeouts.current.push(timeout);
    });

    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, [items.length, delay]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  return visibleItems;
}

// Hook for reduced motion preference
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
import { useEffect, useState } from 'react';

// Component to handle performance optimizations
export default function PerformanceOptimizer({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Optimize font loading
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        setIsLoaded(true);
      });
    } else {
      // Fallback for browsers without Font Loading API
      setTimeout(() => setIsLoaded(true), 100);
    }

    // Preload critical resources
    const preloadLinks = [
      { href: '/logos/netflix.png', as: 'image' },
      { href: '/logos/prime-video.png', as: 'image' },
      { href: '/scenes/n01.jpg', as: 'image' },
    ];

    preloadLinks.forEach(link => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.href = link.href;
      linkElement.as = link.as;
      document.head.appendChild(linkElement);
    });

    // Performance observer for monitoring
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Monitor First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Monitor Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return (
    <div style={{ 
      opacity: isLoaded ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {children}
    </div>
  );
}

// Hook for critical resource preloading
export function useCriticalResourcePreload(resources = []) {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as || 'image';
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }, [resources]);
}

// Hook for Web Vitals monitoring
export function useWebVitals() {
  const [vitals, setVitals] = useState({
    lcp: null,
    fid: null,
    cls: null
  });

  useEffect(() => {
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setVitals(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });

      // FID Observer  
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          setVitals(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
        });
      });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setVitals(prev => ({ ...prev, cls: clsValue }));
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Performance monitoring not fully supported');
      }

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    }
  }, []);

  return vitals;
}
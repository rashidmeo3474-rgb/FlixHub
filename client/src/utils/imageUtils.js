// Image loading utilities
export const getImageSrc = (imagePath, fallback = '/logos/netflix.jpg') => {
  if (!imagePath) return fallback;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // For local paths, ensure they start with /
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

export const createImageWithFallback = (src, fallback = '/logos/netflix.jpg') => {
  return new Promise((resolve) => {
    const primarySrc = getImageSrc(src);
    
    preloadImage(primarySrc)
      .then(() => resolve(primarySrc))
      .catch(() => {
        preloadImage(fallback)
          .then(() => resolve(fallback))
          .catch(() => resolve(null)); // No image available
      });
  });
};
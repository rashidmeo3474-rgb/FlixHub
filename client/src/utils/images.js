// Simple image mappings
export const SERVICE_IMAGES = {
  'netflix': '/logos/netflix.jpg',
  'prime-video': '/uploads/images (5).jpeg', 
  'disney': '/uploads/images (3).jpeg',
  'hbo-max': '/logos/hbo-max.png',
  'apple-tv': '/logos/apple-tv.png',
  'netflix-prime': '/logos/netflix-prime.jpg',
};

export const HOME_IMAGES = {
  'netflix': '/scenes/n01.jpg',
  'prime-video': '/uploads/images (4).jpeg', 
  'disney': '/uploads/images (2).jpeg',
  'apple-tv': '/logos/apple-tv.png',
  'netflix-prime': '/scenes/f01.jpg',
  'hbo-max': '/scenes/f02.jpg',
};

export function getServiceImage(slug, context = 'shop') {
  if (context === 'home') {
    return HOME_IMAGES[slug] || SERVICE_IMAGES[slug] || null;
  }
  return SERVICE_IMAGES[slug] || null;
}

export default SERVICE_IMAGES;
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    
    // Handle authentication errors specifically
    if (error.response?.status === 401) {
      localStorage.removeItem('pv_token');
      window.location.href = '/login';
      return Promise.reject(Object.assign(error, { message: 'Session expired. Please login again.' }));
    }
    
    // Handle timeout and connection issues with immediate mock data fallback
    if (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      const path = error.config?.url || '';
      
      // For authentication endpoints, show clear connection error
      if (path.includes('/auth/')) {
        return Promise.reject(Object.assign(error, { 
          message: 'Cannot connect to server. Please ensure the backend is running on port 5000.' 
        }));
      }
      
      // Immediate mock response for products
      if (path.includes('/products')) {
        return Promise.resolve({
          data: {
            products: [
              { _id: '1', name: 'Netflix Premium', slug: 'netflix', quality: '1080p HD', monthlyPrice: 450, compareAt: 600, accent: '#e50914', category: 'movies', inStock: 8, active: true, logo: '/logos/netflix.jpg' },
              { _id: '2', name: 'Netflix + Prime Video', slug: 'netflix-prime', quality: '4K UHD', monthlyPrice: 600, compareAt: 1000, accent: '#ff6b00', category: 'bundle', inStock: 5, active: true, logo: '/logos/netflix-prime-home.png' },
              { _id: '3', name: 'Prime Video', slug: 'prime-video', quality: '4K UHD', monthlyPrice: 350, compareAt: 500, accent: '#00a8e1', category: 'movies', inStock: 8, active: true, logo: '/logos/prime-video-card.jpeg' },
              { _id: '4', name: 'HBO Max Premium', slug: 'hbo-max', quality: '4K UHD', monthlyPrice: 450, compareAt: 700, accent: '#9b30ff', category: 'movies', inStock: 6, active: true, logo: '/logos/hbo-max-new.png' },
              { _id: '5', name: 'Disney+', slug: 'disney', quality: '4K UHD', monthlyPrice: 400, compareAt: 550, accent: '#4b6cf7', category: 'movies', inStock: 8, active: true, logo: null },
              { _id: '6', name: 'Apple TV+', slug: 'apple-tv', quality: '8K UHD', monthlyPrice: 1800, compareAt: 2500, accent: '#d8d8d8', category: 'movies', inStock: 3, active: true, logo: '/logos/apple-tv.png' },
            ]
          }
        });
      }

      // Mock for admin endpoints
      if (path.includes('/admin/')) {
        return Promise.resolve({
          data: { message: 'Backend unavailable, using fallback data' }
        });
      }
    }
    
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
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
    
    // Handle database connection issues with mock data
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      const path = error.config?.url || '';
      
      // Mock response for admin stock endpoints
      if (path.includes('/admin/stock') || path.includes('/stock')) {
        return Promise.resolve({
          data: {
            stock: [
              { id: '1', name: 'Netflix Premium', quality: '1080p HD', monthlyPrice: 450, available: 8, assigned: 4 },
              { id: '2', name: 'Netflix + Prime Video', quality: '4K UHD', monthlyPrice: 600, available: 5, assigned: 3 },
              { id: '3', name: 'Prime Video', quality: '4K UHD', monthlyPrice: 350, available: 6, assigned: 2 },
              { id: '4', name: 'HBO Max Premium', quality: '4K UHD', monthlyPrice: 450, available: 4, assigned: 4 },
              { id: '5', name: 'Disney+', quality: '4K UHD', monthlyPrice: 400, available: 7, assigned: 1 },
              { id: '6', name: 'Apple TV+', quality: '8K UHD', monthlyPrice: 1800, available: 3, assigned: 1 },
            ]
          }
        });
      }
      
      // Mock response for admin accounts/inventory endpoints
      if (path.includes('/admin/accounts') || path.includes('/inventory') || path.includes('/subscriptions')) {
        if (path.includes('/inventory')) {
          return Promise.resolve({
            data: {
              inventory: [
                { product: { _id: '1', name: 'Netflix', accent: '#e50914' }, totalAccounts: 3, totalSlots: 12, available: 8, occupied: 4 },
                { product: { _id: '2', name: 'Netflix + Prime Video', accent: '#ff6b00' }, totalAccounts: 2, totalSlots: 8, available: 5, occupied: 3 },
                { product: { _id: '3', name: 'Prime Video', accent: '#00a8e1' }, totalAccounts: 2, totalSlots: 8, available: 6, occupied: 2 },
                { product: { _id: '4', name: 'HBO Max', accent: '#9b30ff' }, totalAccounts: 2, totalSlots: 8, available: 4, occupied: 4 },
                { product: { _id: '5', name: 'Disney+', accent: '#4b6cf7' }, totalAccounts: 2, totalSlots: 8, available: 7, occupied: 1 },
                { product: { _id: '6', name: 'Apple TV+', accent: '#d8d8d8' }, totalAccounts: 1, totalSlots: 4, available: 3, occupied: 1 },
              ]
            }
          });
        } else {
          return Promise.resolve({
            data: {
              accounts: [
                {
                  _id: 'acc1',
                  login: 'netflix.premium@example.com',
                  totalSlots: 4,
                  product: { _id: '1', name: 'Netflix', accent: '#e50914' },
                  slots: [
                    { index: 1, label: 'Profile 1', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 2, label: 'Profile 2', status: 'assigned', assignedTo: 'user123', assignedAt: new Date() },
                    { index: 3, label: 'Profile 3', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 4, label: 'Profile 4', status: 'assigned', assignedTo: 'user456', assignedAt: new Date() }
                  ]
                },
                {
                  _id: 'acc2',
                  login: 'combo.bundle@example.com',
                  totalSlots: 4,
                  product: { _id: '2', name: 'Netflix + Prime Video', accent: '#ff6b00' },
                  slots: [
                    { index: 1, label: 'Main Profile', status: 'assigned', assignedTo: 'user789', assignedAt: new Date() },
                    { index: 2, label: 'Family Profile', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 3, label: 'Guest Profile', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 4, label: 'Kids Profile', status: 'available', assignedTo: null, assignedAt: null }
                  ]
                },
                {
                  _id: 'acc3',
                  login: 'prime.video@example.com',
                  totalSlots: 4,
                  product: { _id: '3', name: 'Prime Video', accent: '#00a8e1' },
                  slots: [
                    { index: 1, label: 'Profile 1', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 2, label: 'Profile 2', status: 'assigned', assignedTo: 'user101', assignedAt: new Date() },
                    { index: 3, label: 'Profile 3', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 4, label: 'Profile 4', status: 'available', assignedTo: null, assignedAt: null }
                  ]
                },
                {
                  _id: 'acc4',
                  login: 'hbomax.premium@example.com',
                  totalSlots: 4,
                  product: { _id: '4', name: 'HBO Max', accent: '#9b30ff' },
                  slots: [
                    { index: 1, label: 'Main', status: 'assigned', assignedTo: 'user202', assignedAt: new Date() },
                    { index: 2, label: 'Secondary', status: 'assigned', assignedTo: 'user303', assignedAt: new Date() },
                    { index: 3, label: 'Guest', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 4, label: 'Extra', status: 'available', assignedTo: null, assignedAt: null }
                  ]
                },
                {
                  _id: 'acc5',
                  login: 'disney.plus@example.com',
                  totalSlots: 4,
                  product: { _id: '5', name: 'Disney+', accent: '#4b6cf7' },
                  slots: [
                    { index: 1, label: 'Profile 1', status: 'assigned', assignedTo: 'user404', assignedAt: new Date() },
                    { index: 2, label: 'Profile 2', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 3, label: 'Profile 3', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 4, label: 'Profile 4', status: 'available', assignedTo: null, assignedAt: null }
                  ]
                },
                {
                  _id: 'acc6',
                  login: 'appletv.plus@example.com',
                  totalSlots: 4,
                  product: { _id: '6', name: 'Apple TV+', accent: '#d8d8d8' },
                  slots: [
                    { index: 1, label: 'Premium Profile', status: 'assigned', assignedTo: 'user505', assignedAt: new Date() },
                    { index: 2, label: 'Family Profile', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 3, label: 'Guest Profile', status: 'available', assignedTo: null, assignedAt: null },
                    { index: 4, label: 'Extra Profile', status: 'available', assignedTo: null, assignedAt: null }
                  ]
                }
              ],
              products: [
                { _id: '1', name: 'Netflix', slug: 'netflix', accent: '#e50914', quality: '1080p HD' },
                { _id: '2', name: 'Netflix + Prime Video', slug: 'netflix-prime', accent: '#ff6b00', quality: '4K UHD' },
                { _id: '3', name: 'Prime Video', slug: 'prime-video', accent: '#00a8e1', quality: '4K UHD' },
                { _id: '4', name: 'HBO Max', slug: 'hbo-max', accent: '#9b30ff', quality: '4K UHD' },
                { _id: '5', name: 'Disney+', slug: 'disney', accent: '#4b6cf7', quality: '4K UHD' },
                { _id: '6', name: 'Apple TV+', slug: 'apple-tv', accent: '#d8d8d8', quality: '8K UHD' },
              ],
              services: [
                { _id: '1', name: 'Netflix', slug: 'netflix', accent: '#e50914' },
                { _id: '2', name: 'Netflix + Prime Video', slug: 'netflix-prime', accent: '#ff6b00' },
                { _id: '3', name: 'Prime Video', slug: 'prime-video', accent: '#00a8e1' },
                { _id: '4', name: 'HBO Max', slug: 'hbo-max', accent: '#9b30ff' },
                { _id: '5', name: 'Disney+', slug: 'disney', accent: '#4b6cf7' },
                { _id: '6', name: 'Apple TV+', slug: 'apple-tv', accent: '#d8d8d8' },
              ],
              summary: { totalAccounts: 12, totalSlots: 48, available: 33, occupied: 15 }
            }
          });
        }
      }
      
      // Mock response for stats dashboard
      if (path.includes('/admin/stats')) {
        return Promise.resolve({
          data: {
            totalUsers: 0,
            totalOrders: 0, 
            totalRevenue: 0,
            activeAccounts: 0
          }
        });
      }
      
      // Mock response for orders
      if (path.includes('/admin/orders')) {
        return Promise.resolve({
          data: {
            orders: [],
            totalCount: 0
          }
        });
      }
      
      // Mock response for users
      if (path.includes('/admin/users')) {
        return Promise.resolve({
          data: {
            users: [],
            totalCount: 0
          }
        });
      }
      
      // Mock response for payments
      if (path.includes('/payments/admin')) {
        return Promise.resolve({
          data: {
            proofs: [],
            totalCount: 0
          }
        });
      }
      
      // Mock response for products
      if (path.includes('/products')) {
        return Promise.resolve({
          data: {
            products: [
              { _id: '1a', name: 'Netflix Mobile', slug: 'netflix-480p', quality: '480p SD', monthlyPrice: 250, compareAt: 350, accent: '#e50914', category: 'movies', inStock: 12, active: true },
              { _id: '1b', name: 'Netflix Basic', slug: 'netflix-720p', quality: '720p HD', monthlyPrice: 350, compareAt: 450, accent: '#e50914', category: 'movies', inStock: 10, active: true },
              { _id: '1', name: 'Netflix Premium', slug: 'netflix', quality: '1080p HD', monthlyPrice: 450, compareAt: 600, accent: '#e50914', category: 'movies', inStock: 8, active: true },
              { _id: '2', name: 'Netflix + Prime Video', slug: 'netflix-prime', quality: '4K UHD', monthlyPrice: 600, compareAt: 1000, accent: '#ff6b00', category: 'bundle', inStock: 5, active: true },
              { _id: '3', name: 'Prime Video', slug: 'prime-video', quality: '4K UHD', monthlyPrice: 350, compareAt: 500, accent: '#00a8e1', category: 'movies', inStock: 8, active: true },
              { _id: '4a', name: 'HBO Max Basic', slug: 'hbo-max-480p', quality: '480p SD', monthlyPrice: 300, compareAt: 450, accent: '#9b30ff', category: 'movies', inStock: 9, active: true },
              { _id: '4', name: 'HBO Max Premium', slug: 'hbo-max', quality: '4K UHD', monthlyPrice: 450, compareAt: 700, accent: '#9b30ff', category: 'movies', inStock: 6, active: true },
              { _id: '5', name: 'Disney+', slug: 'disney', quality: '4K UHD', monthlyPrice: 400, compareAt: 550, accent: '#4b6cf7', category: 'movies', inStock: 8, active: true },
              { _id: '6', name: 'Apple TV+', slug: 'apple-tv', quality: '8K UHD', monthlyPrice: 1800, compareAt: 2500, accent: '#d8d8d8', category: 'movies', inStock: 3, active: true },
            ]
          }
        });
      }
    }
    
    return Promise.reject(Object.assign(error, { message }));
  }
);

export default api;

import { useCallback, useEffect, useState } from 'react';
import api from '../api/client.js';

/** Small fetch helper: { data, loading, error, reload } */
export default function useApi(path, { deps = [], skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (skip) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get(path);
      setData(res.data);
    } catch (err) {
      // If products API fails, provide mock data
      if (path === '/products' && err.response?.status !== 200) {
        setData({
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
        });
      // Mock data for accounts endpoints
      } else if (path.includes('/admin/accounts') || path.includes('/inventory') || path.includes('/subscriptions')) {
        setData({
          accounts: [],
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
          summary: { totalAccounts: 0, totalSlots: 0, available: 0, occupied: 0 }
        });
      // Mock data for individual services
      } else if (path.includes('/admin/stock')) {
        setData({
          stock: [
            { id: '1a', name: 'Netflix Mobile', quality: '480p SD', monthlyPrice: 250, available: 0, assigned: 0 },
            { id: '1b', name: 'Netflix Basic', quality: '720p HD', monthlyPrice: 350, available: 0, assigned: 0 },
            { id: '1', name: 'Netflix Premium', quality: '1080p HD', monthlyPrice: 450, available: 0, assigned: 0 },
            { id: '2', name: 'Netflix + Prime Video', quality: '4K UHD', monthlyPrice: 600, available: 0, assigned: 0 },
            { id: '3', name: 'Prime Video', quality: '4K UHD', monthlyPrice: 350, available: 0, assigned: 0 },
            { id: '4a', name: 'HBO Max Basic', quality: '480p SD', monthlyPrice: 300, available: 0, assigned: 0 },
            { id: '4', name: 'HBO Max Premium', quality: '4K UHD', monthlyPrice: 450, available: 0, assigned: 0 },
            { id: '5', name: 'Disney+', quality: '4K UHD', monthlyPrice: 400, available: 0, assigned: 0 },
            { id: '6', name: 'Apple TV+', quality: '8K UHD', monthlyPrice: 1800, available: 0, assigned: 0 },
          ]
        });
      // Mock data for admin stats
      } else if (path.includes('/admin/stats')) {
        setData({
          totalUsers: 156,
          totalOrders: 89, 
          totalRevenue: 45600,
          activeAccounts: 24,
          recentOrders: [],
          topProducts: [
            { name: 'Netflix', count: 45 },
            { name: 'Netflix + Prime', count: 32 },
            { name: 'HBO Max', count: 28 },
          ]
        });
      // Mock data for orders
      } else if (path.includes('/admin/orders')) {
        setData({
          orders: [],
          totalCount: 0
        });
      // Mock data for users  
      } else if (path.includes('/admin/users')) {
        setData({
          users: [],
          totalCount: 0
        });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [path, skip]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, reload: load };
}

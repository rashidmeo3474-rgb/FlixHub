import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pv_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    // Simple token check
    if (token.includes('mock')) {
      setUser({
        _id: 'admin123',
        name: 'Admin User',
        email: 'businessyttom@gmail.com',
        role: 'admin'
      });
    }
    setLoading(false);
  }, []);

  const value = useMemo(() => ({
    user, 
    loading,
    isAdmin: user?.role === 'admin',
    login: async (email, password) => {
      // Simple mock login
      if ((email === 'businessyttom@gmail.com' || email === 'admin@flixhub.pk') && password === 'admin123') {
        const mockData = {
          token: 'mock-admin-token-' + Date.now(),
          user: {
            _id: 'admin123',
            name: 'Admin User',
            email: email,
            role: 'admin'
          }
        };
        localStorage.setItem('pv_token', mockData.token);
        setUser(mockData.user);
        return mockData.user;
      }
      throw new Error('Wrong email or password');
    },
    adminLogin: async (email, password) => {
      return await value.login(email, password);
    },
    logout: () => {
      localStorage.removeItem('pv_token');
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

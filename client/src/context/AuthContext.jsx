import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pv_token');
    if (!token) return setLoading(false);
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('pv_token'))
      .finally(() => setLoading(false));
  }, []);

  const persist = ({ token, user: nextUser }) => {
    localStorage.setItem('pv_token', token);
    setUser(nextUser);
    return nextUser;
  };

  const value = useMemo(() => ({
    user, loading,
    isAdmin: user?.role === 'admin',
    login: async (email, password) => persist((await api.post('/auth/login', { email, password })).data),
    register: async (payload) => persist((await api.post('/auth/register', payload)).data),
    adminLogin: async (email, password) => persist((await api.post('/auth/admin/login', { email, password })).data),
    logout: () => { localStorage.removeItem('pv_token'); setUser(null); }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function ProtectedRoute({ role, redirect = '/login', children }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  if (loading) return <div className="wrap section muted">{t('loading')}</div>;
  if (!user) return <Navigate to={redirect} state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  return children ?? <Outlet />;
}

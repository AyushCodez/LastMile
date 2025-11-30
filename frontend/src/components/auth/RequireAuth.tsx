import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: Array<'RIDER' | 'DRIVER'>;
}

export const RequireAuth = ({ children, allowedRoles }: RequireAuthProps) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  console.log('[RequireAuth] Checking auth:', {
    path: location.pathname,
    loading,
    isAuthenticated,
    role,
    allowedRoles
  });

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    console.warn('[RequireAuth] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallback = role === 'DRIVER' ? '/driver' : '/rider';
    console.warn(`[RequireAuth] Role mismatch. Expected ${allowedRoles}, got ${role}. Redirecting to ${fallback}`);
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('employee' | 'manager' | 'admin' | 'hr')[];
}

export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // If user is authenticated but doesn't have the required role,
    // redirect to their default dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');

  if (!isAuthenticated || !token) {
    localStorage.removeItem('token'); // Clean up if inconsistent
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
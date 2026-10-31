// PrivateRoute — redirects to /login if not authenticated
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/RoleContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  // Not logged in → go to login, remember where they were
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role (e.g. customer trying /admin)
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirect = role === 'customer' ? '/customer/subscriptions' : '/admin/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}

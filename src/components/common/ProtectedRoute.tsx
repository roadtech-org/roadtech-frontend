import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 if (allowedRoles && user && !allowedRoles.includes(user.role)) {
  let redirectPath = '/dashboard';

  switch (user.role) {
    case 'ADMIN':
      redirectPath = '/admin';
      break;
    case 'MECHANIC':
      redirectPath = '/mechanic';
      break;
    case 'PARTS_PROVIDER':
      redirectPath = '/parts-provider';
      break;
    case 'USER':
    default:
      redirectPath = '/dashboard';
  }

  return <Navigate to={redirectPath} replace />;
}


  return <>{children}</>;
}

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = [], 
  redirectTo = '/' 
}) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // If user is not authenticated, redirect to home
      if (!user) {
        console.log('🚫 Access denied: User not authenticated');
        setLocation(redirectTo);
        return;
      }

      // If specific roles are required, check user role
      if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
        console.log(`🚫 Access denied: User role '${user.role}' not in required roles:`, requiredRole);
        setLocation(redirectTo);
        return;
      }

      console.log(`✅ Access granted to user: ${user.username} (${user.role})`);
    }
  }, [user, isLoading, requiredRole, redirectTo, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the protected content
  if (!user) {
    return null;
  }

  // If specific roles required and user doesn't have permission, don't render
  if (requiredRole.length > 0 && !requiredRole.includes(user.role)) {
    return null;
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;
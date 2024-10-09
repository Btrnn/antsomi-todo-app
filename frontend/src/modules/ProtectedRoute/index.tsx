// Libraries
import React from 'react';
import { Navigate } from 'react-router-dom';

// Hooks
import { useAuth } from 'hooks';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('auth: ', isAuthenticated);
  if (!loading) {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  }
  return <div>Loading...</div>;
};

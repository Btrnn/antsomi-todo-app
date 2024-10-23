// Libraries
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// Hooks
import { useAuth } from 'hooks';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Hooks
  const location = useLocation();

  if (!loading) {
    if (!isAuthenticated) {
      return <Navigate to={`/login?redirect=${location.pathname}${location.search}`} replace />;
    }
    return <>{children}</>;
  }
  return <div>Loading...</div>;
};

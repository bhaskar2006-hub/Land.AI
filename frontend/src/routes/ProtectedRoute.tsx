import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidUserRole } from '../types/auth';
import { GovernmentBanner } from '../components/landing/GovernmentBanner';

import { LoadingPage } from '../components/LoadingPage';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, role, loading } = useAuth();

  if (loading) {
    return (
      <LoadingPage
        message="Verifying LAND•AI Authorization Credentials..."
        subMessage="Ministry of Rural Development • Department of Land Resources (DoLR)"
      />
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile missing or role invalid -> redirect to unauthorized
  if (!profile || !role || !isValidUserRole(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

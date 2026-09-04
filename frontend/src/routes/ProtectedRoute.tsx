import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidUserRole } from '../types/auth';
import { GovernmentBanner } from '../components/landing/GovernmentBanner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
        <GovernmentBanner />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-10 h-10 border-4 border-[#123B5D] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-[#123B5D]">
            Verifying LAND•AI Authorization Credentials...
          </p>
          <p className="text-xs text-[#667085] mt-1">
            Loading profile from secure administrative directory
          </p>
        </div>
      </div>
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

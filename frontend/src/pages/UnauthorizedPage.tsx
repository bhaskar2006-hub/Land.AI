import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GovernmentBanner } from '../components/landing/GovernmentBanner';

export const UnauthorizedPage: React.FC = () => {
  const { user, role, error, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOutAndExit = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
      <GovernmentBanner />

      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md bg-white border border-[#D9DEE5] rounded-xl shadow-sm overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#123B5D]">
              Authorization Incomplete
            </h1>
            <p className="text-xs text-[#667085] leading-relaxed">
              {error ||
                'Your authenticated account does not possess an authorized LAND•AI role (ADMIN, REVENUE_OFFICER, or VIEWER).'}
            </p>
          </div>

          {user && (
            <div className="bg-[#F5F7FA] border border-[#D9DEE5] rounded-lg p-3 text-xs text-left space-y-1">
              <div className="text-gray-500">Authenticated Email:</div>
              <div className="font-semibold text-gray-800 truncate">{user.email}</div>
              {role && (
                <>
                  <div className="text-gray-500 pt-1">Assigned Role:</div>
                  <div className="font-mono font-bold text-red-600">{role}</div>
                </>
              )}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignOutAndExit}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#123B5D] hover:bg-[#0e2f4a] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out &amp; Return to Gateway</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B6B8F] hover:text-[#123B5D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, UserCheck, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SignInCTASection: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-[#123B5D] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0f324f] border border-[#1B6B8F]/50 rounded-xl p-8 lg:p-12 shadow-md relative overflow-hidden">
          {/* Decorative background glows */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#1B6B8F]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#2E7D5B]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1B6B8F]/40 border border-[#1B6B8F] text-xs font-semibold text-blue-100 uppercase tracking-wider mb-4">
                <Lock className="w-3.5 h-3.5" />
                Authorized Access Gateway
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Access the LAND•AI Workspace
              </h2>
              <p className="mt-3 text-base text-gray-300 leading-relaxed">
                Authorized personnel can sign in to access role-specific land record workflows.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-300">
                <div className="flex items-center gap-1.5 bg-[#0c273e] px-3 py-1.5 rounded border border-[#1B6B8F]/30">
                  <UserCheck className="w-3.5 h-3.5 text-[#2E7D5B]" />
                  <span>Authorized Roles: <strong>ADMIN</strong>, <strong>REVENUE_OFFICER</strong>, <strong>VIEWER</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0c273e] px-3 py-1.5 rounded border border-[#1B6B8F]/30">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Strict Database Role Verification (public.profiles)</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-3 w-full sm:w-auto">
              {user && role ? (
                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/app')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md bg-[#2E7D5B] hover:bg-[#25664a] text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-[#0a2337] hover:bg-[#071927] border border-[#1B6B8F]/50 text-slate-200 hover:text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer"
                    title="Sign Out of Session"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-[#2E7D5B] hover:bg-[#25664a] text-white font-semibold text-base shadow-sm transition-colors"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <p className="text-xs text-gray-400 text-center">
                Secure SSL / TLS 1.3 Transport Encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

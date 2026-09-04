import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GovernmentBanner } from '../components/landing/GovernmentBanner';
import { LoadingPage } from '../components/LoadingPage';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithPassword, user, role, loading } = useAuth();
  const navigate = useNavigate();

  if (isSubmitting) {
    return (
      <LoadingPage
        message="Authenticating Government Officer Credentials..."
        subMessage="Ministry of Rural Development • Department of Land Resources (DoLR)"
      />
    );
  }

  if (loading) {
    return (
      <LoadingPage
        message="Connecting to Ministry of Rural Development Gateway..."
        subMessage="Verifying secure institutional session..."
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please provide both your registered email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signInWithPassword(trimmedEmail, password);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        setIsSubmitting(false);
        return;
      }

      // Successful authentication and role validation -> forward to application
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      console.error('Login submission error:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'An unexpected authentication error occurred. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] text-[#1F2937]">
      <GovernmentBanner />

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Back Navigation Link */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B6B8F] hover:text-[#123B5D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to LAND•AI Public Portal</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-[#D9DEE5] rounded-xl shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="bg-[#123B5D] px-6 py-6 text-white text-center border-b border-[#1B6B8F]">
              <div className="w-12 h-12 rounded-lg bg-[#1B6B8F] mx-auto flex items-center justify-center mb-3 shadow-inner">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                Ministry of Rural Development
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                LAND•AI Officer Gateway
              </h1>
              <p className="text-xs text-blue-100 mt-1 font-mono">
                Department of Land Resources (DoLR) • DILRMP
              </p>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border-b border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-800 leading-relaxed font-medium">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Already Signed In Banner */}
            {user && role && (
              <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                <span>Signed in as <strong>{user.email}</strong></span>
                <Link
                  to="/app"
                  className="font-bold underline text-[#2E7D5B] hover:text-[#25664a]"
                >
                  Enter Workspace &rarr;
                </Link>
              </div>
            )}

            {/* Form: STRICTLY Email, Password, and Sign In button */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1F2937] mb-1.5"
                >
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@landai.gov.in"
                    disabled={isSubmitting}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-[#D9DEE5] rounded-md bg-white text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B8F] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1F2937] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isSubmitting}
                    className="block w-full pl-10 pr-10 py-2.5 text-sm border border-[#D9DEE5] rounded-md bg-white text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B6B8F] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#123B5D] transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#123B5D] hover:bg-[#0e2f4a] active:bg-[#0a2337] text-white text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#123B5D] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials &amp; Role...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-[#D9DEE5] text-center">
                <p className="text-[11px] text-[#667085] leading-normal">
                  Access is strictly restricted to authorized administrative personnel.
                  Session activities are monitored and auditable.
                </p>
              </div>
            </form>
          </div>

          {/* Demonstration Credentials Note & Autofill Box */}
          <div className="mt-5 bg-white border border-[#D9DEE5] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9DEE5]">
              <span className="text-xs font-bold text-[#123B5D] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />
                Demo Credentials
              </span>
              <span className="text-[11px] text-[#667085]">
                Password: <strong className="font-mono text-[#123B5D]">testpassword123</strong>
              </span>
            </div>

            <div className="space-y-2">
              {/* Revenue Officer */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] border border-[#D9DEE5] text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#123B5D] flex items-center gap-1.5">
                    <span>Revenue Officer</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                      REVENUE_OFFICER
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085] font-mono truncate">officer@landai.gov.in</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('officer@landai.gov.in');
                    setPassword('testpassword123');
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#123B5D] hover:bg-[#1B6B8F] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
                  title="Autofill Revenue Officer credentials"
                >
                  <span>Use</span>
                </button>
              </div>

              {/* Viewer */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] border border-[#D9DEE5] text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#123B5D] flex items-center gap-1.5">
                    <span>Departmental Viewer</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                      VIEWER
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085] font-mono truncate">viewer@landai.gov.in</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('viewer@landai.gov.in');
                    setPassword('testpassword123');
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#123B5D] hover:bg-[#1B6B8F] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
                  title="Autofill Viewer credentials"
                >
                  <span>Use</span>
                </button>
              </div>

              {/* Administrator */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7FA] border border-[#D9DEE5] text-xs">
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#123B5D] flex items-center gap-1.5">
                    <span>System Administrator</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono font-bold">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] text-[#667085] font-mono truncate">admin@landai.gov.in</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@landai.gov.in');
                    setPassword('testpassword123');
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1 rounded-md bg-[#123B5D] hover:bg-[#1B6B8F] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
                  title="Autofill Admin credentials"
                >
                  <span>Use</span>
                </button>
              </div>
            </div>
          </div>

          {/* Role Specification Notice */}
          <div className="mt-5 text-center">
            <p className="text-xs text-[#667085]">
              Demonstration Platform • Authorized Roles:
              <span className="font-mono text-gray-700 font-semibold ml-1">
                ADMIN • REVENUE_OFFICER • VIEWER
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

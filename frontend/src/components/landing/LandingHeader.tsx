import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types/auth';

export const LandingHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D9DEE5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3.5">
        {/* Brand Logo & Wordmark with Ministry of Rural Development Header */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <div className="w-11 h-11 rounded-xl bg-[#123B5D] text-white flex items-center justify-center text-2xl shadow-md group-hover:bg-[#1B6B8F] transition-colors flex-shrink-0 border border-blue-400/30">
            🏛️
          </div>
          <div className="flex flex-col">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1B6B8F] flex items-center gap-1.5">
              <span>Government of India</span>
              <span>•</span>
              <span className="text-[#123B5D] font-extrabold">Ministry of Rural Development</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#123B5D]">
                LAND<span className="text-[#1B6B8F]">•</span>AI
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[#E8F1F5] text-[#123B5D] border border-[#1B6B8F]/30">
                DoLR Portal
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#667085] leading-none">
              Department of Land Resources • Cadastral Modernization
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1F2937]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#123B5D] py-1 border-b-2 border-transparent hover:border-[#1B6B8F] transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          {user && role ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-[#123B5D] truncate max-w-[180px]">
                  {user.email}
                </div>
                <div className="text-[10px] font-semibold text-[#2E7D5B]">
                  {ROLE_LABELS[role]}
                </div>
              </div>
              <button
                onClick={() => navigate('/app')}
                className="px-4 py-2 rounded-lg bg-[#123B5D] hover:bg-[#1B6B8F] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <UserCheck size={14} />
                <span>Go to Workspace</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded-lg border border-[#D9DEE5] hover:bg-slate-100 text-[#667085] hover:text-[#1F2937] text-xs font-medium transition-colors cursor-pointer"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-[#123B5D] hover:bg-[#1B6B8F] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-[#123B5D] hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D9DEE5] bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-[#1F2937] hover:bg-[#E8F1F5] hover:text-[#123B5D]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#D9DEE5]">
            {user && role ? (
              <div className="space-y-2">
                <div className="text-xs text-[#667085] px-1">
                  Signed in as: <strong className="text-[#123B5D]">{user.email}</strong> ({ROLE_LABELS[role]})
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/app');
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-[#123B5D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    className="px-3 py-2.5 rounded-lg border border-[#D9DEE5] text-[#667085] text-xs font-semibold cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#123B5D] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow"
              >
                <LogIn size={16} />
                <span>Sign In to LAND•AI</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

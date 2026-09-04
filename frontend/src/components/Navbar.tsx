import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Files,
  CheckSquare,
  MapPin,
  BarChart3,
  ShieldCheck,
  User,
  Shield,
  Award,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, role, setRole, isAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'verify', label: 'Verify', icon: CheckSquare, badge: 'HITL' },
    { id: 'map', label: 'GIS Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: BarChart3, adminOnly: true },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, adminOnly: true }
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070e1c]/90 backdrop-blur-md border-b border-[#162e54] px-4 sm:px-6 py-2 flex items-center justify-between shadow-lg">
      {/* Brand */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => onSelectTab('dashboard')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
          🏛
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black tracking-tight text-white">LAND AI</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold">
            v1.0
          </span>
        </div>
      </div>

      {/* Minimal Navigation Bar */}
      <nav className="hidden md:flex items-center gap-1 bg-[#040a17]/90 p-1 rounded-xl border border-[#162e54]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isRestricted = item.adminOnly && !isAdmin;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isRestricted) setRole('admin');
                onSelectTab(item.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow'
                  : isRestricted
                  ? 'text-slate-500 hover:text-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Minimal Role Badge + Profile Icon with Sign Out Dropdown */}
      <div className="flex items-center gap-3">

        {/* Minimal Role Badge Pill */}
        <button
          onClick={() => setRole(role === 'officer' ? 'admin' : 'officer')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 border ${
            role === 'officer'
              ? 'bg-blue-500/10 text-blue-300 border-blue-500/30 hover:bg-blue-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title="Click to toggle between Officer and Admin permissions"
        >
          {role === 'officer' ? <Shield size={11} /> : <Award size={11} />}
          <span>{role}</span>
        </button>

        <div className="h-5 w-px bg-[#162e54]"></div>

        {/* Minimal Profile Icon Dropdown (No Name Text) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`w-9 h-9 rounded-full p-0.5 border transition-all flex items-center justify-center ${
              menuOpen || currentTab === 'profile'
                ? 'border-blue-400 ring-2 ring-blue-500/30 shadow-lg'
                : 'border-blue-500/30 hover:border-blue-400 bg-blue-950/40'
            }`}
            title="Profile & Account Options"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="User Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-xs font-black text-white shadow-inner">
                {getInitials(user.fullName)}
              </div>
            )}
          </button>

          {/* Minimal Dropdown Menu with Sign Out Option */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#081226] border border-blue-500/40 p-2 shadow-2xl space-y-1 z-50 text-xs">
              <div className="p-2.5 bg-[#050c1c] rounded-xl border border-[#142d54] space-y-0.5">
                <div className="font-bold text-white truncate">{user.fullName}</div>
                <div className="text-[10px] text-blue-300 font-mono truncate">{user.email}</div>
                <div className="text-[9px] text-slate-400 capitalize pt-0.5 flex items-center gap-1 font-semibold">
                  <span>Role: {role}</span> · <span className="text-emerald-400">Signed In</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onSelectTab('profile');
                }}
                className="w-full px-3 py-2 rounded-xl text-slate-200 hover:bg-blue-600/20 hover:text-white transition-all text-left flex items-center gap-2 font-semibold"
              >
                <User size={14} className="text-blue-400" />
                <span>View & Edit Profile</span>
              </button>

              <div className="border-t border-[#142d54] my-1"></div>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="w-full px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-all text-left flex items-center gap-2 font-semibold"
              >
                <LogOut size={14} className="text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

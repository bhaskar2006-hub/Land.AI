import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Files,
  CheckSquare,
  MapPin,
  BarChart3,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'verify', label: 'Verify', icon: CheckSquare, badge: 'HITL' },
    { id: 'map', label: 'GIS Map', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a1628]/95 backdrop-blur-md border-b border-[#1a335a] px-6 py-3 flex items-center justify-between shadow-md">
      {/* Brand */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onSelectTab('dashboard')}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          🏛
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
            ILRDVS
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold uppercase">
              v1.0 AI
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            National Land Record Digitization
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex items-center gap-1 bg-[#070d18]/80 p-1.5 rounded-xl border border-[#1a335a]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
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

      {/* Right status & Profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Radio size={12} className="animate-pulse text-emerald-400" />
          <span className="text-[11px] font-semibold">BHUVAN GIS LIVE</span>
        </div>

        <div className="h-6 w-px bg-[#1a335a]"></div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-700 to-indigo-900 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-white shadow-inner">
            DO
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-200">R. Srinivasan</div>
            <div className="text-[10px] text-slate-400">District Officer (Nilgiris)</div>
          </div>
        </div>
      </div>
    </header>
  );
};

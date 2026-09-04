import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Files,
  CheckSquare,
  MapPin,
  BarChart3,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  officerRole?: string;
  officerEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen = false,
  onCloseMobile,
  isCollapsed: controlledCollapsed,
  onToggleCollapse: controlledToggleCollapse,
  onLogout,
  officerRole,
  officerEmail
}) => {
  // Support both internal state and optional external control
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (controlledToggleCollapse) {
      controlledToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  // Keyboard shortcut: Ctrl+B / Cmd+B to toggle minimizing sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowViewer: true, adminOnly: false },
    { id: 'upload', label: 'Upload', icon: UploadCloud, allowViewer: false, adminOnly: false },
    { id: 'documents', label: 'Documents', icon: Files, allowViewer: true, adminOnly: false },
    { id: 'verify', label: 'Verify', icon: CheckSquare, badge: 'HITL', allowViewer: false, adminOnly: false },
    { id: 'map', label: 'GIS Map', icon: MapPin, allowViewer: true, adminOnly: false },
    { id: 'reports', label: 'Reports', icon: BarChart3, allowViewer: true, adminOnly: false },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck, allowViewer: false, adminOnly: true }
  ];

  const isViewer = officerRole ? officerRole.toLowerCase().includes('viewer') : false;
  const isAdmin = officerRole ? officerRole.toLowerCase().includes('admin') : false;

  const navItems = allNavItems.filter((item) => {
    if (isViewer && !item.allowViewer) return false;
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1090] md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#0a1628]/95 backdrop-blur-xl border-r border-[#1a335a] flex flex-col justify-between z-[1100] transition-all duration-300 ease-in-out shadow-2xl flex-shrink-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Top: Brand Header & Minimize Button */}
        <div>
          <div
            className={`flex items-center border-b border-[#1a335a]/80 py-4 transition-all ${
              isCollapsed ? 'px-3 justify-center flex-col gap-3' : 'px-4 justify-between'
            }`}
          >
            {/* Brand Logo & Name */}
            <div
              className={`flex items-center gap-3 cursor-pointer group select-none min-w-0 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              onClick={() => handleNavClick('dashboard')}
              title="Land.Ai Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform flex-shrink-0">
                🏛
              </div>

              {!isCollapsed && (
                <div className="min-w-0 animate-fade-in">
                  <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    Land.Ai
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold uppercase">
                      v1.0 AI
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate">
                    National Land Digitization
                  </div>
                </div>
              )}
            </div>

            {/* Controls: Minimize Toggle & Mobile Close */}
            <div className="flex items-center gap-1">
              {/* Desktop Minimizing Button */}
              <button
                id="sidebar-minimize-toggle"
                onClick={toggleCollapse}
                className="hidden md:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#12223c] border border-transparent hover:border-[#1a335a] transition-all cursor-pointer shadow-sm"
                title={isCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Minimize Sidebar (Ctrl+B)'}
                aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Minimize navigation sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen size={18} className="text-cyan-400" /> : <PanelLeftClose size={18} />}
              </button>

              {/* Mobile Close Button */}
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80"
                  title="Close Menu"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`p-2.5 space-y-1.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {!isCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2 pt-2 animate-fade-in">
                Navigation
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center rounded-xl text-sm font-medium transition-all select-none text-left ${
                      isCollapsed
                        ? 'justify-center p-2.5'
                        : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-[#12223c]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={19}
                        className={
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-blue-400 transition-colors'
                        }
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-[#0a1628]" />
                    )}
                  </button>

                  {/* Tooltip for Minimized Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#0f1e38] border border-[#1a335a] text-white text-xs font-semibold rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Telemetry & User Card */}
        <div className={`p-3 border-t border-[#1a335a] bg-[#070d18]/60 space-y-2.5 transition-all ${isCollapsed ? 'px-2' : 'p-4'}`}>
          {/* Live Telemetry Badge */}
          <div
            className={`flex items-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold ${
              isCollapsed ? 'justify-center p-2' : 'px-3 py-2 gap-2'
            }`}
            title="ISRO Bhuvan GIS Live Sync Active"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            {!isCollapsed && <span className="tracking-wide text-[11px] truncate">🛰 BHUVAN LIVE</span>}
          </div>

          {/* User / Officer Profile & Logout Button */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between gap-2 px-1'}`}>
            <div
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} min-w-0`}
              title={`${officerEmail || 'District Officer'} • ${officerRole || 'DILRMP Verification Node'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow flex-shrink-0">
                {officerEmail ? officerEmail.substring(0, 2).toUpperCase() : 'DO'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 text-left animate-fade-in max-w-[115px]">
                  <div className="text-xs font-semibold text-white truncate">
                    {officerRole ? officerRole.replace('_', ' ') : 'District Officer'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate" title={officerEmail || 'DILRMP • Node TN/04'}>
                    {officerEmail || 'DILRMP • Node TN/04'}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Action (Expanded Mode) */}
            {!isCollapsed && onLogout && (
              <button
                id="sidebar-logout-button"
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 group"
                title="Sign Out / Logout"
                aria-label="Logout"
              >
                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Logout Action (Collapsed Mode) */}
          {isCollapsed && onLogout && (
            <div className="pt-1 flex justify-center">
              <button
                id="sidebar-logout-button-collapsed"
                onClick={onLogout}
                className="w-full p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-all flex items-center justify-center cursor-pointer group"
                title="Sign Out / Logout"
                aria-label="Logout"
              >
                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

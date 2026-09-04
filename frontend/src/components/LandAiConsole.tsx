import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopSearchBar } from './TopSearchBar';
import { DashboardPage } from '../pages/DashboardPage';
import { UploadPage } from '../pages/UploadPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { VerificationQueuePage } from '../pages/VerificationQueuePage';
import { VerificationDetailPage } from '../pages/VerificationDetailPage';
import { GISMapPage } from '../pages/GISMapPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, UserRole } from '../types/auth';
import { LogOut, AlertTriangle, ShieldAlert } from 'lucide-react';

export const LandAiConsole: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string>('ka-2024-00453');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Role permissions checking
  const activeRole: UserRole = (role as UserRole) || 'VIEWER';

  const isTabAllowed = (tab: string, uRole: UserRole): boolean => {
    switch (tab) {
      case 'dashboard':
      case 'documents':
      case 'map':
      case 'reports':
        return true;
      case 'upload':
      case 'verify':
      case 'verify-detail':
        return uRole === 'ADMIN' || uRole === 'REVENUE_OFFICER';
      case 'audit':
        return uRole === 'ADMIN';
      default:
        return true;
    }
  };

  const handleNavigate = (tab: string, docId?: string) => {
    if (!isTabAllowed(tab, activeRole)) {
      return;
    }
    if (docId) {
      setSelectedDocId(docId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExecuteLogout = async () => {
    try {
      setShowLogoutModal(false);
      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-[#f0f4fc] flex font-sans">
      {/* Left Sidebar Navigation with Role-Aware Filter */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onLogout={() => setShowLogoutModal(true)}
        officerRole={role ? ROLE_LABELS[role] : 'District Officer'}
        officerEmail={user?.email || 'officer@dilrmp.gov.in'}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header: Global Plot / Survey Search Bar */}
        <TopSearchBar
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={() => setShowLogoutModal(true)}
        />

        {/* Dynamic Platform Module Views */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}

          {currentTab === 'upload' && (
            isTabAllowed('upload', activeRole) ? (
              <UploadPage onNavigate={handleNavigate} />
            ) : (
              <AccessRestrictedTab moduleName="Document Upload" requiredRole="REVENUE_OFFICER or ADMIN" />
            )
          )}

          {currentTab === 'documents' && <DocumentsPage onNavigate={handleNavigate} />}

          {currentTab === 'verify' && (
            isTabAllowed('verify', activeRole) ? (
              <VerificationQueuePage onNavigate={handleNavigate} />
            ) : (
              <AccessRestrictedTab moduleName="Verification Queue" requiredRole="REVENUE_OFFICER or ADMIN" />
            )
          )}

          {currentTab === 'verify-detail' && (
            isTabAllowed('verify-detail', activeRole) ? (
              <VerificationDetailPage
                key={selectedDocId}
                docId={selectedDocId}
                onBack={() => handleNavigate('verify')}
                onNavigate={handleNavigate}
              />
            ) : (
              <AccessRestrictedTab moduleName="Verification Detail Audit" requiredRole="REVENUE_OFFICER or ADMIN" />
            )
          )}

          {currentTab === 'map' && <GISMapPage onNavigate={handleNavigate} />}

          {currentTab === 'reports' && <ReportsPage />}

          {currentTab === 'audit' && (
            isTabAllowed('audit', activeRole) ? (
              <AuditLogsPage />
            ) : (
              <AccessRestrictedTab moduleName="System Audit Trail" requiredRole="ADMIN" />
            )
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1a335a] bg-[#0a1628] py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              🏛 <strong>Land.Ai</strong> — Intelligent Land Record Digitization &amp; Validation System
            </div>
            <div>
              Integrated with Digital India Land Records Modernization Programme (DILRMP) &amp; ISRO Bhuvan GIS
            </div>
          </div>
        </footer>
      </div>

      {/* Modern Officer Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-[#0a1628] border border-[#1a335a] rounded-2xl shadow-2xl p-6 space-y-5"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Sign Out of Land.Ai
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  You are signed in as <strong className="text-white">{user?.email}</strong> ({role ? ROLE_LABELS[role] : ''}).
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 rounded-xl bg-[#070d18] border border-[#1a335a] text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <AlertTriangle size={15} />
                <span>Session Termination Notice</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Signing out will safely invalidate your Supabase session and return you to the public LAND•AI homepage.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#0e1e38] hover:bg-[#152a4e] border border-[#1a335a] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Stay Signed In
              </button>
              <button
                onClick={handleExecuteLogout}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut size={15} />
                <span>Confirm Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AccessRestrictedTab: React.FC<{ moduleName: string; requiredRole: string }> = ({
  moduleName,
  requiredRole
}) => (
  <div className="max-w-xl mx-auto my-16 bg-[#0a1628] border border-[#1a335a] rounded-2xl p-8 text-center space-y-4 shadow-xl">
    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
      <ShieldAlert size={28} />
    </div>
    <h2 className="text-lg font-bold text-white tracking-tight">
      Access Restricted: {moduleName}
    </h2>
    <p className="text-xs text-slate-400 leading-relaxed">
      This operational module requires <strong>{requiredRole}</strong> authorization. 
      Your current role has read-only access to published land records, GIS parcels, and summary reports.
    </p>
  </div>
);

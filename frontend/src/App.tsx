import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';
import { VerificationDetailPage } from './pages/VerificationDetailPage';
import { GISMapPage } from './pages/GISMapPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string>('ka-2024-00453');

  const handleNavigate = (tab: string, docId?: string) => {
    if (docId) {
      setSelectedDocId(docId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-[#f0f4fc] flex flex-col font-sans">
      <Navbar currentTab={currentTab} onSelectTab={(tab) => handleNavigate(tab)} />

      <main className="flex-1 p-6 md:p-8">
        {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentTab === 'upload' && <UploadPage onNavigate={handleNavigate} />}
        {currentTab === 'documents' && <DocumentsPage onNavigate={handleNavigate} />}
        {currentTab === 'verify' && <VerificationQueuePage onNavigate={handleNavigate} />}
        {currentTab === 'verify-detail' && (
          <VerificationDetailPage
            key={selectedDocId}
            docId={selectedDocId}
            onBack={() => handleNavigate('verify')}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === 'map' && <GISMapPage onNavigate={handleNavigate} />}
        {currentTab === 'reports' && <ReportsPage />}
        {currentTab === 'audit' && <AuditLogsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a335a] bg-[#0a1628] py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            🏛 <strong>ILRDVS</strong> — Intelligent Land Record Digitization & Validation System
          </div>
          <div>
            Integrated with Digital India Land Records Modernization Programme (DILRMP) & ISRO Bhuvan GIS
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

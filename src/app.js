/**
 * LAND•AI Application Controller
 * Orchestrates the end-to-end land record digitization, validation, GIS reconciliation,
 * human verification, and audit trail workflow.
 */

import { documentService, DEMO_DOCUMENTS } from '../services/documentService.js';
import { extractionService, getConfidenceCategory } from '../services/extractionService.js';
import { validationService } from '../services/validationService.js';
import { parcelService } from '../services/parcelService.js';
import { verificationService, OFFICER_PROFILE } from '../services/verificationService.js';
import { auditService } from '../services/auditService.js';
import { authService } from './services/authService.ts';
import { isSupabaseConfigured } from './lib/supabase.ts';

// Global application state
const appState = {
  currentView: 'dashboard',
  activeDocumentId: 'DOC-2026-00421',
  docZoom: 100,
  docHighContrast: false,
  pendingDecision: null,
  redirectRoute: null
};

// =========================================================
// AUTHENTICATION & LOGIN VIEW CONTROLLERS
// =========================================================

export function showLoginView() {
  const loginView = document.getElementById('view-login');
  const sidebar = document.getElementById('appSidebar');
  const mainShell = document.getElementById('mainAppShell');

  if (loginView) loginView.classList.remove('hidden');
  if (sidebar) sidebar.classList.add('hidden');
  if (mainShell) mainShell.classList.add('hidden');
  window.location.hash = '#/login';
}
window.showLoginView = showLoginView;

export function hideLoginView() {
  const loginView = document.getElementById('view-login');
  const sidebar = document.getElementById('appSidebar');
  const mainShell = document.getElementById('mainAppShell');

  if (loginView) loginView.classList.add('hidden');
  if (sidebar) sidebar.classList.remove('hidden');
  if (mainShell) mainShell.classList.remove('hidden');
}
window.hideLoginView = hideLoginView;

// =========================================================
// MOBILE DRAWER CONTROLLER
// =========================================================

export function openMobileNav() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('mobileNavOverlay');
  if (sidebar) sidebar.classList.remove('-translate-x-full');
  if (overlay) overlay.classList.remove('hidden');
}
window.openMobileNav = openMobileNav;

export function closeMobileNav() {
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('mobileNavOverlay');
  if (sidebar) sidebar.classList.add('-translate-x-full');
  if (overlay) overlay.classList.add('hidden');
}
window.closeMobileNav = closeMobileNav;

// =========================================================
// VIEW NAVIGATION & TAB SWITCHING (WITH ROUTE GUARD)
// =========================================================
// ROLE PERMISSIONS & ACCESS CONTROL MATRIX
// =========================================================

export const ROLE_PERMISSIONS = {
  ADMIN: ['dashboard', 'documents', 'extraction', 'ledger', 'validation', 'gis', 'review', 'verification', 'certificate', 'audit', 'users', 'settings'],
  REVENUE_OFFICER: ['dashboard', 'documents', 'extraction', 'ledger', 'validation', 'gis', 'review', 'verification', 'certificate', 'audit'],
  REVIEWER: ['dashboard', 'documents', 'ledger', 'validation', 'gis', 'review', 'verification', 'certificate', 'audit'],
  VIEWER: ['dashboard', 'gis', 'certificate']
};

export function switchView(viewKey) {
  // Handle route aliases
  if (viewKey === 'validation') viewKey = 'ledger';

  // Authentication Guard: Check whether user is logged in with an active database profile
  const authState = authService.getState();
  if (!authState.isAuthenticated || !authState.profile) {
    appState.redirectRoute = (viewKey && viewKey !== 'login') ? viewKey : 'dashboard';
    showLoginView();
    return;
  }

  const role = authState.role || 'VIEWER';
  const allowedViews = ROLE_PERMISSIONS[role] || ['dashboard', 'gis', 'certificate'];

  const allViews = [
    'dashboard', 'documents', 'extraction', 'ledger', 'gis',
    'review', 'verification', 'certificate', 'audit', 'users', 'settings', 'access-denied'
  ];

  // Role Permissions Guard: If unauthorized, display Access Denied view
  if (!allowedViews.includes(viewKey)) {
    allViews.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (el) el.classList.add('hidden');
    });

    const deniedView = document.getElementById('view-access-denied');
    if (deniedView) deniedView.classList.remove('hidden');

    const deniedRoleBadge = document.getElementById('deniedUserRoleBadge');
    if (deniedRoleBadge) deniedRoleBadge.textContent = role;

    const deniedModulePath = document.getElementById('deniedModulePath');
    if (deniedModulePath) deniedModulePath.textContent = '/' + viewKey;

    const breadcrumb = document.getElementById('breadcrumbCurrent');
    if (breadcrumb) breadcrumb.textContent = 'Access Restricted';

    triggerToast(`Access Denied: ${role} role cannot access module /${viewKey}.`);
    appState.currentView = 'access-denied';
    window.location.hash = '#/' + viewKey;
    closeMobileNav();
    return;
  }

  // Hide all views, activate target view
  allViews.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) {
      if (v === viewKey) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Update Ribbon buttons styling
  const ribbonMap = [
    'dashboard', 'documents', 'extraction', 'ledger', 'gis',
    'review', 'verification', 'certificate', 'audit', 'users', 'settings'
  ];

  ribbonMap.forEach(v => {
    const btn = document.getElementById('ribbon-' + v);
    if (btn) {
      if (v === viewKey) {
        btn.className = "ribbon-btn active-ribbon px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm shrink-0 shadow-md";
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        btn.className = "ribbon-btn px-3 py-1.5 rounded-xl font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low flex items-center gap-1.5 whitespace-nowrap text-xs sm:text-sm shrink-0";
      }
    }
  });

  // Update Side Nav Tabs styling
  const navMap = {
    'dashboard': 'nav-btn-dashboard',
    'documents': 'nav-btn-documents',
    'extraction': 'nav-btn-extraction',
    'ledger': 'nav-btn-ledger',
    'gis': 'nav-btn-gis',
    'review': 'nav-btn-review',
    'verification': 'nav-btn-verification',
    'certificate': 'nav-btn-certificate',
    'audit': 'nav-btn-audit',
    'users': 'nav-btn-users',
    'settings': 'nav-btn-settings'
  };

  Object.keys(navMap).forEach(key => {
    const navEl = document.getElementById(navMap[key]);
    if (navEl) {
      if (key === viewKey) {
        navEl.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-label-md transition-all duration-200 border-r-2 border-primary bg-surface-container-low text-primary font-semibold hover-lift shadow-xs";
      } else {
        navEl.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-label-md transition-all duration-200 text-on-surface-variant font-normal hover:bg-surface-container-low hover:text-on-surface hover-lift";
      }
    }
  });

  // Update Breadcrumb text
  const titles = {
    'dashboard': 'Dashboard Overview',
    'documents': 'Cadastral Documents Repository',
    'extraction': 'AI Extraction & Optical Inspection',
    'ledger': '3-Source Reconciliation Ledger',
    'gis': 'GIS Shajra Cadastral Map View',
    'review': 'Review Queue',
    'verification': 'Human Verification & Decision',
    'certificate': 'Verified Land Record Certificate',
    'audit': 'Cryptographic Audit Trail',
    'users': 'Personnel & Role Governance',
    'settings': 'System Telemetry & Security'
  };
  const breadcrumb = document.getElementById('breadcrumbCurrent');
  if (breadcrumb) {
    breadcrumb.textContent = titles[viewKey] || 'Operational Workbench';
  }

  appState.currentView = viewKey;
  window.location.hash = '#/' + viewKey;

  // View-specific data rendering
  if (viewKey === 'dashboard') renderDashboard();
  if (viewKey === 'documents') renderDocumentsView();
  if (viewKey === 'extraction') renderExtraction();
  if (viewKey === 'review') renderReviewQueue();
  if (viewKey === 'audit') renderAuditTrail();
  if (viewKey === 'users') renderUserManagement();
  if (viewKey === 'settings') renderSystemSettings();

  // Scroll to top
  const vp = document.getElementById('contentViewport');
  if (vp) vp.scrollTop = 0;

  closeMobileNav();
}

// Expose switchView to global window for onclick handlers
window.switchView = switchView;

// =========================================================
// TOAST NOTIFICATIONS
// =========================================================

export function triggerToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3200);
  }
}
window.triggerToast = triggerToast;

// =========================================================
// ROLE-AWARE DASHBOARD RENDERING
// =========================================================

export async function renderDashboard() {
  const authState = authService.getState();
  const role = authState.role || 'VIEWER';

  // 1. Role-aware banner text
  const bannerBadge = document.getElementById('dashboardBannerBadge');
  const bannerTitle = document.getElementById('dashboardBannerTitle');
  const bannerDesc = document.getElementById('dashboardBannerDesc');

  if (role === 'ADMIN') {
    if (bannerBadge) bannerBadge.textContent = 'SYSTEM ADMINISTRATION HUB';
    if (bannerTitle) bannerTitle.textContent = 'National Cadastral Integrity & Platform Governance';
    if (bannerDesc) bannerDesc.textContent = 'System-wide telemetry, user clearance, automated RLS enforcement, and district audit status.';
  } else if (role === 'REVENUE_OFFICER') {
    if (bannerBadge) bannerBadge.textContent = 'STATUTORY REVENUE WORKBENCH';
    if (bannerTitle) bannerTitle.textContent = 'Land Records Digitization & Cadastral Adjudication';
    if (bannerDesc) bannerDesc.textContent = 'Operational telemetry on AI OCR throughput, GIS discrepancy reconciliation, and verification queue.';
  } else if (role === 'REVIEWER') {
    if (bannerBadge) bannerBadge.textContent = 'REVIEW & VERIFICATION TERMINAL';
    if (bannerTitle) bannerTitle.textContent = 'Cadastral Discrepancy & Human Review Queue';
    if (bannerDesc) bannerDesc.textContent = 'Review operational deeds, adjudicate field mismatches, and resolve GIS boundary conflicts.';
  } else {
    // VIEWER
    if (bannerBadge) bannerBadge.textContent = 'PUBLIC CADASTRAL PORTAL (READ-ONLY)';
    if (bannerTitle) bannerTitle.textContent = 'Verified Land Records & Survey Registry';
    if (bannerDesc) bannerDesc.textContent = 'Statutory verified survey parcels, issued land certificates, and authenticated GIS Shajra maps.';
  }

  // 2. Role-aware KPI Cards
  const c1Title = document.getElementById('dashCard1Title');
  const c1Value = document.getElementById('dashCard1Value');
  const c1Sub = document.getElementById('dashCard1Sub');

  const c2Title = document.getElementById('dashCard2Title');
  const c2Value = document.getElementById('dashCard2Value');
  const c2Sub = document.getElementById('dashCard2Sub');

  const c3Title = document.getElementById('dashCard3Title');
  const c3Value = document.getElementById('dashCard3Value');
  const c3Sub = document.getElementById('dashCard3Sub');

  const c4Title = document.getElementById('dashCard4Title');
  const c4Value = document.getElementById('dashCard4Value');
  const c4Sub = document.getElementById('dashCard4Sub');

  const c5Title = document.getElementById('dashCard5Title');
  const c5Value = document.getElementById('dashCard5Value');
  const c5Sub = document.getElementById('dashCard5Sub');

  if (role === 'ADMIN') {
    if (c1Title) c1Title.textContent = 'Total Ingested Deeds';
    if (c1Value) c1Value.textContent = '12,486';
    if (c1Sub) c1Sub.textContent = 'Statewide Archive';

    if (c2Title) c2Title.textContent = 'AI Processed';
    if (c2Value) c2Value.textContent = '11,920';
    if (c2Sub) c2Sub.textContent = '95.5% OCR Rate';

    if (c3Title) c3Title.textContent = 'Verified Records';
    if (c3Value) c3Value.textContent = '10,842';
    if (c3Sub) c3Sub.textContent = '91.0% Clearance';

    if (c4Title) c4Title.textContent = 'Active Personnel';
    if (c4Value) c4Value.textContent = '42 Users';
    if (c4Sub) c4Sub.textContent = '4 Roles Active';

    if (c5Title) c5Title.textContent = 'System Error Rate';
    if (c5Value) c5Value.textContent = '0.01%';
    if (c5Sub) c5Sub.textContent = 'Zero Security Violations';
  } else if (role === 'REVENUE_OFFICER') {
    if (c1Title) c1Title.textContent = 'Documents Ingested';
    if (c1Value) c1Value.textContent = '12,486';
    if (c1Sub) c1Sub.textContent = 'Mandal Desk';

    if (c2Title) c2Title.textContent = 'AI Extraction Done';
    if (c2Value) c2Value.textContent = '11,920';
    if (c2Sub) c2Sub.textContent = '95.5% Confidence';

    if (c3Title) c3Title.textContent = 'Signed & Gazetted';
    if (c3Value) c3Value.textContent = '10,842';
    if (c3Sub) c3Sub.textContent = 'Certified Records';

    if (c4Title) c4Title.textContent = 'Review Required';
    if (c4Value) c4Value.textContent = '738';
    if (c4Sub) c4Sub.textContent = 'Pending Adjudication';

    if (c5Title) c5Title.textContent = 'GIS Conflicts';
    if (c5Value) c5Value.textContent = '184';
    if (c5Sub) c5Sub.textContent = 'Boundary Mismatches';
  } else if (role === 'REVIEWER') {
    if (c1Title) c1Title.textContent = 'Awaiting Review';
    if (c1Value) c1Value.textContent = '738';
    if (c1Sub) c1Sub.textContent = 'Queue Priority 1';

    if (c2Title) c2Title.textContent = 'Verification Queue';
    if (c2Value) c2Value.textContent = '42';
    if (c2Sub) c2Sub.textContent = 'Decisions Pending';

    if (c3Title) c3Title.textContent = 'Reviewed Today';
    if (c3Value) c3Value.textContent = '129';
    if (c3Sub) c3Sub.textContent = 'Cleared by Reviewers';

    if (c4Title) c4Title.textContent = 'Validation Conflicts';
    if (c4Value) c4Value.textContent = '184';
    if (c4Sub) c4Sub.textContent = '3-Source Mismatches';

    if (c5Title) c5Title.textContent = 'GIS Conflicts';
    if (c5Value) c5Value.textContent = '184';
    if (c5Sub) c5Sub.textContent = 'Area Discrepancies';
  } else {
    // VIEWER
    if (c1Title) c1Title.textContent = 'Public Records Catalog';
    if (c1Value) c1Value.textContent = '10,842';
    if (c1Sub) c1Sub.textContent = 'Available for Search';

    if (c2Title) c2Title.textContent = 'Verified GIS Parcels';
    if (c2Value) c2Value.textContent = '500';
    if (c2Sub) c2Sub.textContent = 'Mangalagiri Mandal';

    if (c3Title) c3Title.textContent = 'Issued Certificates';
    if (c3Value) c3Value.textContent = '10,842';
    if (c3Sub) c3Sub.textContent = 'Cryptographically Signed';

    if (c4Title) c4Title.textContent = 'Registry Clearance';
    if (c4Value) c4Value.textContent = '91.0%';
    if (c4Sub) c4Sub.textContent = 'Settlement Status';

    if (c5Title) c5Title.textContent = 'Public Audit Status';
    if (c5Value) c5Value.textContent = 'Active';
    if (c5Sub) c5Sub.textContent = 'Tamper-Evident Ledger';
  }

  // 3. Populate Recent Documents Table with role-aware actions
  const tableBody = document.getElementById('dashboardRecentTable');
  if (!tableBody) return;

  const docs = await documentService.getDocuments();
  tableBody.innerHTML = '';

  docs.forEach(doc => {
    const isTarget = doc.id === 'DOC-2026-00421';
    const tr = document.createElement('tr');
    tr.className = `interactive-row transition-all duration-150 cursor-pointer ${isTarget ? 'bg-surface-container-low/40 font-medium' : ''}`;
    
    let statusPill = '';
    if (doc.status === 'GIS Conflict' || doc.status === 'CONFLICT') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-data-mono font-bold bg-[#FDE8EA] text-error border border-[#F8B4B9] shadow-2xs">
        <span class="material-symbols-outlined text-xs" data-icon="error">error</span> GIS Conflict (-0.14 Ac)
      </span>`;
    } else if (doc.status === 'VERIFIED') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-data-mono font-bold bg-[#EBF7EE] text-[#198754] border border-[#C2E7CB] shadow-2xs">
        <span class="material-symbols-outlined text-xs" data-icon="verified">verified</span> Verified &amp; Signed
      </span>`;
    } else if (doc.status === 'Review Required') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-data-mono font-bold bg-[#FEF6E7] text-[#F59E0B] border border-[#FCDAA7] shadow-2xs">
        <span class="material-symbols-outlined text-xs" data-icon="draw">draw</span> Review Required
      </span>`;
    } else {
      statusPill = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-data-mono font-bold bg-[#EBF7EE] text-[#198754] border border-[#C2E7CB] shadow-2xs">
        <span class="material-symbols-outlined text-xs" data-icon="check_circle">check_circle</span> Synchronized
      </span>`;
    }

    let actionBtn = '';
    if (role === 'VIEWER') {
      actionBtn = `<button onclick="switchView('certificate')" class="px-3 py-1.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 text-label-sm font-semibold hover:bg-secondary hover:text-white transition-all duration-150 hover-lift shadow-xs">
        View Certificate &rarr;
      </button>`;
    } else if (role === 'REVIEWER') {
      actionBtn = `<button onclick="switchView('review')" class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:bg-secondary transition-all duration-150 hover-lift shadow-xs">
        Review Record &rarr;
      </button>`;
    } else {
      actionBtn = `<button onclick="inspectDocumentWorkflow('${doc.id}')" class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-label-sm font-semibold hover:bg-secondary transition-all duration-150 hover-lift shadow-xs">
        Open Workflow &rarr;
      </button>`;
    }

    tr.innerHTML = `
      <td class="py-3.5 px-4 font-data-mono font-bold text-primary flex items-center gap-2">
        <span class="material-symbols-outlined ${isTarget ? 'text-secondary' : 'text-outline'} text-base" data-icon="bookmark">bookmark</span>
        ${doc.id}
      </td>
      <td class="py-3.5 px-4">
        <div class="font-semibold text-on-surface">${doc.district} / ${doc.mandal}</div>
        <div class="text-[11px] text-on-surface-variant">Village: ${doc.village}</div>
      </td>
      <td class="py-3.5 px-4 font-data-mono font-bold text-primary">${doc.surveyNo}</td>
      <td class="py-3.5 px-4 font-medium text-on-surface">${doc.ownerName}</td>
      <td class="py-3.5 px-4">
        <div class="flex items-center gap-2">
          <span class="font-data-mono text-xs font-semibold ${doc.confidenceOverall >= 90 ? 'text-[#198754]' : 'text-[#F59E0B]'}">${doc.confidenceOverall}%</span>
          <div class="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div class="${doc.confidenceOverall >= 90 ? 'bg-[#198754]' : 'bg-[#F59E0B]'} h-full transition-all duration-300" style="width: ${doc.confidenceOverall}%"></div>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-4">${statusPill}</td>
      <td class="py-3.5 px-4 text-right space-x-1">
        ${actionBtn}
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

export function inspectDocumentWorkflow(docId) {
  appState.activeDocumentId = docId;
  const authState = authService.getState();
  const role = authState.role || 'VIEWER';
  if (role === 'VIEWER') {
    switchView('certificate');
  } else if (role === 'REVIEWER') {
    switchView('review');
  } else {
    switchView('extraction');
  }
}
window.inspectDocumentWorkflow = inspectDocumentWorkflow;

// =========================================================
// DOCUMENTS REPOSITORY VIEW
// =========================================================

export async function renderDocumentsView() {
  const tableBody = document.getElementById('documentsTableBody');
  if (!tableBody) return;

  const authState = authService.getState();
  const role = authState.role || 'VIEWER';

  const modeBadge = document.getElementById('documentsModeBadge');
  if (modeBadge) {
    if (role === 'REVIEWER') {
      modeBadge.classList.remove('hidden');
      modeBadge.textContent = 'REVIEWER: READ-ONLY DOCUMENT MODE';
    } else {
      modeBadge.classList.add('hidden');
    }
  }

  const uploadBtn = document.getElementById('documentsUploadBtn');
  if (uploadBtn) {
    if (role === 'ADMIN' || role === 'REVENUE_OFFICER') {
      uploadBtn.classList.remove('hidden');
    } else {
      uploadBtn.classList.add('hidden');
    }
  }

  const docs = await documentService.getDocuments();
  tableBody.innerHTML = '';

  docs.forEach(doc => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-surface-container-low/50 transition-colors';

    let actionBtn = '';
    if (role === 'REVIEWER') {
      actionBtn = `<button onclick="switchView('review')" class="px-3 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-primary font-semibold text-xs hover:bg-surface-container-high transition hover-lift">
        Inspect in Queue &rarr;
      </button>`;
    } else {
      actionBtn = `<button onclick="inspectDocumentWorkflow('${doc.id}')" class="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-secondary transition hover-lift">
        Open Workflow &rarr;
      </button>`;
    }

    tr.innerHTML = `
      <td class="py-3 px-4 font-data-mono font-bold text-primary">${doc.id}</td>
      <td class="py-3 px-4">${doc.district} / ${doc.mandal}</td>
      <td class="py-3 px-4 font-data-mono font-bold text-primary">${doc.surveyNo}</td>
      <td class="py-3 px-4 font-medium">${doc.ownerName}</td>
      <td class="py-3 px-4 text-xs font-data-mono text-outline">Deed (1974)</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-data-mono font-bold bg-secondary/15 text-secondary border border-secondary/30">
          ${doc.status}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        ${actionBtn}
      </td>
    `;
    tableBody.appendChild(tr);
  });
}
window.renderDocumentsView = renderDocumentsView;

// =========================================================
// USER MANAGEMENT & ROLE ASSIGNMENT (ADMIN ONLY)
// =========================================================

export async function renderUserManagement() {
  const tableBody = document.getElementById('userManagementTableBody');
  if (!tableBody) return;

  const authState = authService.getState();
  if (authState.role !== 'ADMIN') {
    switchView('dashboard');
    return;
  }

  tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-xs text-on-surface-variant font-data-mono">Loading user profiles from Supabase...</td></tr>`;

  try {
    let profiles = [];
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        profiles = data;
      }
    }

    if (profiles.length === 0) {
      profiles = [
        { id: 'usr-admin-01', full_name: 'Chief Administrator', email: 'admin@landai.gov.in', role: 'ADMIN', department: 'Land Administration', district: 'State Headquarters' },
        { id: 'usr-officer-01', full_name: 'Officer R. S. Sharma', email: 'officer@landai.gov.in', role: 'REVENUE_OFFICER', department: 'Revenue Department', district: 'Guntur' },
        { id: 'usr-reviewer-01', full_name: 'Reviewer V. Rao', email: 'reviewer@landai.gov.in', role: 'REVIEWER', department: 'Survey Adjudication', district: 'Guntur' },
        { id: 'usr-viewer-01', full_name: 'Public Cadastral Auditor', email: 'viewer@landai.gov.in', role: 'VIEWER', department: 'Public Oversight', district: 'Amaravati' }
      ];
    }

    const countBadge = document.getElementById('userCountBadge');
    if (countBadge) countBadge.textContent = `${profiles.length} Active`;

    tableBody.innerHTML = '';
    profiles.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low/50 transition-colors';

      let roleBadgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
      if (p.role === 'ADMIN') roleBadgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
      if (p.role === 'REVENUE_OFFICER') roleBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      if (p.role === 'REVIEWER') roleBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';

      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-primary">${p.full_name || 'Authorized User'}</td>
        <td class="py-3 px-4 font-data-mono text-xs text-on-surface-variant">${p.email}</td>
        <td class="py-3 px-4 text-xs">${p.department || 'Revenue'} • ${p.district || 'Guntur'}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-data-mono font-bold border ${roleBadgeColor}">
            ${p.role}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="inline-flex items-center gap-1.5">
            <select id="roleSelect_${p.id}" class="bg-surface-container border border-outline-variant rounded-lg px-2 py-1 text-xs font-data-mono">
              <option value="ADMIN" ${p.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
              <option value="REVENUE_OFFICER" ${p.role === 'REVENUE_OFFICER' ? 'selected' : ''}>REVENUE_OFFICER</option>
              <option value="REVIEWER" ${p.role === 'REVIEWER' ? 'selected' : ''}>REVIEWER</option>
              <option value="VIEWER" ${p.role === 'VIEWER' ? 'selected' : ''}>VIEWER</option>
            </select>
            <button onclick="updateUserRoleInDb('${p.id}', document.getElementById('roleSelect_${p.id}').value)" class="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-xs font-bold hover:bg-secondary transition hover-lift">
              Save
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading users:', err);
    tableBody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-xs text-error">Failed to load profiles.</td></tr>`;
  }
}
window.renderUserManagement = renderUserManagement;

export async function updateUserRoleInDb(userId, newRole) {
  const authState = authService.getState();
  if (authState.role !== 'ADMIN') {
    triggerToast('Access Denied: Only ADMIN can change user roles.');
    return;
  }

  if (isSupabaseConfigured() && !userId.startsWith('usr-')) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        triggerToast(`Database error updating role: ${error.message}`);
        return;
      }
    } catch (e) {
      console.error('Error updating role:', e);
    }
  }

  triggerToast(`Statutory role updated to ${newRole} for user.`);
  renderUserManagement();
}
window.updateUserRoleInDb = updateUserRoleInDb;

// =========================================================
// SYSTEM SETTINGS VIEW (ADMIN ONLY)
// =========================================================

export function renderSystemSettings() {
  const authState = authService.getState();
  if (authState.role !== 'ADMIN') {
    switchView('dashboard');
    return;
  }
  const statusEl = document.getElementById('settingsSupabaseStatus');
  if (statusEl) {
    statusEl.textContent = isSupabaseConfigured() ? 'Connected & Verified' : 'Local Active';
  }
}
window.renderSystemSettings = renderSystemSettings;

// =========================================================
// UPLOAD & PROCESSING PIPELINE
// =========================================================

export function openUploadModal() {
  const authState = authService.getState();
  const role = authState.role || 'VIEWER';
  if (role !== 'ADMIN' && role !== 'REVENUE_OFFICER') {
    triggerToast(`Access Denied: ${role} role does not have permission to upload or ingest documents.`);
    return;
  }
  const modal = document.getElementById('uploadModal');
  if (modal) modal.classList.remove('hidden');
}
window.openUploadModal = openUploadModal;

export function closeUploadModal() {
  const modal = document.getElementById('uploadModal');
  if (modal) modal.classList.add('hidden');
}
window.closeUploadModal = closeUploadModal;

export function loadDemoPreset() {
  const fileName = document.getElementById('dropZoneFileName');
  if (fileName) fileName.textContent = 'ROR_Mangalagiri_124_3.pdf (Selected)';
  triggerToast('Loaded preset: Survey 124/3 • Mangalagiri');
}
window.loadDemoPreset = loadDemoPreset;

export function handleFileSelected(event) {
  const file = event.target.files[0];
  if (file) {
    const fileName = document.getElementById('dropZoneFileName');
    if (fileName) fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  }
}
window.handleFileSelected = handleFileSelected;

export async function startProcessingPipeline() {
  const authState = authService.getState();
  const role = authState.role || 'VIEWER';
  if (role !== 'ADMIN' && role !== 'REVENUE_OFFICER') {
    triggerToast(`Access Denied: ${role} role cannot run processing pipeline.`);
    return;
  }
  closeUploadModal();
  const procModal = document.getElementById('processingModal');
  if (procModal) procModal.classList.remove('hidden');

  const logBox = document.getElementById('pipelineTerminalLogs');
  const stageText = document.getElementById('pipelineStageText');
  const percentText = document.getElementById('pipelineProgressPercent');
  const progressBar = document.getElementById('pipelineProgressBar');

  const appendLog = (msg) => {
    if (logBox) {
      logBox.innerHTML += `<div>[${new Date().toLocaleTimeString()}]: ${msg}</div>`;
      logBox.scrollTop = logBox.scrollHeight;
    }
  };

  const updateStageUI = (stageNum, status, badgeText) => {
    const icon = document.getElementById(`icon-stage-${stageNum}`);
    const badge = document.getElementById(`badge-stage-${stageNum}`);
    const row = document.getElementById(`stage-${stageNum}`);
    if (row) row.classList.remove('opacity-60');

    if (icon) {
      if (status === 'running') {
        icon.className = 'material-symbols-outlined text-sm text-secondary animate-spin';
        icon.textContent = 'progress_activity';
      } else if (status === 'done') {
        icon.className = 'material-symbols-outlined text-sm text-[#198754]';
        icon.textContent = 'check_circle';
      }
    }
    if (badge) {
      badge.textContent = badgeText;
      badge.className = status === 'done' ? 'text-[10px] font-data-mono text-[#198754] font-semibold' : 'text-[10px] font-data-mono text-secondary font-semibold';
    }
  };

  // Stage 1: Document Uploaded
  appendLog('Document uploaded: ROR_Mangalagiri_124_3.pdf (SHA-256 computed)');
  stageText.textContent = 'Image Preprocessing & Binarization...';
  percentText.textContent = '20%';
  progressBar.style.width = '20%';

  // Stage 2: Preprocessing
  await new Promise(r => setTimeout(r, 600));
  updateStageUI(2, 'running', 'Running');
  appendLog('Deskewing scan by +0.4°, adaptive thresholding applied');
  stageText.textContent = 'Executing Multilingual OCR...';
  percentText.textContent = '40%';
  progressBar.style.width = '40%';

  // Stage 3: OCR
  await new Promise(r => setTimeout(r, 700));
  updateStageUI(2, 'done', 'Completed');
  updateStageUI(3, 'running', 'Running');
  appendLog('Recognized 1,420 words in Telugu & English scripts (Confidence: 95.5%)');
  stageText.textContent = 'AI Entity Extraction & Bounding Boxes...';
  percentText.textContent = '65%';
  progressBar.style.width = '65%';

  // Stage 4: AI Extraction
  await new Promise(r => setTimeout(r, 700));
  updateStageUI(3, 'done', 'Completed');
  updateStageUI(4, 'running', 'Running');
  appendLog('Extracted: Owner: Ravi Kumar (96%), Survey: 124/3 (98%), Extent: 2.45 Ac (72%)');
  stageText.textContent = 'Validating against State Meebhoomi Land DB...';
  percentText.textContent = '80%';
  progressBar.style.width = '80%';

  // Stage 5: Land DB Validation
  await new Promise(r => setTimeout(r, 600));
  updateStageUI(4, 'done', 'Completed');
  updateStageUI(5, 'running', 'Running');
  appendLog('Cross-checked Meebhoomi Khata KH-2048: Title matches Ravi Kumar');
  stageText.textContent = 'Matching Cadastral GIS Vector Polygon...';
  percentText.textContent = '95%';
  progressBar.style.width = '95%';

  // Stage 6: GIS Matching & Conflict Detection
  await new Promise(r => setTimeout(r, 650));
  updateStageUI(5, 'done', 'Completed');
  updateStageUI(6, 'done', 'Conflict Flagged');
  appendLog('GIS parcel matched: 124/3. AREA CONFLICT: Doc 2.45 Ac vs GIS 2.31 Ac (-0.14 Ac)');
  stageText.textContent = 'Processing Complete: Navigating to AI Extraction!';
  percentText.textContent = '100%';
  progressBar.style.width = '100%';

  await new Promise(r => setTimeout(r, 600));
  if (procModal) procModal.classList.add('hidden');
  triggerToast('Processing Complete! Opening AI Extraction Workspace.');
  switchView('extraction');
}
window.startProcessingPipeline = startProcessingPipeline;

// =========================================================
// AI EXTRACTION WORKSPACE
// =========================================================

export async function renderExtraction() {
  const container = document.getElementById('extractionFieldsContainer');
  if (!container) return;

  const extraction = await extractionService.getExtraction(appState.activeDocumentId);
  container.innerHTML = '';

  extraction.fields.forEach(field => {
    const cat = getConfidenceCategory(field.confidence);
    const card = document.createElement('div');
    card.className = `p-3.5 rounded-xl border transition-all duration-200 hover-lift ${field.needsReview ? 'bg-[#FEF6E7]/80 border-[#FCDAA7] shadow-2xs' : 'glass-card border-outline-variant hover:border-secondary shadow-xs'}`;

    card.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-label-sm uppercase font-semibold ${field.needsReview ? 'text-[#8f5600]' : 'text-on-surface-variant'} flex items-center gap-1">
          ${field.needsReview ? '<span class="material-symbols-outlined text-sm text-[#F59E0B]" data-icon="warning">warning</span>' : ''}
          ${field.label}
        </span>
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-data-mono font-bold border shadow-2xs ${cat.colorClass}">
            <span class="material-symbols-outlined text-xs" data-icon="${cat.icon}">${cat.icon}</span>
            ${field.confidence}% ${cat.label}
          </span>
          <button onclick="editExtractedField('${field.id}', '${field.value.replace(/'/g, "\\'")}')" class="p-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition hover-lift" title="Edit Field">
            <span class="material-symbols-outlined text-xs" data-icon="edit">edit</span>
          </button>
        </div>
      </div>
      <div class="flex items-baseline justify-between">
        <span class="text-headline-sm text-primary font-bold">${field.value}</span>
        <span class="text-xs text-on-surface-variant font-data-mono">${field.secondaryValue || ''}</span>
      </div>
      ${field.reviewMessage ? `<p class="text-[11px] text-[#8f5600] font-medium mt-1">${field.reviewMessage}</p>` : ''}
    `;

    container.appendChild(card);
  });
}

export function editExtractedField(fieldId, currentValue) {
  const authState = authService.getState();
  const role = authState.role || 'VIEWER';
  if (role !== 'ADMIN' && role !== 'REVENUE_OFFICER') {
    triggerToast(`Access Denied: ${role} role cannot edit extracted fields.`);
    return;
  }
  const newValue = prompt(`Edit extracted value for ${fieldId}:`, currentValue);
  if (newValue !== null && newValue.trim() !== '') {
    extractionService.updateField(appState.activeDocumentId, fieldId, newValue.trim()).then(() => {
      renderExtraction();
      triggerToast(`Field ${fieldId} updated to: ${newValue.trim()}`);
    });
  }
}
window.editExtractedField = editExtractedField;

export async function reRunExtraction() {
  const authState = authService.getState();
  const role = authState.role || 'VIEWER';
  if (role !== 'ADMIN' && role !== 'REVENUE_OFFICER') {
    triggerToast(`Access Denied: ${role} role cannot execute OCR extraction.`);
    return;
  }
  triggerToast('Re-running Neural OCR Model v3.2 on physical scan...');
  await extractionService.reRunExtraction(appState.activeDocumentId);
  renderExtraction();
  triggerToast('Extraction updated with re-scored confidence values.');
}
window.reRunExtraction = reRunExtraction;

export function zoomDoc(delta) {
  const sheet = document.getElementById('docSheet');
  const label = document.getElementById('docZoomLabel');
  if (delta === 0) {
    appState.docZoom = 100;
  } else {
    appState.docZoom = Math.min(180, Math.max(70, appState.docZoom + delta));
  }
  if (sheet) sheet.style.transform = `scale(${appState.docZoom / 100})`;
  if (label) label.textContent = `${appState.docZoom}%`;
}
window.zoomDoc = zoomDoc;

export function toggleDocContrast() {
  const sheet = document.getElementById('docSheet');
  appState.docHighContrast = !appState.docHighContrast;
  if (sheet) {
    if (appState.docHighContrast) {
      sheet.style.filter = 'contrast(160%) brightness(95%)';
      triggerToast('High-contrast scan filter activated');
    } else {
      sheet.style.filter = 'none';
      triggerToast('Standard view restored');
    }
  }
}
window.toggleDocContrast = toggleDocContrast;

// =========================================================
// RECONCILIATION ACTIONS
// =========================================================

export function reconcileAccept(source) {
  if (source === 'DOC') {
    triggerToast('Accepted Document Value: 2.45 Acres. Placed in Review Queue for statutory confirmation.');
  } else if (source === 'DB') {
    triggerToast('Accepted Database Value: 2.45 Acres. Discrepancy logged for field re-survey.');
  }
  switchView('verification');
}
window.reconcileAccept = reconcileAccept;

// =========================================================
// GIS SHAJRA MAP INTERACTION
// =========================================================

export function searchGisParcel(surveyNo) {
  const query = surveyNo || document.getElementById('gisSearchInput')?.value || '124/3';
  const clean = query.trim();

  if (clean === '124/3' || clean === '124') {
    const target = document.getElementById('targetParcel124_3');
    if (target) {
      target.classList.add('animate-bounce');
      setTimeout(() => target.classList.remove('animate-bounce'), 1600);
    }
    selectCadastralParcel('124/3', '2.31 Acres', 'Ravi Kumar', 'KH-2048', 'GIS Conflict');
    triggerToast('Centering onto Survey 124/3 (Mangalagiri Cadastral Sheet 04)');
  } else {
    triggerToast(`Searching 500 GeoJSON parcels for Survey ${clean}...`);
  }
}
window.searchGisParcel = searchGisParcel;

export function selectCadastralParcel(surveyNo, area, owner, khata, status) {
  const surveyEl = document.getElementById('gisSelectedSurvey');
  const statusEl = document.getElementById('gisSelectedStatus');
  const areaEl = document.getElementById('gisSelectedGisArea');
  const ownerEl = document.getElementById('gisSelectedOwner');
  const khataEl = document.getElementById('gisSelectedKhata');

  if (surveyEl) surveyEl.textContent = `Survey No. ${surveyNo}`;
  if (areaEl) areaEl.textContent = `${area} ${surveyNo === '124/3' ? '(-0.14 Ac)' : ''}`;
  if (ownerEl) ownerEl.textContent = owner;
  if (khataEl) khataEl.textContent = khata;

  if (statusEl) {
    if (status === 'GIS Conflict') {
      statusEl.className = 'px-2 py-0.5 rounded-full text-[11px] font-data-mono font-bold bg-[#FDE8EA] text-error border border-[#F8B4B9] shadow-2xs';
      statusEl.textContent = 'GIS CONFLICT';
    } else {
      statusEl.className = 'px-2 py-0.5 rounded-full text-[11px] font-data-mono font-bold bg-[#EBF7EE] text-[#198754] border border-[#C2E7CB] shadow-2xs';
      statusEl.textContent = 'SYNCHRONIZED';
    }
  }
}
window.selectCadastralParcel = selectCadastralParcel;

// =========================================================
// REVIEW QUEUE
// =========================================================

export async function renderReviewQueue() {
  const tbody = document.getElementById('reviewQueueTableBody');
  if (!tbody) return;

  const items = await verificationService.getReviewQueue();
  tbody.innerHTML = '';

  items.forEach(item => {
    const isTarget = item.surveyNo === '124/3';
    const tr = document.createElement('tr');
    tr.className = `interactive-row transition-all duration-150 ${isTarget ? 'bg-surface-container-low/40 font-medium' : ''}`;

    tr.innerHTML = `
      <td class="py-3.5 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-data-mono font-bold shadow-2xs ${item.priority === 'CRITICAL' ? 'bg-[#FDE8EA] text-error border border-[#F8B4B9]' : 'bg-[#FEF6E7] text-[#F59E0B] border border-[#FCDAA7]'}">
          ${item.priority}
        </span>
      </td>
      <td class="py-3.5 px-4 font-data-mono font-bold text-primary">${item.documentId}</td>
      <td class="py-3.5 px-4 font-data-mono font-bold text-secondary">${item.surveyNo}</td>
      <td class="py-3.5 px-4 font-medium">${item.village}</td>
      <td class="py-3.5 px-4 text-xs font-medium text-error flex items-center gap-1">
        <span class="material-symbols-outlined text-xs" data-icon="error">error</span>
        ${item.issue}
      </td>
      <td class="py-3.5 px-4 font-data-mono font-semibold">${item.confidence}%</td>
      <td class="py-3.5 px-4 text-xs text-outline">${item.age}</td>
      <td class="py-3.5 px-4 text-right">
        <button onclick="launchReview('${item.documentId}')" class="px-3 py-1.5 rounded-xl bg-primary hover:bg-secondary text-on-primary text-xs font-semibold transition-all duration-150 hover-lift shadow-xs">
          Review &rarr;
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

export function launchReview(documentId) {
  appState.activeDocumentId = documentId;
  switchView('verification');
}
window.launchReview = launchReview;

// =========================================================
// HUMAN VERIFICATION & ADJUDICATION DECISION
// =========================================================

export function submitVerificationDecision(action) {
  const authState = authService.getState();
  if (authState.role === 'VIEWER') {
    triggerToast('Access Denied: VIEWER role cannot submit verification decisions.');
    return;
  }

  const correctedAreaInput = document.getElementById('verificationCorrectedArea');
  const notesInput = document.getElementById('verificationNotesInput');

  const correctedArea = correctedAreaInput ? correctedAreaInput.value.trim() : '2.45 Acres';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (action === 'CORRECT_AND_VERIFY' && (!correctedArea || !notes)) {
    alert('Please provide both the authorized correction extent and verification notes.');
    return;
  }

  appState.pendingDecision = {
    action,
    correctedArea,
    notes,
    documentId: appState.activeDocumentId
  };

  const modal = document.getElementById('confirmVerifyModal');
  if (modal) modal.classList.remove('hidden');
}
window.submitVerificationDecision = submitVerificationDecision;

export function closeConfirmModal() {
  const modal = document.getElementById('confirmVerifyModal');
  if (modal) modal.classList.add('hidden');
}
window.closeConfirmModal = closeConfirmModal;

export async function executeVerificationConfirmation() {
  closeConfirmModal();
  if (!appState.pendingDecision) return;

  const authState = authService.getState();
  if (!authState.isAuthenticated || !authState.user || !authState.profile) {
    triggerToast('Error: Unauthenticated action rejected.');
    return;
  }
  if (authState.role === 'VIEWER') {
    triggerToast('Access Denied: VIEWER role cannot adjudicate records.');
    return;
  }

  const { action, correctedArea, notes, documentId } = appState.pendingDecision;

  const verifiedRecord = await verificationService.submitDecision(documentId, {
    action,
    correctedArea,
    verificationNotes: notes
  });

  // Log audit trail event with authenticated officer's immutable user_id and database role
  const profile = authState.profile;
  const userId = authState.user.id;

  await auditService.logEvent({
    documentId,
    userId,
    role: profile.role,
    actor: `${profile.full_name} (${profile.role}, ${profile.district || 'Revenue Department'})`,
    action: action === 'CORRECT_AND_VERIFY' ? 'Record Corrected & Verified' : (action === 'APPROVE' ? 'Record Approved' : 'Record Rejected'),
    details: `Officer adjudication complete. Extent certified: ${correctedArea}. Statutory remarks: ${notes}`,
    category: 'VERIFICATION',
    status: 'VERIFIED'
  });

  // Update document status
  await documentService.updateDocumentStatus(documentId, 'VERIFIED', {
    docArea: correctedArea,
    dbArea: correctedArea,
    status: 'VERIFIED'
  });

  // Update certificate view
  renderCertificate(verifiedRecord);

  triggerToast('Record Verified and Cryptographically Sealed!');
  switchView('certificate');
}
window.executeVerificationConfirmation = executeVerificationConfirmation;

// =========================================================
// VERIFIED CERTIFICATE RENDERING
// =========================================================

export function renderCertificate(record) {
  const docIdEl = document.getElementById('certDocId');
  const surveyEl = document.getElementById('certSurveyNo');
  const ownerEl = document.getElementById('certOwner');
  const khataEl = document.getElementById('certKhata');
  const areaEl = document.getElementById('certArea');
  const notesEl = document.getElementById('certNotes');
  const timestampEl = document.getElementById('certTimestamp');
  const hashEl = document.getElementById('certHash');

  if (record) {
    if (docIdEl) docIdEl.textContent = record.documentId;
    if (surveyEl) surveyEl.textContent = record.surveyNo;
    if (ownerEl) ownerEl.textContent = record.ownerName;
    if (khataEl) khataEl.textContent = record.khataNo;
    if (areaEl) areaEl.textContent = record.verifiedExtent;
    if (notesEl) notesEl.textContent = `"${record.verificationNotes}"`;
    if (timestampEl) timestampEl.textContent = `Timestamp: ${new Date(record.timestamp).toLocaleString('en-IN')}`;
    if (hashEl) hashEl.textContent = record.certificateHash;
  }
}

// =========================================================
// AUDIT TRAIL RENDERING
// =========================================================

export async function renderAuditTrail() {
  const container = document.getElementById('auditTimelineContainer');
  if (!container) return;

  const logs = await auditService.getLogs(appState.activeDocumentId);
  container.innerHTML = '';

  logs.forEach(log => {
    const item = document.createElement('div');
    item.className = 'relative pl-6 hover-lift glass-card p-4 rounded-xl border border-outline-variant/60 shadow-xs transition-all';

    let dotColor = 'bg-primary shadow-[0_0_8px_#003748]';
    if (log.category === 'GIS_CONFLICT') dotColor = 'bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]';
    if (log.category === 'VERIFICATION') dotColor = 'bg-[#198754] shadow-[0_0_8px_#198754]';
    if (log.category === 'EXTRACTION') dotColor = 'bg-secondary shadow-[0_0_8px_#006a63]';

    item.innerHTML = `
      <div class="absolute -left-6 top-5 w-5 h-5 rounded-full ${dotColor} border-4 border-surface-container-lowest ring-2 ring-outline-variant/40"></div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span class="font-headline-sm font-bold text-primary">${log.action}</span>
        <span class="text-data-mono text-xs text-outline">${log.timestamp}</span>
      </div>
      <p class="text-body-sm text-on-surface-variant mt-1">${log.details}</p>
      <div class="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-data-mono">
        <span class="bg-surface-container-low px-2 py-0.5 rounded-lg text-primary font-medium border border-outline-variant/40">Actor: ${log.actor}</span>
        <span class="bg-surface-container-low px-2 py-0.5 rounded-lg text-outline break-all border border-outline-variant/40">${log.hash}</span>
        <span class="text-secondary font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-xs" data-icon="verified">verified</span> Integrity Verified
        </span>
      </div>
    `;

    container.appendChild(item);
  });
}

// =========================================================
// GLOBAL SEARCH & NOTIFICATIONS
// =========================================================

export function handleGlobalSearch(event) {
  if (event.key === 'Enter') {
    const q = event.target.value.trim().toLowerCase();
    if (q.includes('124') || q.includes('ravi') || q.includes('2048')) {
      triggerToast('Found matching record: Survey 124/3 • Opening AI Extraction');
      inspectDocumentWorkflow('DOC-2026-00421');
    } else {
      triggerToast(`Search executed for "${q}": Record DOC-2026-00421 matched`);
      inspectDocumentWorkflow('DOC-2026-00421');
    }
  }
}
window.handleGlobalSearch = handleGlobalSearch;

export function openNotifications() {
  triggerToast('Alert: 1 Urgent Cadastral Conflict in Mandal Mangalagiri (Survey 124/3)');
}
window.openNotifications = openNotifications;

// =========================================================
// AUTHENTICATION UI & ROLE MANAGEMENT
// =========================================================

export function updateProfileUI(profile) {
  if (!profile) return;

  const displayName = profile.full_name || (profile.email ? profile.email.split('@')[0] : 'Authorized User');
  const initials = displayName
    .replace(/^Officer\s+/i, '')
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AU';

  // Role color styles
  let roleBadgeClass = 'bg-secondary/15 text-secondary border border-secondary/30';
  if (profile.role === 'ADMIN') roleBadgeClass = 'bg-purple-100 text-purple-800 border border-purple-300';
  if (profile.role === 'REVIEWER') roleBadgeClass = 'bg-amber-100 text-amber-800 border border-amber-300';
  if (profile.role === 'VIEWER') roleBadgeClass = 'bg-blue-100 text-blue-800 border border-blue-300';

  // Sidebar elements
  const sidebarInitials = document.getElementById('sidebarUserInitials');
  if (sidebarInitials && sidebarInitials.firstElementChild) {
    sidebarInitials.firstElementChild.textContent = initials;
  }
  const sidebarName = document.getElementById('sidebarUserName');
  if (sidebarName) sidebarName.textContent = displayName;
  const sidebarRole = document.getElementById('sidebarUserRole');
  if (sidebarRole) {
    sidebarRole.textContent = profile.role;
    sidebarRole.className = `text-[10px] font-data-mono font-bold px-1.5 py-0.2 rounded truncate ${roleBadgeClass}`;
  }
  const sidebarDistrict = document.getElementById('sidebarUserDistrict');
  if (sidebarDistrict) sidebarDistrict.textContent = `• ${profile.district || 'Revenue Dept'}`;

  // Top header elements
  const headerInitials = document.getElementById('headerUserInitials');
  if (headerInitials && headerInitials.firstElementChild) {
    headerInitials.firstElementChild.textContent = initials;
  }
  const headerName = document.getElementById('headerUserName');
  if (headerName) headerName.textContent = displayName;
  const headerRole = document.getElementById('headerUserRole');
  if (headerRole) {
    headerRole.textContent = profile.role;
    headerRole.className = `text-[10px] font-data-mono font-bold px-1.5 py-0.2 rounded leading-none ${roleBadgeClass}`;
  }

  // Header Dropdown elements
  const dropInitials = document.getElementById('dropdownInitials');
  if (dropInitials) dropInitials.textContent = initials;
  const dropName = document.getElementById('dropdownFullName');
  if (dropName) dropName.textContent = displayName;
  const dropEmail = document.getElementById('dropdownEmail');
  if (dropEmail) dropEmail.textContent = profile.email;
  const dropRole = document.getElementById('dropdownRole');
  if (dropRole) {
    dropRole.textContent = profile.role;
    dropRole.className = `px-2 py-0.5 rounded-full text-[10px] font-data-mono font-bold ${roleBadgeClass}`;
  }
  const currentRoleBadge = document.getElementById('currentRoleBadge');
  if (currentRoleBadge) {
    currentRoleBadge.textContent = profile.role;
    currentRoleBadge.className = `font-data-mono text-[10px] font-bold px-2 py-0.5 rounded ${roleBadgeClass}`;
  }
  const dropDept = document.getElementById('dropdownDept');
  if (dropDept) dropDept.textContent = profile.department || 'Revenue Department';
  const dropDistrict = document.getElementById('dropdownDistrict');
  if (dropDistrict) dropDistrict.textContent = `${profile.district || 'Guntur'}, Andhra Pradesh`;
}
window.updateProfileUI = updateProfileUI;

export function applyRolePermissions(role) {
  // Update all elements with data-roles attribute
  document.querySelectorAll('[data-roles]').forEach(el => {
    const allowed = el.getAttribute('data-roles')?.split(',').map(r => r.trim()) || [];
    if (allowed.includes(role)) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Action guards:
  // 1. Upload buttons: only visible for ADMIN and REVENUE_OFFICER
  document.querySelectorAll('[onclick="openUploadModal()"]').forEach(el => {
    if (role === 'ADMIN' || role === 'REVENUE_OFFICER') {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // 2. Extraction run / re-run triggers: only visible for ADMIN and REVENUE_OFFICER
  document.querySelectorAll('[onclick="reRunExtraction()"]').forEach(el => {
    if (role === 'ADMIN' || role === 'REVENUE_OFFICER') {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // 3. Adjudication buttons: hidden for VIEWER
  document.querySelectorAll('[onclick^="submitVerificationDecision"]').forEach(el => {
    if (role === 'VIEWER') {
      el.classList.add('hidden');
    } else {
      el.classList.remove('hidden');
    }
  });
}
window.applyRolePermissions = applyRolePermissions;

export async function handleLoginSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const btnText = document.getElementById('loginBtnText');
  const errorBanner = document.getElementById('loginErrorBanner');
  const errorMessage = document.getElementById('loginErrorMessage');

  if (errorBanner) errorBanner.classList.add('hidden');

  const email = emailInput?.value || '';
  const password = passwordInput?.value || '';

  if (!email.trim() || !password) {
    if (errorBanner && errorMessage) {
      errorMessage.textContent = 'Please enter both email and password.';
      errorBanner.classList.remove('hidden');
    }
    return;
  }

  // Visual loading feedback on button
  if (submitBtn) submitBtn.disabled = true;
  if (btnText) btnText.textContent = 'Signing in...';

  try {
    const res = await authService.signIn(email, password);

    if (!res.success) {
      if (errorBanner && errorMessage) {
        errorMessage.textContent = res.error || 'Invalid email or password.';
        errorBanner.classList.remove('hidden');
      }
      return;
    }

    // Authentication successful
    triggerToast(`Authenticated as ${res.data?.full_name} (${res.data?.role})`);
    if (res.data) {
      updateProfileUI(res.data);
      applyRolePermissions(res.data.role);
    }
    hideLoginView();

    // Redirect to requested view or dashboard
    const target = appState.redirectRoute || 'dashboard';
    appState.redirectRoute = null;
    switchView(target);
  } catch (err) {
    if (errorBanner && errorMessage) {
      errorMessage.textContent = 'Invalid email or password.';
      errorBanner.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.textContent = 'Sign In';
  }
}
window.handleLoginSubmit = handleLoginSubmit;

export async function handleLogout() {
  await authService.signOut();
  showLoginView();
  triggerToast('Terminal session securely terminated.');
}
window.handleLogout = handleLogout;

export function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPassword');
  const icon = document.getElementById('passwordToggleIcon');
  if (!passInput) return;

  if (passInput.type === 'password') {
    passInput.type = 'text';
    if (icon) icon.textContent = 'visibility_off';
  } else {
    passInput.type = 'password';
    if (icon) icon.textContent = 'visibility';
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

export function toggleUserDropdown() {
  const dropdown = document.getElementById('userProfileDropdown');
  const chevron = document.getElementById('headerUserChevron');
  if (dropdown) {
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      dropdown.classList.remove('hidden');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
    } else {
      dropdown.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  }
}
window.toggleUserDropdown = toggleUserDropdown;

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const menuContainer = document.getElementById('headerUserMenuContainer');
  const dropdown = document.getElementById('userProfileDropdown');
  const chevron = document.getElementById('headerUserChevron');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (menuContainer && !menuContainer.contains(e.target)) {
      dropdown.classList.add('hidden');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
    }
  }
});

export async function initAppAuth() {
  const loadingScreen = document.getElementById('authLoadingScreen');
  const statusText = document.getElementById('authLoadingStatusText');
  const errorBanner = document.getElementById('loginErrorBanner');
  const errorMessage = document.getElementById('loginErrorMessage');

  if (statusText) statusText.textContent = 'Securely restoring your session...';

  // Check if Supabase credentials are configured
  const configNotice = document.getElementById('loginConfigNotice');
  if (configNotice && !isSupabaseConfigured()) {
    configNotice.classList.remove('hidden');
  }

  // Restore existing session
  const state = await authService.initSession();

  if (state.isAuthenticated && state.profile) {
    updateProfileUI(state.profile);
    applyRolePermissions(state.role);
    hideLoginView();

    // Check if there was an intended route in hash or pathname
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validViews = ['dashboard', 'documents', 'extraction', 'ledger', 'validation', 'gis', 'review', 'verification', 'certificate', 'audit', 'users', 'settings'];
    const targetView = validViews.includes(hash) ? hash : (appState.redirectRoute || 'dashboard');
    switchView(targetView);
  } else {
    showLoginView();
    if (state.error && errorBanner && errorMessage) {
      errorMessage.textContent = state.error;
      errorBanner.classList.remove('hidden');
    }
  }

  // Smoothly fade out loading screen
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 300);
  }
}

// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  // Pre-load parcels GeoJSON
  parcelService.loadParcels();
  // Initialize Real Supabase Authentication & Session Restoration
  initAppAuth();
});

// URL Hash routing listener with strict route protection
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  const authState = authService.getState();

  if (!authState.isAuthenticated || !authState.profile) {
    showLoginView();
    return;
  }

  const validViews = ['dashboard', 'documents', 'extraction', 'ledger', 'validation', 'gis', 'review', 'verification', 'certificate', 'audit', 'users', 'settings', 'login'];
  if (hash === 'login') {
    switchView('dashboard');
  } else if (validViews.includes(hash)) {
    switchView(hash);
  }
});


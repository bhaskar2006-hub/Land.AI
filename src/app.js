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

// Global application state
const appState = {
  currentView: 'dashboard',
  activeDocumentId: 'DOC-2026-00421',
  docZoom: 100,
  docHighContrast: false,
  pendingDecision: null
};

// =========================================================
// VIEW NAVIGATION & TAB SWITCHING
// =========================================================

export function switchView(viewKey) {
  const views = ['dashboard', 'extraction', 'ledger', 'gis', 'review', 'verification', 'certificate', 'audit'];
  
  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) {
      if (v === viewKey) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Update Ribbon buttons
  views.forEach(v => {
    const btn = document.getElementById('ribbon-' + v);
    if (btn) {
      if (v === viewKey) {
        btn.className = "px-3 py-1.5 rounded font-semibold text-primary bg-surface-container-low flex items-center gap-1.5 transition whitespace-nowrap";
      } else {
        btn.className = "px-3 py-1.5 rounded font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low flex items-center gap-1.5 transition whitespace-nowrap";
      }
    }
  });

  // Update Side Nav Tabs
  const navMap = {
    'dashboard': 'nav-btn-dashboard',
    'extraction': 'nav-btn-extraction',
    'ledger': 'nav-btn-ledger',
    'gis': 'nav-btn-gis',
    'review': 'nav-btn-review',
    'verification': 'nav-btn-verification',
    'audit': 'nav-btn-audit'
  };

  Object.keys(navMap).forEach(key => {
    const navEl = document.getElementById(navMap[key]);
    if (navEl) {
      if (key === viewKey) {
        navEl.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-label-md transition-colors duration-150 border-r-2 border-primary bg-surface-container-low text-primary font-semibold";
      } else {
        navEl.className = "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-label-md transition-colors duration-150 text-on-surface-variant font-normal hover:bg-surface-container-low hover:text-on-surface";
      }
    }
  });

  // Update Breadcrumb text
  const titles = {
    'dashboard': 'Dashboard Overview',
    'extraction': 'AI Extraction & Optical Inspection',
    'ledger': '3-Source Reconciliation Ledger',
    'gis': 'GIS Shajra Cadastral Map View',
    'review': 'Review Queue',
    'verification': 'Human Verification & Decision',
    'certificate': 'Verified Land Record Certificate',
    'audit': 'Cryptographic Audit Trail'
  };
  const breadcrumb = document.getElementById('breadcrumbCurrent');
  if (breadcrumb) {
    breadcrumb.textContent = titles[viewKey] || 'Operational Workbench';
  }

  appState.currentView = viewKey;

  // View specific refreshes
  if (viewKey === 'extraction') renderExtraction();
  if (viewKey === 'review') renderReviewQueue();
  if (viewKey === 'audit') renderAuditTrail();
  if (viewKey === 'dashboard') renderDashboard();

  // Scroll to top
  const vp = document.getElementById('contentViewport');
  if (vp) vp.scrollTop = 0;
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
// DASHBOARD RENDERING
// =========================================================

export async function renderDashboard() {
  const tableBody = document.getElementById('dashboardRecentTable');
  if (!tableBody) return;

  const docs = await documentService.getDocuments();
  tableBody.innerHTML = '';

  docs.forEach(doc => {
    const isTarget = doc.id === 'DOC-2026-00421';
    const tr = document.createElement('tr');
    tr.className = `hover:bg-surface-container-low/60 transition cursor-pointer ${isTarget ? 'bg-surface-container-low/30' : ''}`;
    
    let statusPill = '';
    if (doc.status === 'GIS Conflict' || doc.status === 'CONFLICT') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-data-mono font-semibold bg-[#FDE8EA] text-error border border-[#F8B4B9]">
        <span class="material-symbols-outlined text-xs" data-icon="error">error</span> GIS Conflict (-0.14 Ac)
      </span>`;
    } else if (doc.status === 'VERIFIED') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-data-mono font-semibold bg-[#EBF7EE] text-[#198754] border border-[#C2E7CB]">
        <span class="material-symbols-outlined text-xs" data-icon="verified">verified</span> Verified &amp; Signed
      </span>`;
    } else if (doc.status === 'Review Required') {
      statusPill = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-data-mono font-semibold bg-[#FEF6E7] text-[#F59E0B] border border-[#FCDAA7]">
        <span class="material-symbols-outlined text-xs" data-icon="draw">draw</span> Review Required
      </span>`;
    } else {
      statusPill = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-data-mono font-semibold bg-[#EBF7EE] text-[#198754] border border-[#C2E7CB]">
        <span class="material-symbols-outlined text-xs" data-icon="check_circle">check_circle</span> Synchronized
      </span>`;
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
            <div class="${doc.confidenceOverall >= 90 ? 'bg-[#198754]' : 'bg-[#F59E0B]'} h-full" style="width: ${doc.confidenceOverall}%"></div>
          </div>
        </div>
      </td>
      <td class="py-3.5 px-4">${statusPill}</td>
      <td class="py-3.5 px-4 text-right space-x-1">
        <button onclick="inspectDocumentWorkflow('${doc.id}')" class="px-3 py-1 rounded bg-primary text-on-primary text-label-sm font-semibold hover:bg-secondary transition shadow-2xs">
          Open Workflow &rarr;
        </button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

export function inspectDocumentWorkflow(docId) {
  appState.activeDocumentId = docId;
  switchView('extraction');
}
window.inspectDocumentWorkflow = inspectDocumentWorkflow;

// =========================================================
// UPLOAD & PROCESSING PIPELINE
// =========================================================

export function openUploadModal() {
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
    card.className = `p-3 rounded-lg border transition ${field.needsReview ? 'bg-[#FEF6E7] border-[#FCDAA7]' : 'bg-surface-container-lowest border-outline-variant hover:border-secondary'}`;

    card.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="text-label-sm uppercase font-semibold ${field.needsReview ? 'text-[#8f5600]' : 'text-on-surface-variant'} flex items-center gap-1">
          ${field.needsReview ? '<span class="material-symbols-outlined text-sm" data-icon="warning">warning</span>' : ''}
          ${field.label}
        </span>
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-data-mono font-semibold border ${cat.colorClass}">
            <span class="material-symbols-outlined text-xs" data-icon="${cat.icon}">${cat.icon}</span>
            ${field.confidence}% ${cat.label}
          </span>
          <button onclick="editExtractedField('${field.id}', '${field.value.replace(/'/g, "\\'")}')" class="p-0.5 text-on-surface-variant hover:text-primary" title="Edit Field">
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
      statusEl.className = 'px-2 py-0.5 rounded text-[11px] font-data-mono font-bold bg-[#FDE8EA] text-error border border-[#F8B4B9]';
      statusEl.textContent = 'GIS CONFLICT';
    } else {
      statusEl.className = 'px-2 py-0.5 rounded text-[11px] font-data-mono font-bold bg-[#EBF7EE] text-[#198754] border border-[#C2E7CB]';
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
    tr.className = `hover:bg-surface-container-low/60 transition ${isTarget ? 'bg-surface-container-low/30' : ''}`;

    tr.innerHTML = `
      <td class="py-3.5 px-4">
        <span class="px-2 py-0.5 rounded text-[10px] font-data-mono font-bold ${item.priority === 'CRITICAL' ? 'bg-[#FDE8EA] text-error' : 'bg-[#FEF6E7] text-[#F59E0B]'}">
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
        <button onclick="launchReview('${item.documentId}')" class="px-3 py-1 rounded bg-primary hover:bg-secondary text-on-primary text-xs font-semibold transition">
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

  const { action, correctedArea, notes, documentId } = appState.pendingDecision;

  const verifiedRecord = await verificationService.submitDecision(documentId, {
    action,
    correctedArea,
    verificationNotes: notes
  });

  // Log audit trail event
  await auditService.logEvent({
    documentId,
    actor: 'Officer S. Sharma (DRO Guntur)',
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
    item.className = 'relative pl-6';

    let dotColor = 'bg-primary';
    if (log.category === 'GIS_CONFLICT') dotColor = 'bg-[#F59E0B]';
    if (log.category === 'VERIFICATION') dotColor = 'bg-[#198754]';
    if (log.category === 'EXTRACTION') dotColor = 'bg-secondary';

    item.innerHTML = `
      <div class="absolute -left-6 top-1 w-5 h-5 rounded-full ${dotColor} border-4 border-surface-container-lowest"></div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span class="font-headline-sm font-semibold text-primary">${log.action}</span>
        <span class="text-data-mono text-xs text-outline">${log.timestamp}</span>
      </div>
      <p class="text-body-sm text-on-surface-variant mt-1">${log.details}</p>
      <div class="mt-2 flex flex-wrap items-center gap-2 text-xs font-data-mono">
        <span class="bg-surface-container-low px-2 py-0.5 rounded text-primary">Actor: ${log.actor}</span>
        <span class="bg-surface-container-low px-2 py-0.5 rounded text-outline break-all">${log.hash}</span>
        <span class="text-secondary font-semibold">Integrity Verified</span>
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
// INITIALIZATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  // Pre-load parcels GeoJSON
  parcelService.loadParcels();
});

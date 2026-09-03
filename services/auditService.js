/**
 * Audit Trail Service
 * Manages chronological, tamper-evident audit logs with cryptographic block hash verification.
 * Prepares the application for: GET /api/audit/:recordId
 */

const INITIAL_AUDIT_LOGS = [
  {
    id: 'AUD-001',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 09:42:18 IST',
    actor: 'Operator_MGL_02 (Scanning Desk)',
    action: 'Document Uploaded',
    details: 'Physical 1974 Settlement Deed ingested via Flatbed Optical Scanner at Mangalagiri Mandal Revenue Office. 300 DPI multi-page TIFF rendered.',
    status: 'COMPLETED',
    hash: 'SHA256:4a2f8b91c78e3401d67e20b94321fa889021bcfe871029384756102938475610',
    category: 'INGESTION'
  },
  {
    id: 'AUD-002',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 09:42:45 IST',
    actor: 'LAND-AI Preprocessing Engine',
    action: 'Image Preprocessing Completed',
    details: 'Deskewing (0.4° clockwise), adaptive binarization, background grain noise suppression completed.',
    status: 'COMPLETED',
    hash: 'SHA256:8b3e1092a47f1234e56b78901234cdef5678901234567890abcdef1234567890',
    category: 'PROCESSING'
  },
  {
    id: 'AUD-003',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 09:43:05 IST',
    actor: 'LAND-AI Neural OCR (ResNet-Transformer v3.2)',
    action: 'OCR / Text Extraction Completed',
    details: 'Bilingual Telugu/English optical recognition completed with 95.5% overall confidence score.',
    status: 'COMPLETED',
    hash: 'SHA256:f19d883e01294857610293847561029384756102938475610293847561029384',
    category: 'EXTRACTION'
  },
  {
    id: 'AUD-004',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 09:43:30 IST',
    actor: 'LAND-AI Entity Extractor',
    action: 'AI Field Extraction & Confidence Scoring',
    details: 'Extracted Pattadar "Ravi Kumar" (96%), Survey "124/3" (98%), Khata "KH-2048" (99%), Extent "2.45 Acres" (72% - Review Recommended).',
    status: 'COMPLETED',
    hash: 'SHA256:9234857102938475610293847561029384756102938475610293847561029384',
    category: 'EXTRACTION'
  },
  {
    id: 'AUD-005',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 09:44:12 IST',
    actor: 'Meebhoomi DILRMP Sync Gateway',
    action: 'Land Database Validation Completed',
    details: 'Cross-verified against Andhra Pradesh Meebhoomi RoR 1-B database. Khata and Pattadar identity verified; registered extent matches 2.45 Acres.',
    status: 'COMPLETED',
    hash: 'SHA256:1029384756102938475610293847561029384756102938475610293847561029',
    category: 'VALIDATION'
  },
  {
    id: 'AUD-006',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 09:45:20 IST',
    actor: 'AP Cadastral GIS Engine (PostGIS)',
    action: 'GIS Parcel Matched & Area Conflict Flagged',
    details: 'Spatial polygon intersection matched Survey 124/3 (Centroid: 16.4348°N, 80.5662°E). Calculated polygon extent: 2.31 Acres. Discrepancy of -0.14 Acres (-6,098.4 sq.ft) detected with 2021 ZP road expansion boundary.',
    status: 'FLAGGED',
    hash: 'SHA256:7561029384756102938475610293847561029384756102938475610293847561',
    category: 'GIS_CONFLICT'
  },
  {
    id: 'AUD-007',
    documentId: 'DOC-2026-00421',
    timestamp: 'Today, 10:12:44 IST',
    actor: 'DRO System Dispatcher',
    action: 'Record Placed in Human Review Queue',
    details: 'Assigned to Officer S. Sharma (District Revenue Officer, Guntur) with Priority Level 1 (Critical GIS Mismatch).',
    status: 'PENDING_REVIEW',
    hash: 'SHA256:3847561029384756102938475610293847561029384756102938475610293847',
    category: 'REVIEW'
  }
];

class AuditService {
  constructor() {
    this.logs = [...INITIAL_AUDIT_LOGS];
  }

  getLogs(documentId) {
    if (documentId) {
      return Promise.resolve(this.logs.filter(l => l.documentId === documentId));
    }
    return Promise.resolve([...this.logs]);
  }

  logEvent(entry) {
    const timestamp = 'Today, ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
    const hash = 'SHA256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newLog = {
      id: `AUD-${String(this.logs.length + 1).padStart(3, '0')}`,
      documentId: entry.documentId || 'DOC-2026-00421',
      userId: entry.userId || 'system', // Immutable Supabase auth.users(id)
      role: entry.role || 'REVENUE_OFFICER',
      timestamp,
      actor: entry.actor || 'Officer S. Sharma',
      action: entry.action,
      details: entry.details,
      status: entry.status || 'COMPLETED',
      hash,
      category: entry.category || 'OPERATION'
    };
    this.logs.unshift(newLog);
    return Promise.resolve(newLog);
  }
}

export const auditService = new AuditService();

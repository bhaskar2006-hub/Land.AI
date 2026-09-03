/**
 * Human Verification Service
 * Handles officer decision logic, statutory notes, corrections, and verified certificates.
 * Structure ready for future API: POST /api/verification/:recordId
 */

export const OFFICER_PROFILE = {
  name: 'Officer S. Sharma',
  designation: 'District Revenue Officer / Tahsildar',
  district: 'Guntur',
  division: 'Mangalagiri',
  jurisdictionCode: 'AP-REV-GNT-04',
  dscCertificateId: 'DSC-GOVT-IN-2026-98442',
  dscValidUntil: '2028-12-31'
};

class VerificationService {
  constructor() {
    this.verifiedRecords = new Map();
  }

  getReviewQueue() {
    return Promise.resolve([
      {
        id: 'REV-01',
        documentId: 'DOC-2026-00421',
        surveyNo: '124/3',
        village: 'Mangalagiri (Atchampet)',
        owner: 'Ravi Kumar s/o Venkateswarlu',
        issue: 'GIS Area Mismatch (-0.14 Ac) vs Recorded Deed',
        category: 'GIS Mismatch',
        priority: 'CRITICAL',
        confidence: 95.5,
        assignedOfficer: 'Officer S. Sharma',
        age: '42 mins ago',
        docArea: '2.45 Acres',
        gisArea: '2.31 Acres',
        isDemoData: true
      },
      {
        id: 'REV-02',
        documentId: 'DOC-2026-00423',
        surveyNo: '312/B',
        village: 'Tagarapuvalasa',
        owner: 'M. Satyanarayana Raju',
        issue: 'Low AI Confidence on 1968 Surveyor Stamp',
        category: 'Low Confidence',
        priority: 'MEDIUM',
        confidence: 78.4,
        assignedOfficer: 'Officer S. Sharma',
        age: '18 hrs ago',
        docArea: '3.10 Acres',
        gisArea: '3.10 Acres',
        isDemoData: true
      },
      {
        id: 'REV-03',
        documentId: 'DOC-2026-00425',
        surveyNo: '77/4',
        village: 'Navuluru',
        owner: 'P. Govinda Rao',
        issue: 'Unregistered Mutation Title Overlap',
        category: 'Critical Conflicts',
        priority: 'HIGH',
        confidence: 84.1,
        assignedOfficer: 'Officer S. Sharma',
        age: '1 day ago',
        docArea: '4.20 Acres',
        gisArea: '4.05 Acres',
        isDemoData: true
      }
    ]);
  }

  submitDecision(documentId, decision) {
    // decision: { action: 'APPROVE' | 'CORRECT_AND_VERIFY' | 'REJECT', correctedArea, verificationNotes, rejectionReason }
    if (decision.action === 'CORRECT_AND_VERIFY') {
      if (!decision.correctedArea || !decision.verificationNotes) {
        return Promise.reject(new Error('Correction value and verification notes are mandatory for Correct & Verify'));
      }
    }
    if (decision.action === 'REJECT') {
      if (!decision.rejectionReason) {
        return Promise.reject(new Error('Rejection reason code is mandatory for Rejecting a land record'));
      }
    }

    const timestamp = new Date().toISOString();
    const certificateHash = 'SHA256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const verifiedRecord = {
      documentId,
      surveyNo: '124/3',
      khataNo: 'KH-2048',
      ownerName: 'Ravi Kumar',
      verifiedExtent: decision.correctedArea || '2.45 Acres',
      originalDocExtent: '2.45 Acres',
      gisOriginalExtent: '2.31 Acres',
      status: decision.action === 'REJECT' ? 'REJECTED' : 'VERIFIED',
      decisionAction: decision.action,
      verificationNotes: decision.verificationNotes || 'Statutory verification completed by DRO under AP Survey & Boundaries Act.',
      officer: OFFICER_PROFILE,
      certificateHash,
      timestamp,
      verificationMethod: 'Human Verified with DGPS On-Site Validation',
      gazetteNoticeId: `GNT-GAZ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      isDemoData: true
    };

    this.verifiedRecords.set(documentId, verifiedRecord);
    return Promise.resolve(verifiedRecord);
  }

  getVerifiedRecord(documentId) {
    return Promise.resolve(this.verifiedRecords.get(documentId) || null);
  }
}

export const verificationService = new VerificationService();

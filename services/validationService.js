/**
 * Validation & Reconciliation Service
 * Performs 3-way reconciliation across Document, Reference Land DB, and GIS Cadastre.
 * Prepares the application for: POST /api/validation/:documentId
 */

export const RECONCILIATION_CRITERIA = [
  {
    parameter: 'Survey & Sub-Division Number',
    fieldKey: 'surveyNo',
    docValue: '124/3',
    dbValue: '124/3',
    gisValue: '124/3 (Parcel_124_3_AP)',
    status: 'MATCH',
    isDiscrepancy: false,
    severity: 'LOW',
    notes: 'Sub-division demarcation verified against statutory AP cadastral grid.'
  },
  {
    parameter: 'Recorded Pattadar / Owner',
    fieldKey: 'ownerName',
    docValue: 'Ravi Kumar',
    dbValue: 'Ravi Kumar',
    gisValue: 'Ravi Kumar (Pattadar ID: AP-7421)',
    status: 'MATCH',
    isDiscrepancy: false,
    severity: 'LOW',
    notes: 'Ownership hash matches Meebhoomi Land Records Database.'
  },
  {
    parameter: 'Revenue Khata Account',
    fieldKey: 'khataNo',
    docValue: 'KH-2048',
    dbValue: 'KH-2048',
    gisValue: 'KH-2048',
    status: 'MATCH',
    isDiscrepancy: false,
    severity: 'LOW',
    notes: 'Direct 1-to-1 linkage verified with Digital Passbook ledger.'
  },
  {
    parameter: 'Total Area / Spatial Extent',
    fieldKey: 'area',
    docValue: '2.45 Acres',
    dbValue: '2.45 Acres',
    gisValue: '2.31 Acres',
    status: 'CONFLICT',
    isDiscrepancy: true,
    severity: 'CRITICAL',
    difference: '-0.14 Acres (-6,098.4 sq.ft / 566.5 m²)',
    variancePercent: '-5.71%',
    explanation: 'The survey number matches the GIS parcel, but the GIS recorded polygon area differs from the document/database value. Northern boundary intersects 2021 Zilla Parishad Road expansion easement.',
    suggestedActions: [
      'Inspect GIS Shajra polygon coordinates',
      'Accept Reference Database value (2.45 Acres)',
      'Accept Cadastral GIS Vector value (2.31 Acres)',
      'Send for Field Drone / DGPS Re-survey'
    ]
  },
  {
    parameter: 'Land Classification',
    fieldKey: 'classification',
    docValue: 'Agricultural (Wet / Jirayati)',
    dbValue: 'Wet / Jirayati',
    gisValue: 'Agri-Wet (Ayacut Zone 4)',
    status: 'MATCH',
    isDiscrepancy: false,
    severity: 'LOW',
    notes: 'Canal irrigation zoning verified via Krishna Western Delta water board.'
  },
  {
    parameter: 'North Boundary Demarcation',
    fieldKey: 'boundaryNorth',
    docValue: 'Zilla Parishad Road',
    dbValue: 'ZP Road',
    gisValue: 'ZP Highway (Widened 2021)',
    status: 'CONFLICT',
    isDiscrepancy: true,
    severity: 'MEDIUM',
    difference: 'Road expansion buffer overlaps 18.5 linear feet',
    notes: 'Statutory road easement notice issued in 2021.'
  }
];

class ValidationService {
  getValidationResults(documentId) {
    return Promise.resolve({
      documentId,
      timestamp: new Date().toISOString(),
      discrepancyCount: 1,
      criticalDiscrepancy: true,
      hasAreaConflict: true,
      records: JSON.parse(JSON.stringify(RECONCILIATION_CRITERIA))
    });
  }

  resolveDiscrepancy(documentId, resolutionAction, officerNotes) {
    return Promise.resolve({
      success: true,
      documentId,
      action: resolutionAction,
      officerNotes,
      status: 'RESOLVED_PENDING_SIGNATURE',
      updatedAt: new Date().toISOString()
    });
  }
}

export const validationService = new ValidationService();

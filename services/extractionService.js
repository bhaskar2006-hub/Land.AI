/**
 * Extraction Service
 * Simulates OCR and AI neural extraction pipeline with confidence scoring and bounding boxes.
 * Structure ready for future API: GET /api/extractions/:documentId, POST /api/extractions/re-run
 */

export const CONFIDENCE_LEVELS = {
  HIGH: { min: 90, max: 100, label: 'High Confidence', icon: 'check_circle', colorClass: 'text-[#198754] bg-[#EBF7EE] border-[#C2E7CB]' },
  MEDIUM: { min: 70, max: 89, label: 'Medium Confidence', icon: 'info', colorClass: 'text-[#F59E0B] bg-[#FEF6E7] border-[#FCDAA7]' },
  LOW: { min: 0, max: 69, label: 'Low Confidence', icon: 'warning', colorClass: 'text-error bg-[#FDE8EA] border-[#F8B4B9]' }
};

export function getConfidenceCategory(score) {
  if (score >= 90) return CONFIDENCE_LEVELS.HIGH;
  if (score >= 70) return CONFIDENCE_LEVELS.MEDIUM;
  return CONFIDENCE_LEVELS.LOW;
}

const DEFAULT_EXTRACTION_124_3 = {
  documentId: 'DOC-2026-00421',
  modelName: 'LAND-AI Neural OCR v3.2 (ResNet-Transformer)',
  ocrConfidenceAvg: 95.5,
  executionTimeMs: 840,
  processedAt: new Date().toISOString(),
  fields: [
    {
      id: 'ownerName',
      label: 'Owner Name / Pattadar',
      value: 'Ravi Kumar',
      secondaryValue: 's/o Late Venkateswarlu',
      confidence: 96,
      status: 'HIGH',
      boundingBox: { x: 24, y: 34, width: 52, height: 6 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'surveyNo',
      label: 'Survey Number',
      value: '124/3',
      secondaryValue: 'Sub-division 3 of Survey 124',
      confidence: 98,
      status: 'HIGH',
      boundingBox: { x: 55, y: 46, width: 35, height: 6 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'khataNo',
      label: 'Khata Number',
      value: 'KH-2048',
      secondaryValue: 'RoR Form 1-B Verified Account',
      confidence: 99,
      status: 'HIGH',
      boundingBox: { x: 15, y: 46, width: 36, height: 6 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'area',
      label: 'Area / Extent',
      value: '2.45 Acres',
      secondaryValue: 'Two Acres and Forty-Five Cents (Jirayati)',
      confidence: 72,
      status: 'MEDIUM',
      boundingBox: { x: 15, y: 55, width: 70, height: 7 },
      isEditable: true,
      needsReview: true,
      reviewMessage: 'Review Recommended: GIS parcel polygon indicates 2.31 Acres (-0.14 Acres)'
    },
    {
      id: 'village',
      label: 'Village',
      value: 'Mangalagiri',
      secondaryValue: 'Atchampet Revenue Ward (AP-REV-04)',
      confidence: 97,
      status: 'HIGH',
      boundingBox: { x: 18, y: 25, width: 45, height: 5 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'mandal',
      label: 'Mandal',
      value: 'Mangalagiri',
      secondaryValue: 'Guntur Revenue Division',
      confidence: 99,
      status: 'HIGH',
      boundingBox: { x: 62, y: 25, width: 30, height: 5 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'district',
      label: 'District',
      value: 'Guntur',
      secondaryValue: 'Andhra Pradesh',
      confidence: 99,
      status: 'HIGH',
      boundingBox: { x: 15, y: 18, width: 30, height: 4 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'classification',
      label: 'Land Classification',
      value: 'Agricultural (Wet / Jirayati)',
      secondaryValue: 'Krishna Western Canal Ayacut',
      confidence: 94,
      status: 'HIGH',
      boundingBox: { x: 15, y: 64, width: 55, height: 5 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'ownershipType',
      label: 'Ownership Type',
      value: 'Pattadar (Sole Proprietor)',
      secondaryValue: 'Self-acquired title (Settlement Deed)',
      confidence: 95,
      status: 'HIGH',
      boundingBox: { x: 15, y: 70, width: 50, height: 5 },
      isEditable: true,
      needsReview: false
    },
    {
      id: 'mutationNo',
      label: 'Mutation Reference',
      value: 'MUT-2024-8841',
      secondaryValue: 'Approved sub-division order',
      confidence: 88,
      status: 'MEDIUM',
      boundingBox: { x: 15, y: 76, width: 40, height: 5 },
      isEditable: true,
      needsReview: false
    }
  ]
};

class ExtractionService {
  constructor() {
    this.extractions = new Map();
    this.extractions.set('DOC-2026-00421', JSON.parse(JSON.stringify(DEFAULT_EXTRACTION_124_3)));
  }

  getExtraction(documentId) {
    if (this.extractions.has(documentId)) {
      return Promise.resolve(JSON.parse(JSON.stringify(this.extractions.get(documentId))));
    }
    // Return a customized copy for newly uploaded documents
    const docCopy = JSON.parse(JSON.stringify(DEFAULT_EXTRACTION_124_3));
    docCopy.documentId = documentId;
    return Promise.resolve(docCopy);
  }

  updateField(documentId, fieldId, newValue) {
    const ext = this.extractions.get(documentId) || JSON.parse(JSON.stringify(DEFAULT_EXTRACTION_124_3));
    const field = ext.fields.find(f => f.id === fieldId);
    if (field) {
      field.value = newValue;
      field.isManuallyEdited = true;
      field.confidence = 100;
      field.status = 'HIGH';
      field.needsReview = false;
      this.extractions.set(documentId, ext);
      return Promise.resolve(field);
    }
    return Promise.reject(new Error(`Field ${fieldId} not found`));
  }

  reRunExtraction(documentId) {
    return new Promise(resolve => {
      setTimeout(() => {
        const ext = JSON.parse(JSON.stringify(DEFAULT_EXTRACTION_124_3));
        ext.processedAt = new Date().toISOString();
        ext.ocrConfidenceAvg = 96.2;
        this.extractions.set(documentId, ext);
        resolve(ext);
      }, 1200);
    });
  }
}

export const extractionService = new ExtractionService();

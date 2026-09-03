/**
 * Document Service
 * Handles land document catalog, simulated uploads, and document metadata.
 * Structure ready for future REST API: POST /api/documents/upload, GET /api/documents/:id
 */

export const DEMO_DOCUMENTS = [
  {
    id: 'DOC-2026-00421',
    fileName: 'ROR_Mangalagiri_124_3.pdf',
    docType: 'Record of Rights (Form 1-B / 1974 Settlement Deed)',
    language: 'Telugu / English (Bilingual)',
    district: 'Guntur',
    mandal: 'Mangalagiri',
    village: 'Mangalagiri (Atchampet)',
    surveyNo: '124/3',
    khataNo: 'KH-2048',
    ownerName: 'Ravi Kumar s/o Venkateswarlu',
    docArea: '2.45 Acres',
    dbArea: '2.45 Acres',
    gisArea: '2.31 Acres',
    classification: 'Agricultural (Wet / Jirayati)',
    status: 'GIS Conflict', // UPLOADED, PROCESSING, EXTRACTED, VALIDATED, CONFLICT, VERIFIED, REJECTED
    confidenceOverall: 95.5,
    uploadTime: 'Today, 09:42 AM',
    fileSize: '4.2 MB',
    isDemoData: true,
    discrepancy: 'GIS Area Mismatch (-0.14 Acres along North ZP road boundary)'
  },
  {
    id: 'DOC-2026-00422',
    fileName: 'Patta_Nunna_88_1A.pdf',
    docType: 'Pattadar Passbook (Electronic 1-B)',
    language: 'Telugu',
    district: 'Krishna',
    mandal: 'Vijayawada Rural',
    village: 'Nunna',
    surveyNo: '88/1A',
    khataNo: 'KH-1892',
    ownerName: 'B. Lakshmi Devi',
    docArea: '1.75 Acres',
    dbArea: '1.75 Acres',
    gisArea: '1.75 Acres',
    classification: 'Agricultural (Wet)',
    status: 'Synchronized',
    confidenceOverall: 98.8,
    uploadTime: 'Today, 09:45 AM',
    fileSize: '2.8 MB',
    isDemoData: true
  },
  {
    id: 'DOC-2026-00423',
    fileName: 'Adangal_Tagarapuvalasa_312_B.pdf',
    docType: 'Pahani / Adangal Record',
    language: 'Telugu',
    district: 'Visakhapatnam',
    mandal: 'Bheemunipatnam',
    village: 'Tagarapuvalasa',
    surveyNo: '312/B',
    khataNo: 'KH-3140',
    ownerName: 'M. Satyanarayana Raju',
    docArea: '3.10 Acres',
    dbArea: '3.10 Acres',
    gisArea: '3.10 Acres',
    classification: 'Agricultural (Dry)',
    status: 'Review Required',
    confidenceOverall: 78.4,
    uploadTime: 'Yesterday, 17:20 PM',
    fileSize: '5.1 MB',
    isDemoData: true,
    discrepancy: 'Faded ancient script - Low confidence in surveyor seal'
  },
  {
    id: 'DOC-2026-00424',
    fileName: 'Deed_Chandragiri_45_2.pdf',
    docType: 'Registered Sale Deed',
    language: 'Telugu / English',
    district: 'Chittoor',
    mandal: 'Tirupati Rural',
    village: 'Chandragiri',
    surveyNo: '45/2',
    khataNo: 'KH-0941',
    ownerName: 'K. Subba Rao',
    docArea: '0.95 Acres',
    dbArea: '0.95 Acres',
    gisArea: '0.95 Acres',
    classification: 'Agricultural (Wet)',
    status: 'Synchronized',
    confidenceOverall: 96.2,
    uploadTime: 'Yesterday, 16:10 PM',
    fileSize: '3.4 MB',
    isDemoData: true
  }
];

class DocumentService {
  constructor() {
    this.documents = [...DEMO_DOCUMENTS];
  }

  getDocuments() {
    return Promise.resolve([...this.documents]);
  }

  getDocumentById(id) {
    const doc = this.documents.find(d => d.id === id);
    return Promise.resolve(doc ? { ...doc } : null);
  }

  updateDocumentStatus(id, newStatus, extraDetails = {}) {
    const doc = this.documents.find(d => d.id === id);
    if (doc) {
      doc.status = newStatus;
      Object.assign(doc, extraDetails);
      return Promise.resolve({ ...doc });
    }
    return Promise.reject(new Error(`Document ${id} not found`));
  }

  createUploadedDocument(fileData) {
    const newId = `DOC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newDoc = {
      id: newId,
      fileName: fileData.fileName || 'Uploaded_Land_Record.pdf',
      docType: fileData.docType || 'Record of Rights (Form 1-B)',
      language: fileData.language || 'Telugu / English (Auto-detected)',
      district: fileData.district || 'Guntur',
      mandal: fileData.mandal || 'Mangalagiri',
      village: fileData.village || 'Mangalagiri',
      surveyNo: fileData.surveyNo || '124/3',
      khataNo: fileData.khataNo || 'KH-2048',
      ownerName: fileData.ownerName || 'Ravi Kumar s/o Venkateswarlu',
      docArea: fileData.docArea || '2.45 Acres',
      dbArea: '2.45 Acres',
      gisArea: '2.31 Acres',
      classification: 'Agricultural (Wet / Jirayati)',
      status: 'PROCESSING',
      confidenceOverall: 95.5,
      uploadTime: 'Just now',
      fileSize: fileData.fileSize || '3.8 MB',
      isDemoData: true,
      discrepancy: 'GIS Area Mismatch (-0.14 Acres)'
    };
    this.documents.unshift(newDoc);
    return Promise.resolve(newDoc);
  }
}

export const documentService = new DocumentService();

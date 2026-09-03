from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.document import Document
from backend.app.models.extraction import ExtractedField
from backend.app.schemas.extraction import ExtractedFieldOut, DocumentExtractionSummary
from backend.app.services.extraction_service import extraction_service

router = APIRouter(prefix="/extraction", tags=["AI/ML Extraction Pipeline"])

@router.post("/{doc_id}/trigger", response_model=DocumentExtractionSummary)
def trigger_extraction(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    updated_doc = extraction_service.extract_document(db, doc_id)
    fields = db.query(ExtractedField).filter(ExtractedField.doc_id == doc_id).all()

    return {
        "doc_id": updated_doc.doc_id,
        "file_name": updated_doc.file_name,
        "status": updated_doc.status,
        "overall_confidence": updated_doc.overall_confidence,
        "fields": fields,
        "ocr_raw_text": None
    }

@router.get("/{doc_id}/fields", response_model=List[ExtractedFieldOut])
def get_extracted_fields(doc_id: str, db: Session = Depends(get_db)):
    fields = db.query(ExtractedField).filter(ExtractedField.doc_id == doc_id).all()
    return fields

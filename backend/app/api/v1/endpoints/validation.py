from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.document import Document
from backend.app.models.validation import ValidationResult
from backend.app.schemas.validation import ValidationResultOut, DocumentValidationSummary
from backend.app.services.validation_service import validation_service

router = APIRouter(prefix="/validation", tags=["Validation & Rules Engine"])

@router.post("/{doc_id}/run", response_model=DocumentValidationSummary)
def run_validation(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    summary = validation_service.validate_document(db, doc_id)
    results = db.query(ValidationResult).filter(ValidationResult.doc_id == doc_id).all()

    return {
        "doc_id": doc_id,
        "status": summary["status"],
        "is_valid": summary["is_valid"],
        "critical_errors": summary["critical_errors"],
        "warnings": summary["warnings"],
        "validation_results": results
    }

@router.get("/{doc_id}/results", response_model=List[ValidationResultOut])
def get_validation_results(doc_id: str, db: Session = Depends(get_db)):
    results = db.query(ValidationResult).filter(ValidationResult.doc_id == doc_id).all()
    return results

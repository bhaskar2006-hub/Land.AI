import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional, RoleChecker
from backend.app.models.document import Document
from backend.app.models.user import User
from backend.app.schemas.document import DocumentOut, DocumentUploadResponse
from backend.app.services.storage_service import storage_service
from backend.app.services.extraction_service import extraction_service
from backend.app.services.validation_service import validation_service
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/documents", tags=["Document Ingestion"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("7_12_EXTRACT"),
    language: str = Form("hi"),
    state_code: Optional[str] = Form(None),
    district_code: Optional[str] = Form(None),
    auto_extract: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Ingests legacy land records (PDF/JPG/PNG/TIFF), saves securely,
    and automatically triggers the AI/ML extraction & validation pipeline.
    """
    file_path, file_hash, file_size, mime_type = await storage_service.save_upload_file(file)

    doc = Document(
        file_name=file.filename or "scan.pdf",
        file_path=file_path,
        file_size_bytes=file_size,
        mime_type=mime_type,
        file_hash=file_hash,
        document_type=document_type,
        language=language,
        state_code=state_code,
        district_code=district_code,
        uploaded_by=current_user.user_id if current_user else None,
        status="PENDING"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Central Audit Log
    audit_service.log_action(
        db=db,
        action="DOCUMENT_UPLOAD",
        entity_type="DOCUMENT",
        entity_id=doc.doc_id,
        user_id=current_user.user_id if current_user else None,
        user_name=current_user.full_name if current_user else "Public Ingest",
        new_value={"file_name": doc.file_name, "language": doc.language, "type": doc.document_type}
    )

    # Auto-extract if requested
    if auto_extract:
        extraction_service.extract_document(db, doc.doc_id)
        validation_service.validate_document(db, doc.doc_id)
        db.refresh(doc)

    return {
        "message": "Document uploaded and processed successfully",
        "document": doc,
        "queued_task_id": None
    }

@router.get("", response_model=List[DocumentOut])
def list_documents(
    status: Optional[str] = Query(None, description="Filter by status (e.g. VALIDATED, NEEDS_REVIEW, PENDING)"),
    language: Optional[str] = Query(None),
    district_code: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Document)
    if status:
        query = query.filter(Document.status == status)
    if language:
        query = query.filter(Document.language == language)
    if district_code:
        query = query.filter(Document.district_code == district_code)
    if search:
        query = query.filter(Document.file_name.ilike(f"%{search}%"))

    docs = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    return docs

@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.get("/{doc_id}/file")
def download_document_file(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found on disk")
    return FileResponse(doc.file_path, media_type=doc.mime_type, filename=doc.file_name)

@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_service.delete_file(doc.file_path)
    db.delete(doc)
    db.commit()

    audit_service.log_action(
        db=db,
        action="DOCUMENT_DELETE",
        entity_type="DOCUMENT",
        entity_id=doc_id,
        user_id=current_user.user_id if current_user else None,
        user_name=current_user.full_name if current_user else "System"
    )

    return {"message": "Document deleted successfully", "doc_id": doc_id}

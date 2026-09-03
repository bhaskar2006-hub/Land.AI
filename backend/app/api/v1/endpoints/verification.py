from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import get_current_user_optional, RoleChecker
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.extraction import ExtractedField
from backend.app.models.verification import VerificationTask
from backend.app.schemas.document import DocumentOut
from backend.app.schemas.verification import VerificationTaskOut, VerificationSubmission, VerificationDetail
from backend.app.services.verification_service import verification_service
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/verify", tags=["Human-in-the-Loop Verification"])

@router.get("/queue", response_model=List[VerificationTaskOut])
def get_verification_queue(
    status: Optional[str] = Query("PENDING", description="Filter tasks by status"),
    assigned_to: Optional[str] = Query(None),
    priority: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(VerificationTask)
    if status and status != "ALL":
        query = query.filter(VerificationTask.status == status)
    if assigned_to:
        query = query.filter(VerificationTask.assigned_to == assigned_to)
    if priority:
        query = query.filter(VerificationTask.priority == priority)

    tasks = query.order_by(VerificationTask.priority.asc(), VerificationTask.created_at.desc()).all()
    return tasks

@router.get("/detail/{doc_id}", response_model=VerificationDetail)
def get_verification_detail(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.doc_id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    task = db.query(VerificationTask).filter(VerificationTask.doc_id == doc_id).first()
    if not task:
        # Create a verification task on the fly if not exists
        task = VerificationTask(doc_id=doc_id, status="PENDING")
        db.add(task)
        db.commit()
        db.refresh(task)

    fields = db.query(ExtractedField).filter(ExtractedField.doc_id == doc_id).all()
    
    return {
        "task": task,
        "document": doc,
        "extracted_fields": fields,
        "file_url": f"/api/v1/documents/{doc.doc_id}/file"
    }

@router.post("/task/{task_id}/assign", response_model=VerificationTaskOut)
def assign_task(
    task_id: str,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    target_user_id = user_id or (current_user.user_id if current_user else "default-verifier")
    return verification_service.assign_task(db, task_id, target_user_id)

@router.post("/document/{doc_id}/submit", response_model=DocumentOut)
def submit_verification(
    doc_id: str,
    submission: VerificationSubmission,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.user_id if current_user else None
    user_name = current_user.full_name if current_user else "Officer Verification"

    doc = verification_service.submit_verification(
        db=db,
        doc_id=doc_id,
        user_id=user_id,
        action=submission.action,
        corrections=submission.corrections,
        notes=submission.notes
    )

    audit_service.log_action(
        db=db,
        action=f"VERIFICATION_{submission.action}",
        entity_type="DOCUMENT",
        entity_id=doc_id,
        user_id=user_id,
        user_name=user_name,
        new_value={"action": submission.action, "corrections_count": len(submission.corrections), "notes": submission.notes}
    )

    return doc

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from backend.app.schemas.document import DocumentOut
from backend.app.schemas.extraction import ExtractedFieldOut, ExtractedFieldCorrection

class VerificationTaskBase(BaseModel):
    priority: int = 2
    notes: Optional[str] = None

class VerificationTaskCreate(VerificationTaskBase):
    doc_id: str
    assigned_to: Optional[str] = None

class VerificationTaskOut(VerificationTaskBase):
    task_id: str
    doc_id: str
    assigned_to: Optional[str] = None
    status: str # PENDING, IN_PROGRESS, COMPLETED, REJECTED, ESCALATED
    assigned_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    document: Optional[DocumentOut] = None

    class Config:
        from_attributes = True

class VerificationSubmission(BaseModel):
    action: str # "APPROVE", "REJECT", "SAVE_DRAFT"
    notes: Optional[str] = None
    corrections: List[ExtractedFieldCorrection] = []
    
class VerificationDetail(BaseModel):
    task: VerificationTaskOut
    document: DocumentOut
    extracted_fields: List[ExtractedFieldOut]
    file_url: str

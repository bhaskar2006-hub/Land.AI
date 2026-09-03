from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class DocumentBase(BaseModel):
    file_name: str
    document_type: str = "7_12_EXTRACT"
    language: str = "hi"
    state_code: Optional[str] = None
    district_code: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    status: Optional[str] = None
    overall_confidence: Optional[float] = None
    document_type: Optional[str] = None
    language: Optional[str] = None
    state_code: Optional[str] = None
    district_code: Optional[str] = None

class DocumentOut(DocumentBase):
    doc_id: str
    file_path: str
    file_size_bytes: int
    mime_type: str
    file_hash: str
    status: str
    overall_confidence: float
    page_count: int
    uploaded_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentUploadResponse(BaseModel):
    message: str
    document: DocumentOut
    queued_task_id: Optional[str] = None

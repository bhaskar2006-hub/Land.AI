from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ExtractedFieldBase(BaseModel):
    field_type: str
    raw_value: Optional[str] = None
    normalized_value: Optional[str] = None
    confidence: float
    bounding_box: Optional[str] = None
    status: str = "AUTO_EXTRACTED"
    corrected_value: Optional[str] = None

class ExtractedFieldOut(ExtractedFieldBase):
    field_id: str
    doc_id: str
    corrected_by: Optional[str] = None
    corrected_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractedFieldCorrection(BaseModel):
    field_id: str
    corrected_value: str

class DocumentExtractionSummary(BaseModel):
    doc_id: str
    file_name: str
    status: str
    overall_confidence: float
    fields: List[ExtractedFieldOut]
    ocr_raw_text: Optional[str] = None

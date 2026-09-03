from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ValidationResultBase(BaseModel):
    rule_name: str
    rule_severity: str = "CRITICAL"
    result: str # VALID, INVALID, NEEDS_REVIEW, SKIPPED
    message: str
    rule_metadata: Optional[str] = None

class ValidationResultOut(ValidationResultBase):
    val_id: str
    doc_id: str
    field_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentValidationSummary(BaseModel):
    doc_id: str
    status: str
    is_valid: bool
    critical_errors: int
    warnings: int
    validation_results: List[ValidationResultOut]

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class ValidationResult(Base):
    __tablename__ = "validation_results"

    val_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("documents.doc_id", ondelete="CASCADE"), nullable=False, index=True)
    field_id = Column(String(36), ForeignKey("extracted_fields.field_id", ondelete="SET NULL"), nullable=True)
    rule_name = Column(String(100), nullable=False)
    rule_severity = Column(String(20), default="CRITICAL") # CRITICAL, WARNING, INFO
    result = Column(String(30), nullable=False) # VALID, INVALID, NEEDS_REVIEW, SKIPPED
    message = Column(Text, nullable=False)
    rule_metadata = Column(Text, nullable=True) # JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="validation_results")

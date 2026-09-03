import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    field_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("documents.doc_id", ondelete="CASCADE"), nullable=False, index=True)
    field_type = Column(String(50), nullable=False, index=True) # OWNER_NAME, SURVEY_NO, KHASRA_NO, KHATA_NO, PLOT_AREA, AREA_UNIT, VILLAGE, TEHSIL, DISTRICT, STATE, LAND_CLASS, MUTATION_NO, REG_DATE
    raw_value = Column(Text, nullable=True)
    normalized_value = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False, default=0.0)
    bounding_box = Column(Text, nullable=True) # JSON string {x, y, width, height, page}
    status = Column(String(30), default="AUTO_EXTRACTED") # AUTO_EXTRACTED, CONFIRMED, MANUALLY_CORRECTED, REJECTED
    corrected_value = Column(Text, nullable=True)
    corrected_by = Column(String(36), ForeignKey("users.user_id"), nullable=True)
    corrected_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="extracted_fields")

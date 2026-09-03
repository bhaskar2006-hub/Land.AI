import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, BigInteger, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    doc_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=False)
    document_type = Column(String(50), default="7_12_EXTRACT") # 7_12_EXTRACT, ROR_PATTA, KHATIAN, MUTATION_REGISTER, SALE_DEED, CADASTRAL_MAP
    language = Column(String(20), default="hi") # hi, te, ta, kn, mr, bn, gu, en
    status = Column(String(30), default="PENDING", index=True) # PENDING, PROCESSING, EXTRACTED, NEEDS_REVIEW, VALIDATED, REJECTED, FAILED
    overall_confidence = Column(Float, default=0.0)
    page_count = Column(Integer, default=1)
    uploaded_by = Column(String(36), ForeignKey("users.user_id"), nullable=True, index=True)
    state_code = Column(String(10), ForeignKey("master_states.state_code"), nullable=True)
    district_code = Column(String(20), ForeignKey("master_districts.district_code"), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    validation_results = relationship("ValidationResult", back_populates="document", cascade="all, delete-orphan")
    verification_tasks = relationship("VerificationTask", back_populates="document", cascade="all, delete-orphan")
    land_record = relationship("LandRecord", back_populates="document", uselist=False)

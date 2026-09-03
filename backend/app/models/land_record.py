import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class LandRecord(Base):
    __tablename__ = "land_records"

    record_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("documents.doc_id", ondelete="SET NULL"), nullable=True, unique=True)
    survey_no = Column(String(100), nullable=False, index=True)
    khasra_no = Column(String(100), nullable=True)
    khata_no = Column(String(100), nullable=True)
    owner_name = Column(String(255), nullable=False, index=True)
    owner_name_local = Column(String(255), nullable=True)
    plot_area_sqm = Column(Float, nullable=False)
    plot_area_raw = Column(String(50), nullable=True) # e.g. "2.5 Acres", "1.01 Hectares", "100 Guntas"
    land_class = Column(String(100), default="Agricultural")
    state_code = Column(String(10), ForeignKey("master_states.state_code"), nullable=True)
    district_code = Column(String(20), ForeignKey("master_districts.district_code"), nullable=True)
    tehsil_code = Column(String(30), ForeignKey("master_tehsils.tehsil_code"), nullable=True)
    village_code = Column(String(40), ForeignKey("master_villages.village_code"), nullable=True, index=True)
    mutation_no = Column(String(100), nullable=True)
    registration_date = Column(Date, nullable=True)
    is_disputed = Column(Boolean, default=False)
    external_lrms_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="land_record")
    parcels = relationship("Parcel", back_populates="land_record")

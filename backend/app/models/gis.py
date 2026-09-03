import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Parcel(Base):
    __tablename__ = "parcels"

    parcel_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    record_id = Column(String(36), ForeignKey("land_records.record_id", ondelete="SET NULL"), nullable=True)
    survey_no = Column(String(100), nullable=False, index=True)
    district_code = Column(String(20), ForeignKey("master_districts.district_code"), nullable=True)
    village_code = Column(String(40), ForeignKey("master_villages.village_code"), nullable=True)
    area_hectares = Column(Float, nullable=True)
    centroid_lat = Column(Float, nullable=True)
    centroid_lng = Column(Float, nullable=True)
    geojson_geometry = Column(Text, nullable=False) # GeoJSON polygon geometry string
    geojson_properties = Column(Text, nullable=True) # GeoJSON properties dictionary string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    land_record = relationship("LandRecord", back_populates="parcels")

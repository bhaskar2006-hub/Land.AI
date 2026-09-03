from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel

class LandRecordBase(BaseModel):
    survey_no: str
    khasra_no: Optional[str] = None
    khata_no: Optional[str] = None
    owner_name: str
    owner_name_local: Optional[str] = None
    plot_area_sqm: float
    plot_area_raw: Optional[str] = None
    land_class: str = "Agricultural"
    state_code: Optional[str] = None
    district_code: Optional[str] = None
    tehsil_code: Optional[str] = None
    village_code: Optional[str] = None
    mutation_no: Optional[str] = None
    registration_date: Optional[date] = None
    is_disputed: bool = False
    external_lrms_id: Optional[str] = None

class LandRecordCreate(LandRecordBase):
    doc_id: Optional[str] = None

class LandRecordOut(LandRecordBase):
    record_id: str
    doc_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LandRecordSearchQuery(BaseModel):
    query: Optional[str] = None
    state_code: Optional[str] = None
    district_code: Optional[str] = None
    village_code: Optional[str] = None
    survey_no: Optional[str] = None
    owner_name: Optional[str] = None
    page: int = 1
    limit: int = 20

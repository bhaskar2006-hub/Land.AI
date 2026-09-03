from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ParcelBase(BaseModel):
    survey_no: str
    district_code: Optional[str] = None
    village_code: Optional[str] = None
    area_hectares: Optional[float] = None
    centroid_lat: Optional[float] = None
    centroid_lng: Optional[float] = None
    geojson_geometry: str # GeoJSON string
    geojson_properties: Optional[str] = None

class ParcelCreate(ParcelBase):
    record_id: Optional[str] = None

class ParcelOut(ParcelBase):
    parcel_id: str
    record_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

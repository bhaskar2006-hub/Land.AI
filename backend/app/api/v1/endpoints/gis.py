from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.gis import Parcel
from backend.app.schemas.gis import ParcelOut, GeoJSONFeatureCollection
from backend.app.services.gis_service import gis_service
from backend.app.services.cross_verification_service import cross_verification_service

router = APIRouter(prefix="/gis", tags=["GIS & Cadastral Mapping"])

@router.get("/geojson", response_model=GeoJSONFeatureCollection)
def get_cadastral_geojson(
    district_code: Optional[str] = Query(None, description="Filter by district code"),
    db: Session = Depends(get_db)
):
    """
    Returns full GeoJSON FeatureCollection of cadastral parcel boundaries,
    integrated with land record ownership and verification status.
    """
    return gis_service.get_parcels_geojson(db, district_code)

@router.get("/parcels-500")
def get_500_parcels_geojson() -> Dict[str, Any]:
    """
    Returns the authoritative 500-parcel synthetic cadastral GeoJSON dataset.
    """
    return cross_verification_service.get_500_geojson()

@router.get("/parcels-burgul")
def get_burgul_parcels_geojson() -> Dict[str, Any]:
    """
    Returns the authoritative 613-parcel Burgul Village Cadastral GeoJSON dataset.
    """
    return cross_verification_service.get_burgul_geojson()

@router.get("/cross-verify-summary")
def get_cross_verification_summary() -> Dict[str, Any]:
    """
    Returns aggregate cross-verification metrics across the 500-parcel dataset.
    """
    return cross_verification_service.get_summary_statistics()

@router.get("/cross-verify/{survey_or_doc_id}")
def verify_document_against_gis_parcel(survey_or_doc_id: str) -> Dict[str, Any]:
    """
    Cross-verifies an extracted document against the authoritative GIS parcel.
    """
    result = cross_verification_service.verify_document_against_gis(survey_or_doc_id)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    return result

@router.get("/parcel/{survey_no}", response_model=Optional[ParcelOut])
def get_parcel_by_survey(survey_no: str, db: Session = Depends(get_db)):
    parcel = gis_service.get_parcel_by_survey(db, survey_no)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel with survey number '{survey_no}' not found")
    return parcel

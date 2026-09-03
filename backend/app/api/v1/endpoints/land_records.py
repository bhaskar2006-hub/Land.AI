from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.land_record import LandRecord
from backend.app.schemas.land_record import LandRecordOut, LandRecordCreate

router = APIRouter(prefix="/records", tags=["Land Records Management"])

@router.get("", response_model=List[LandRecordOut])
def list_records(
    search: Optional[str] = Query(None, description="Search owner name, survey number, or khata"),
    village_code: Optional[str] = Query(None),
    district_code: Optional[str] = Query(None),
    is_disputed: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(LandRecord)
    if search:
        query = query.filter(
            (LandRecord.survey_no.ilike(f"%{search}%")) |
            (LandRecord.owner_name.ilike(f"%{search}%")) |
            (LandRecord.khasra_no.ilike(f"%{search}%"))
        )
    if village_code:
        query = query.filter(LandRecord.village_code == village_code)
    if district_code:
        query = query.filter(LandRecord.district_code == district_code)
    if is_disputed is not None:
        query = query.filter(LandRecord.is_disputed == is_disputed)

    return query.order_by(LandRecord.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{record_id}", response_model=LandRecordOut)
def get_record(record_id: str, db: Session = Depends(get_db)):
    rec = db.query(LandRecord).filter(LandRecord.record_id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Land record not found")
    return rec

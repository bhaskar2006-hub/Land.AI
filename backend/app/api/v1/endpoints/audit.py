from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import RoleChecker
from backend.app.models.audit import AuditLog
from backend.app.schemas.audit import AuditLogOut

router = APIRouter(prefix="/audit", tags=["Security & Audit Trails"])

@router.get("/logs", response_model=List[AuditLogOut], dependencies=[Depends(RoleChecker(["SUPER_ADMIN", "STATE_ADMIN", "DISTRICT_OFFICER"]))])
def list_audit_logs(
    action: Optional[str] = Query(None),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    return query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()

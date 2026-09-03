from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class AuditLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    user_id: Optional[str] = None
    user_name: Optional[str] = None

class AuditLogOut(AuditLogBase):
    log_id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

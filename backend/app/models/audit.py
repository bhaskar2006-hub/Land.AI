import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from backend.app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True, index=True)
    user_name = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False) # UPLOAD, EXTRACT, VALIDATE, VERIFY_APPROVE, VERIFY_REJECT, EDIT_FIELD, EXPORT_REPORT
    entity_type = Column(String(50), nullable=False, index=True) # DOCUMENT, LAND_RECORD, USER, PARCEL
    entity_id = Column(String(100), nullable=False, index=True)
    old_value = Column(Text, nullable=True) # JSON snapshot
    new_value = Column(Text, nullable=True) # JSON snapshot
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

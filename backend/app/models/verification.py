import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class VerificationTask(Base):
    __tablename__ = "verification_tasks"

    task_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("documents.doc_id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to = Column(String(36), ForeignKey("users.user_id"), nullable=True, index=True)
    status = Column(String(30), default="PENDING", index=True) # PENDING, IN_PROGRESS, COMPLETED, REJECTED, ESCALATED
    priority = Column(Integer, default=2) # 1=High, 2=Medium, 3=Low
    notes = Column(Text, nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="verification_tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])

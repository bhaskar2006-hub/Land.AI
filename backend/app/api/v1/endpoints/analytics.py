from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.schemas.analytics import DashboardStats
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Reporting"])

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns aggregated KPIs, state-wise digitisation rates, accuracy trends,
    and language distribution for high-level monitoring.
    """
    return analytics_service.get_dashboard_stats(db)

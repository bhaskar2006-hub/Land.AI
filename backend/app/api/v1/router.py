from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    documents,
    extraction,
    validation,
    verification,
    land_records,
    gis,
    analytics,
    audit,
    ml
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(documents.router)
api_router.include_router(extraction.router)
api_router.include_router(validation.router)
api_router.include_router(verification.router)
api_router.include_router(land_records.router)
api_router.include_router(gis.router)
api_router.include_router(analytics.router)
api_router.include_router(audit.router)
api_router.include_router(ml.router)

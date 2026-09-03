from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class KPISummary(BaseModel):
    total_documents: int
    validated_documents: int
    review_queue: int
    error_documents: int
    processing_documents: int
    overall_accuracy_pct: float
    avg_processing_time_sec: float
    total_parcels_mapped: int

class AccuracyTrendItem(BaseModel):
    date: str
    printed_accuracy: float
    handwritten_accuracy: float
    overall_accuracy: float
    count: int

class StateMetric(BaseModel):
    state_code: str
    state_name: str
    total_docs: int
    validated: int
    in_review: int
    errors: int
    completion_rate_pct: float

class LanguageMetric(BaseModel):
    language_code: str
    language_name: str
    total_docs: int
    avg_confidence: float

class DashboardStats(BaseModel):
    kpis: KPISummary
    state_metrics: List[StateMetric]
    accuracy_trends: List[AccuracyTrendItem]
    language_metrics: List[LanguageMetric]

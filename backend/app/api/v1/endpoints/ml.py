from typing import Dict, Any, List, Optional
import tempfile
import os
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form

from backend.app.core.config import settings
from backend.app.services.ocr_engine import ocr_engine
from backend.app.ml.script_normalizer import script_normalizer
from backend.app.ml.entity_extractor import entity_extractor
from backend.app.ml.confidence_scorer import confidence_scorer
from backend.app.ml.active_learning import active_learning_pipeline
from backend.app.ml.vision_restoration import vision_restorer
from backend.app.ml.layout_decomposer import layout_decomposer
from backend.app.ml.unified_schema import unified_schema
from backend.app.services.ulpin_service import ulpin_service
from backend.app.services.validation_service import validation_service
from backend.app.services.cadastral_vectorizer import cadastral_vectorizer
from backend.app.services.export_adapters import export_adapters

router = APIRouter(prefix="/ml", tags=["AI/ML Pipeline & Active Learning"])

class NormalizeRequest(BaseModel):
    text: str

class ParseEntitiesRequest(BaseModel):
    raw_ocr_text: str
    language: str = "hi"

class ULPINRequest(BaseModel):
    latitude: float
    longitude: float
    state_code: str = "KA"
    village_lgd_code: str = "6045"

class ULPINValidateRequest(BaseModel):
    ulpin: str

class AreaConsistencyRequest(BaseModel):
    total_area_hectares: float
    sub_plots_hectares: List[float]
    tolerance_pct: float = 1.0

class ExportAdapterRequest(BaseModel):
    target_system: str # "DILRMP", "BHOOMI", "DHARANI", "MAHABHULEKH"
    record: Dict[str, Any]

@router.get("/active-learning/stats")
def get_active_learning_stats() -> Dict[str, Any]:
    """
    Returns corpus statistics, annotated samples count, and fine-tuning readiness.
    """
    return active_learning_pipeline.get_corpus_statistics()

@router.post("/normalize-script")
def normalize_indic_script(payload: NormalizeRequest) -> Dict[str, Any]:
    """
    Normalizes Indic scripts, converts Indic digits to ASCII, and cleans zero-width joiners.
    """
    cleaned = script_normalizer.normalize_text(payload.text)
    ascii_digits = script_normalizer.convert_indic_numerals_to_ascii(cleaned)
    survey_clean = script_normalizer.standardize_survey_number(payload.text)
    area_parsed = script_normalizer.parse_area_to_sqm(payload.text)

    return {
        "original": payload.text,
        "normalized": cleaned,
        "ascii_digits": ascii_digits,
        "standardized_survey": survey_clean,
        "area_parsed": area_parsed
    }

@router.post("/parse-entities")
def parse_revenue_entities(payload: ParseEntitiesRequest) -> Dict[str, Any]:
    """
    Extracts Indian Revenue Named Entities from arbitrary OCR text.
    """
    entities = entity_extractor.extract_entities_from_text(
        raw_text=payload.raw_ocr_text,
        language=payload.language
    )
    unified = unified_schema.map_to_unified_record({
        k: v.get("normalized", "") for k, v in entities.items()
    })

    return {
        "language": payload.language,
        "entities": entities,
        "entities_count": len(entities),
        "unified_national_record": unified
    }

@router.get("/layout/zones")
def get_document_layout_zones() -> Dict[str, Any]:
    """
    Returns decomposed structural layout zones (tabular grid, seals, headers, marginalia).
    """
    return layout_decomposer.detect_layout_zones()

@router.post("/ulpin/generate")
def generate_bhu_aadhaar_ulpin(payload: ULPINRequest) -> Dict[str, Any]:
    """
    Generates 14-digit standard Bhu-Aadhaar / ULPIN code for coordinates.
    """
    ulpin = ulpin_service.generate_ulpin(
        lat=payload.latitude,
        lng=payload.longitude,
        state_code=payload.state_code,
        village_lgd_code=payload.village_lgd_code
    )
    validation = ulpin_service.validate_ulpin(ulpin)
    return {
        "ulpin": ulpin,
        "validation": validation
    }

@router.post("/ulpin/validate")
def validate_bhu_aadhaar_ulpin(payload: ULPINValidateRequest) -> Dict[str, Any]:
    """
    Validates check-digit integrity of a 14-digit Bhu-Aadhaar ULPIN.
    """
    return ulpin_service.validate_ulpin(payload.ulpin)

@router.post("/area/math-consistency")
def verify_area_consistency(payload: AreaConsistencyRequest) -> Dict[str, Any]:
    """
    Cross-verifies sum(sub-plots) = total parcel area within <= 1.0% tolerance.
    """
    return validation_service.verify_subdivision_area_consistency(
        total_stated_area=payload.total_area_hectares,
        sub_division_areas=payload.sub_plots_hectares,
        tolerance_pct=payload.tolerance_pct
    )

@router.get("/cadastral/vectorize")
def get_vectorized_cadastral_map() -> Dict[str, Any]:
    """
    Returns GeoJSON polygons extracted from village FMB sheet with encroachment heatmap.
    """
    return cadastral_vectorizer.vectorize_fmb_sheet()

@router.post("/export/adapter")
def export_to_national_lrms(payload: ExportAdapterRequest) -> Dict[str, Any]:
    """
    Adapts ILRDVS record into statutory state/national formats:
    DILRMP, BHOOMI, DHARANI, MAHABHULEKH.
    """
    sys_name = payload.target_system.upper()
    rec = payload.record

    if sys_name == "BHOOMI":
        result = export_adapters.export_bhoomi_karnataka(rec)
    elif sys_name == "DHARANI":
        result = export_adapters.export_dharani_telangana(rec)
    elif sys_name == "MAHABHULEKH":
        result = export_adapters.export_mahabhulekh_maharashtra(rec)
    else:
        result = export_adapters.export_dilrmp_national(rec)

    return {
        "target_system": sys_name,
        "status": "CONVERTED_SUCCESSFULLY",
        "payload": result
    }

@router.get("/ocr/status")
def get_ocr_engine_status() -> Dict[str, Any]:
    """
    Returns the operational status, project ID, and credential status of the Google Cloud Vision OCR engine.
    """
    token = ocr_engine.get_access_token()
    return {
        "engine": "google_cloud_vision",
        "project_id": ocr_engine.project_id or settings.GCP_PROJECT_ID,
        "credentials_loaded": ocr_engine.credentials is not None,
        "token_available": token is not None,
        "vision_feature_type": settings.VISION_FEATURE_TYPE,
        "vision_ocr_enabled": settings.VISION_OCR_ENABLED,
        "supported_languages": ocr_engine.supported_languages
    }

@router.post("/ocr/run")
async def run_vision_ocr(
    file: UploadFile = File(...),
    language: str = Form("hi"),
    document_type: str = Form("7_12_EXTRACT")
) -> Dict[str, Any]:
    """
    Directly runs Google Cloud Vision OCR on an uploaded file and returns extracted text,
    detected languages, blocks, bounding boxes, and field candidates.
    """
    content = await file.read()
    suffix = os.path.splitext(file.filename or "scan.pdf")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        ocr_result = ocr_engine.perform_ocr(tmp_path, language=language, doc_type=document_type)
        entities = entity_extractor.extract_entities_from_text(
            raw_text=ocr_result.get("raw_text", ""),
            language=language
        )
        return {
            "file_name": file.filename,
            "ocr_result": ocr_result,
            "extracted_entities": entities,
            "entities_count": len(entities)
        }
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

@router.get("/gemini/status")
def get_gemini_ocr_status() -> Dict[str, Any]:
    """
    Returns Gemini Multimodal OCR status, model name, and API Key configuration status.
    """
    return {
        "engine": "gemini_multimodal_ocr",
        "model": settings.GEMINI_MODEL,
        "api_key_configured": bool(settings.GEMINI_API_KEY),
        "timeout_seconds": settings.GEMINI_TIMEOUT_SECONDS,
        "system_prompt_enabled": True
    }

@router.post("/gemini/run")
async def run_gemini_ocr(
    file: UploadFile = File(...),
    language: str = Form("hi")
) -> Dict[str, Any]:
    """
    Executes Multimodal OCR and structured Indic revenue entity extraction via Gemini API.
    """
    from backend.app.services.gemini_ocr import gemini_ocr_engine

    content = await file.read()
    result = gemini_ocr_engine.extract_from_file(content, mime_type=file.content_type or "image/jpeg", language=language)
    return {
        "file_name": file.filename,
        "result": result
    }



"""
Test Suite for Gemini Multimodal OCR Engine in Land.AI
"""

import os
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.gemini_ocr import gemini_ocr_engine, GeminiOCREngine

client = TestClient(app)

def test_gemini_system_prompt_configuration():
    assert "You are an expert AI Revenue Document Inspector" in gemini_ocr_engine.SYSTEM_PROMPT
    assert "survey_no" in gemini_ocr_engine.SYSTEM_PROMPT
    assert "plot_area_sqm" in gemini_ocr_engine.SYSTEM_PROMPT
    assert "owner_name_local" in gemini_ocr_engine.SYSTEM_PROMPT

def test_gemini_ocr_fallback_extraction():
    sample_pdf = "sample_pdfs/7_12_Extract_Nashik_Survey142_2A.pdf"
    if os.path.exists(sample_pdf):
        res = gemini_ocr_engine.extract_from_file(sample_pdf, language="mr")
        assert res is not None
        assert "survey_no" in res or ("data" in res and "survey_no" in res["data"]) or ("fallback" in res and "survey_no" in res["fallback"])

def test_gemini_ocr_status_endpoint():
    resp = client.get("/api/v1/ml/gemini/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["engine"] == "gemini_multimodal_ocr"
    assert data["system_prompt_enabled"] is True
    assert "model" in data

def test_gemini_ocr_run_endpoint():
    sample_pdf = "sample_pdfs/7_12_Extract_Nashik_Survey142_2A.pdf"
    if os.path.exists(sample_pdf):
        with open(sample_pdf, "rb") as f:
            resp = client.post(
                "/api/v1/ml/gemini/run",
                files={"file": ("test_doc.pdf", f, "application/pdf")},
                data={"language": "mr"}
            )
        assert resp.status_code == 200
        data = resp.json()
        assert "file_name" in data
        assert "result" in data

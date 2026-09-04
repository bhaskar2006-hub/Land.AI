import os
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.config import settings
from backend.app.services.ocr_engine import ocr_engine

client = TestClient(app)

def test_vision_credentials_loaded():
    assert ocr_engine.credentials is not None
    assert ocr_engine.project_id == "hip-cyclist-478906-t1"

def test_vision_token_generation():
    token = ocr_engine.get_access_token()
    assert token is not None
    assert len(token) > 50

def test_vision_ocr_status_endpoint():
    resp = client.get("/api/v1/ml/ocr/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["engine"] == "google_cloud_vision"
    assert data["project_id"] == "hip-cyclist-478906-t1"
    assert data["credentials_loaded"] is True
    assert data["token_available"] is True
    assert "hi" in data["supported_languages"]

def test_vision_ocr_execution_on_sample():
    sample_pdf = "sample_pdfs/7_12_Extract_Nashik_Survey142_2A.pdf"
    if os.path.exists(sample_pdf):
        result = ocr_engine.perform_ocr(sample_pdf, language="mr")
        assert result is not None
        assert "raw_text" in result
        assert len(result["raw_text"]) > 20
        assert "ocr_confidence" in result
        assert result["ocr_confidence"] > 0.5
        assert len(result.get("blocks", [])) > 0

def test_vision_direct_run_endpoint():
    sample_pdf = "sample_pdfs/7_12_Extract_Nashik_Survey142_2A.pdf"
    if os.path.exists(sample_pdf):
        with open(sample_pdf, "rb") as f:
            resp = client.post(
                "/api/v1/ml/ocr/run",
                files={"file": ("test_doc.pdf", f, "application/pdf")},
                data={"language": "mr", "document_type": "7_12_EXTRACT"}
            )
        assert resp.status_code == 200
        data = resp.json()
        assert "ocr_result" in data
        assert "extracted_entities" in data
        assert data["ocr_result"]["raw_text"] != ""

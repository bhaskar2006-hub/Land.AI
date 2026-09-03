import pytest
from io import BytesIO
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "SUPER_ADMIN"

def test_analytics_dashboard(client):
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "state_metrics" in data
    assert len(data["accuracy_trends"]) > 0

def test_gis_cadastral_geojson(client):
    response = client.get("/api/v1/gis/geojson")
    assert response.status_code == 200
    geojson = response.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) > 0
    first_feat = geojson["features"][0]
    assert "geometry" in first_feat
    assert "survey_no" in first_feat["properties"]

def test_document_upload_and_pipeline(client):
    # 1. Upload mock land record
    fake_pdf = BytesIO(b"%PDF-1.4 Mock Land Record Scan content for Tamil Nadu Nilgiris Survey 123/4A")
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test_survey_record.pdf", fake_pdf, "application/pdf")},
        data={"document_type": "7_12_EXTRACT", "language": "ta", "district_code": "NILGIRIS", "auto_extract": "true"}
    )
    assert response.status_code == 200
    doc_data = response.json()["document"]
    doc_id = doc_data["doc_id"]
    assert doc_id is not None

    # 2. Get extracted fields
    fields_resp = client.get(f"/api/v1/extraction/{doc_id}/fields")
    assert fields_resp.status_code == 200
    fields = fields_resp.json()
    assert len(fields) > 0

    # 3. Run validation
    val_resp = client.post(f"/api/v1/validation/{doc_id}/run")
    assert val_resp.status_code == 200
    val_data = val_resp.json()
    assert "is_valid" in val_data

    # 4. Check verification queue detail
    detail_resp = client.get(f"/api/v1/verify/detail/{doc_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["document"]["doc_id"] == doc_id

    # 5. Submit verification approval
    verify_resp = client.post(
        f"/api/v1/verify/document/{doc_id}/submit",
        json={
            "action": "APPROVE",
            "notes": "Verified against Nilgiris sub-registrar roster",
            "corrections": []
        }
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "VALIDATED"

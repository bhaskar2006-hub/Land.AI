import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.ulpin_service import ulpin_service
from backend.app.services.validation_service import validation_service
from backend.app.services.audit_service import audit_service
from backend.app.services.cadastral_vectorizer import cadastral_vectorizer
from backend.app.services.export_adapters import export_adapters
from backend.app.ml.unified_schema import unified_schema

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_ulpin_generation_and_validation():
    lat, lng = 11.4225, 76.8640
    ulpin = ulpin_service.generate_ulpin(lat, lng, state_code="KA", village_lgd_code="6045")
    assert len(ulpin) == 14
    assert ulpin.startswith("KA6045")

    val_res = ulpin_service.validate_ulpin(ulpin)
    assert val_res["is_valid"] is True
    assert val_res["check_digit"] == ulpin[-1]

    # Tampered ULPIN should fail validation
    tampered = ulpin[:-1] + ("X" if ulpin[-1] != "X" else "Y")
    invalid_res = ulpin_service.validate_ulpin(tampered)
    assert invalid_res["is_valid"] is False

def test_subdivision_mathematical_consistency():
    # Sum equals total within 1%
    total = 2.50
    sub_plots = [1.75, 0.74] # sum = 2.49 (diff = 0.01 / 2.50 = 0.4%)
    res = validation_service.verify_subdivision_area_consistency(total, sub_plots, tolerance_pct=1.0)
    assert res["is_consistent"] is True
    assert res["status"] == "PASS"

    # Discrepancy > 1% should trigger FLAGGED_DISCREPANCY
    mismatch_plots = [1.50, 0.70] # sum = 2.20 (diff = 0.30 / 2.50 = 12%)
    mismatch_res = validation_service.verify_subdivision_area_consistency(total, mismatch_plots, tolerance_pct=1.0)
    assert mismatch_res["is_consistent"] is False
    assert mismatch_res["status"] == "FLAGGED_DISCREPANCY"

def test_unified_area_normalizer():
    # Guntha to Sq. Meters
    g_res = unified_schema.normalize_area("20 Gunthas")
    assert g_res["detected_unit"] == "Guntha"
    assert round(g_res["sqm"]) == 2023

    # Bigha to Sq. Meters
    b_res = unified_schema.normalize_area("2.0 Bigha")
    assert round(b_res["sqm"]) == 5059

    # Kanal to Sq. Meters
    k_res = unified_schema.normalize_area("4 Kanals")
    assert round(k_res["sqm"]) == 2023

def test_cadastral_fmb_vectorizer():
    fmb = cadastral_vectorizer.vectorize_fmb_sheet("FMB_KOTAGIRI_123")
    assert fmb["type"] == "FeatureCollection"
    assert len(fmb["features"]) >= 3
    for feat in fmb["features"]:
        assert "discrepancy_pct" in feat["properties"]
        assert "heatmap_level" in feat["properties"]
        assert feat["geometry"]["type"] == "Polygon"

def test_national_export_adapters():
    sample_rec = {
        "survey_no": "123/4A",
        "khata_no": "908",
        "owner_name": "Ramesh Kumar",
        "owner_name_local": "ரமேஷ் குமார்",
        "area_hectares": 1.012,
        "district": "Nilgiris",
        "tehsil": "Udhagamandalam",
        "village": "Kotagiri",
        "is_disputed": False
    }

    # DILRMP
    dilrmp = export_adapters.export_dilrmp_national(sample_rec)
    assert dilrmp["schema_version"] == "DILRMP-2.0-2024"
    assert dilrmp["cadastral_survey_no"] == "123/4A"

    # Bhoomi
    bhoomi = export_adapters.export_bhoomi_karnataka(sample_rec)
    assert "bhoomi_rtc" in bhoomi
    assert bhoomi["bhoomi_rtc"]["survey_no"] == "123/4A"

    # Dharani
    dharani = export_adapters.export_dharani_telangana(sample_rec)
    assert "dharani_passbook" in dharani

    # Mahabhulekh
    maha = export_adapters.export_mahabhulekh_maharashtra(sample_rec)
    assert "satbara_7_12" in maha

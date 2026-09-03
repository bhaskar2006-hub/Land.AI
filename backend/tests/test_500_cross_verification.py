"""
Test suite for 500-Parcel GIS and Extracted Document Cross-Verification:
1. Dataset ingestion validation (500 documents and 500 parcels)
2. Clean title verification (Survey 101/1)
3. Area mismatch detection (Survey 134, > 1% discrepancy)
4. Titleholder owner mismatch detection (Survey 197)
5. GeoJSON boundary feature collection integrity
"""

import pytest
from backend.app.services.cross_verification_service import cross_verification_service

def test_500_dataset_ingestion():
    docs = cross_verification_service.load_document_extractions()
    parcels = cross_verification_service.load_parcels()
    assert len(docs) == 500, f"Expected 500 documents, got {len(docs)}"
    assert len(parcels) == 500, f"Expected 500 parcels, got {len(parcels)}"

def test_500_geojson_features():
    geojson = cross_verification_service.get_500_geojson()
    assert geojson.get("type") == "FeatureCollection"
    assert len(geojson.get("features", [])) == 500
    first_feat = geojson["features"][0]
    assert first_feat["properties"]["parcel_id"] == "P0001"
    assert first_feat["geometry"]["type"] == "Polygon"
    assert len(first_feat["geometry"]["coordinates"][0]) >= 4

def test_cross_verify_clean_record():
    res = cross_verification_service.verify_document_against_gis("101/1")
    assert res["success"] is True
    assert res["cross_verification"]["status"] == "VERIFIED"
    assert res["cross_verification"]["area_match"] is True
    assert res["cross_verification"]["owner_match"] is True
    assert res["cross_verification"]["area_discrepancy_pct"] <= 1.0

def test_cross_verify_area_mismatch():
    # Survey 134 has extracted area 15.3579 vs GIS area 14.2203 (~8% diff)
    res = cross_verification_service.verify_document_against_gis("134")
    assert res["success"] is True
    assert res["cross_verification"]["status"] == "CONFLICT"
    assert res["cross_verification"]["area_match"] is False
    assert res["cross_verification"]["area_discrepancy_pct"] > 1.0
    assert any("Area mismatch" in iss for iss in res["cross_verification"]["issues"])

def test_cross_verify_owner_mismatch():
    # Survey 197 has extracted owner Synthetic Owner 114 vs registered Synthetic Owner 097
    res = cross_verification_service.verify_document_against_gis("197")
    assert res["success"] is True
    assert res["cross_verification"]["status"] == "CONFLICT"
    assert res["cross_verification"]["owner_match"] is False
    assert any("Owner mismatch" in iss for iss in res["cross_verification"]["issues"])

def test_summary_statistics():
    stats = cross_verification_service.get_summary_statistics()
    assert stats["total_parcels"] == 500
    assert stats["verified_count"] == 344
    assert stats["review_required_count"] == 106
    assert stats["conflict_count"] == 50
    assert stats["issues_breakdown"]["Area mismatch"] == 18
    assert stats["issues_breakdown"]["Owner mismatch"] == 19

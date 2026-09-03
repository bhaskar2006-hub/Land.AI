"""
Cross-System Validation & Verification Engine:
Validates extracted document data against authoritative GIS cadastral parcel registry:
- Mathematical area comparison: OCR Stated Area vs. PostGIS Physical Polygon Area (tolerance <= 1%)
- Titleholder cross-check: OCR Owner Name vs. Cadastral Registered Owner
- Mutation and encumbrance audit
- Discrepancy flagging: Area Mismatch, Owner Mismatch, Survey Uncertainty, Possible Duplicate
"""

import os
import csv
import json
from typing import Dict, Any, List, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")

class CrossVerificationService:
    """
    Automated Cross-Verification Engine for Land Records & GIS Cadastral Data.
    """

    def __init__(self):
        self.doc_csv_path = os.path.join(DATA_DIR, "document_extractions_500.csv")
        self.parcel_csv_path = os.path.join(DATA_DIR, "parcels_500.csv")
        self.geojson_path = os.path.join(DATA_DIR, "parcels_500.geojson")

    def load_parcels(self) -> List[Dict[str, Any]]:
        parcels = []
        if os.path.exists(self.parcel_csv_path):
            with open(self.parcel_csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                parcels = list(reader)
        return parcels

    def load_document_extractions(self) -> List[Dict[str, Any]]:
        docs = []
        if os.path.exists(self.doc_csv_path):
            with open(self.doc_csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                docs = list(reader)
        return docs

    def get_500_geojson(self) -> Dict[str, Any]:
        if os.path.exists(self.geojson_path):
            with open(self.geojson_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"type": "FeatureCollection", "features": []}

    def get_burgul_geojson(self) -> Dict[str, Any]:
        burgul_path = os.path.join(DATA_DIR, "burgul_parcels_613.geojson")
        if os.path.exists(burgul_path):
            with open(burgul_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"type": "FeatureCollection", "features": []}

    def verify_document_against_gis(self, document_id_or_survey: str) -> Dict[str, Any]:
        """
        Runs cross-verification between a document's extracted fields and the authoritative GIS parcel.
        """
        docs = self.load_document_extractions()
        parcels = self.load_parcels()

        # Find matching doc
        target_doc = None
        for d in docs:
            if d["document_id"] == document_id_or_survey or d["ocr_survey_number"] == document_id_or_survey:
                target_doc = d
                break

        if not target_doc:
            return {"success": False, "error": f"Document or survey '{document_id_or_survey}' not found"}

        # Find matching GIS parcel
        target_parcel = None
        for p in parcels:
            if p["parcel_id"] == target_doc["parcel_id"] or p["survey_display"] == target_doc["ocr_survey_number"]:
                target_parcel = p
                break

        if not target_parcel:
            return {
                "success": False,
                "error": f"No corresponding cadastral parcel found for survey {target_doc['ocr_survey_number']}"
            }

        # 1. Area Cross-Check
        ocr_area = float(target_doc["ocr_area_acres"])
        gis_area = float(target_parcel["area_acres"])
        area_diff = abs(ocr_area - gis_area)
        area_diff_pct = round((area_diff / gis_area) * 100, 2)
        area_match = area_diff_pct <= 1.0

        # 2. Owner Cross-Check
        ocr_owner = target_doc["ocr_owner_name"].strip().lower()
        gis_owner = target_parcel["owner_name"].strip().lower()
        owner_match = (ocr_owner == gis_owner)

        # 3. Overall Verification Status
        issues = []
        if not area_match:
            issues.append(f"Area mismatch: OCR stated {ocr_area:.2f} Acres vs GIS registered {gis_area:.2f} Acres ({area_diff_pct}% diff)")
        if not owner_match:
            issues.append(f"Owner mismatch: OCR extracted '{target_doc['ocr_owner_name']}' vs Deed registered '{target_parcel['owner_name']}'")
        if target_doc.get("validation_issue"):
            issues.append(target_doc["validation_issue"])

        if not area_match or not owner_match or "uncertainty" in str(target_doc.get("validation_issue")).lower():
            final_status = "CONFLICT"
            badge = "🔴 Disputed / Conflict"
        elif len(issues) > 0:
            final_status = "REVIEW_REQUIRED"
            badge = "🟡 Review Required"
        else:
            final_status = "VERIFIED"
            badge = "🟢 Verified & Clean"

        return {
            "success": True,
            "document_id": target_doc["document_id"],
            "parcel_id": target_parcel["parcel_id"],
            "survey_display": target_parcel["survey_display"],
            "ocr_extracted": {
                "survey_number": target_doc["ocr_survey_number"],
                "owner_name": target_doc["ocr_owner_name"],
                "area_acres": ocr_area,
                "confidence": float(target_doc["ocr_confidence"])
            },
            "gis_registered": {
                "survey_number": target_parcel["survey_display"],
                "owner_name": target_parcel["owner_name"],
                "area_acres": gis_area,
                "area_sq_meters": float(target_parcel["area_sq_meters"]),
                "centroid": {
                    "lat": float(target_parcel["centroid_lat"]),
                    "lon": float(target_parcel["centroid_lon"])
                },
                "land_classification": target_parcel["land_classification"],
                "mutation_status": target_parcel["mutation_status"]
            },
            "cross_verification": {
                "area_match": area_match,
                "area_discrepancy_pct": area_diff_pct,
                "owner_match": owner_match,
                "status": final_status,
                "badge": badge,
                "issues": issues
            }
        }

    def get_summary_statistics(self) -> Dict[str, Any]:
        """
        Computes aggregate audit stats across the 500-parcel dataset.
        """
        parcels = self.load_parcels()
        total = len(parcels)
        verified = sum(1 for p in parcels if p["verification_status"] == "Verified")
        review_required = sum(1 for p in parcels if p["verification_status"] == "Review Required")
        conflict = sum(1 for p in parcels if p["verification_status"] == "Conflict")

        issues_breakdown = {}
        for p in parcels:
            iss = p["validation_issue"]
            if iss:
                issues_breakdown[iss] = issues_breakdown.get(iss, 0) + 1

        return {
            "total_parcels": total,
            "verified_count": verified,
            "review_required_count": review_required,
            "conflict_count": conflict,
            "accuracy_rate_pct": round((verified / total) * 100, 1) if total else 0,
            "issues_breakdown": issues_breakdown
        }

cross_verification_service = CrossVerificationService()

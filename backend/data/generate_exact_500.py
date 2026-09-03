"""
Complete generator for the 500 synthetic land record documents, GIS parcels, and GeoJSON polygon boundaries.
"""

import os
import csv
import json

DATA_DIR = "/Users/bhaskarreddy/Land.AI/backend/data"
os.makedirs(DATA_DIR, exist_ok=True)

# Define exact issue map extracted from the user prompt specification
ISSUES_MAP = {
    3: "Missing mutation information",
    4: "Missing mutation information",
    12: "Survey number uncertainty",
    13: "Possible duplicate",
    19: "Low OCR confidence",
    24: "Survey number uncertainty",
    26: "Low OCR confidence",
    27: "Survey number uncertainty",
    30: "Survey number uncertainty",
    34: "Area mismatch",
    38: "Low OCR confidence",
    42: "Missing mutation information",
    51: "Area mismatch",
    54: "Survey number uncertainty",
    62: "Missing mutation information",
    65: "Possible duplicate",
    66: "Missing mutation information",
    67: "Survey number uncertainty",
    72: "Low OCR confidence",
    78: "Possible duplicate",
    82: "Missing mutation information",
    87: "Area mismatch",
    91: "Missing mutation information",
    97: "Owner mismatch",
    98: "Low OCR confidence",
    102: "Survey number uncertainty",
    110: "Missing mutation information",
    112: "Survey number uncertainty",
    117: "Area mismatch",
    119: "Possible duplicate",
    120: "Missing mutation information",
    121: "Owner mismatch",
    122: "Missing mutation information",
    128: "Low OCR confidence",
    129: "Missing mutation information",
    130: "Missing mutation information",
    139: "Low OCR confidence",
    141: "Possible duplicate",
    142: "Possible duplicate",
    143: "Low OCR confidence",
    145: "Low OCR confidence",
    146: "Area mismatch",
    149: "Missing mutation information",
    156: "Possible duplicate",
    158: "Missing mutation information",
    162: "Missing mutation information",
    164: "Low OCR confidence",
    167: "Missing mutation information",
    168: "Missing mutation information",
    172: "Missing mutation information",
    173: "Area mismatch",
    174: "Possible duplicate",
    175: "Area mismatch",
    178: "Low OCR confidence",
    180: "Missing mutation information",
    182: "Missing mutation information",
    183: "Missing mutation information",
    186: "Missing mutation information",
    192: "Possible duplicate",
    194: "Survey number uncertainty",
    198: "Area mismatch",
    201: "Missing mutation information",
    203: "Area mismatch",
    204: "Low OCR confidence",
    205: "Owner mismatch",
    206: "Possible duplicate",
    209: "Possible duplicate",
    216: "Owner mismatch",
    222: "Possible duplicate",
    228: "Missing mutation information",
    239: "Area mismatch",
    242: "Low OCR confidence",
    245: "Survey number uncertainty",
    248: "Possible duplicate",
    254: "Missing mutation information",
    255: "Possible duplicate",
    257: "Missing mutation information",
    261: "Low OCR confidence",
    263: "Possible duplicate",
    268: "Possible duplicate",
    269: "Area mismatch",
    274: "Owner mismatch",
    279: "Missing mutation information",
    289: "Survey number uncertainty",
    292: "Possible duplicate",
    293: "Owner mismatch",
    295: "Owner mismatch",
    297: "Low OCR confidence",
    299: "Missing mutation information",
    304: "Owner mismatch",
    305: "Possible duplicate",
    306: "Owner mismatch",
    307: "Low OCR confidence",
    313: "Missing mutation information",
    319: "Missing mutation information",
    326: "Low OCR confidence",
    331: "Possible duplicate",
    336: "Area mismatch",
    342: "Low OCR confidence",
    345: "Owner mismatch",
    348: "Owner mismatch",
    349: "Low OCR confidence",
    350: "Low OCR confidence",
    351: "Missing mutation information",
    354: "Possible duplicate",
    357: "Missing mutation information",
    361: "Low OCR confidence",
    363: "Possible duplicate",
    366: "Low OCR confidence",
    367: "Missing mutation information",
    376: "Missing mutation information",
    377: "Missing mutation information",
    378: "Missing mutation information",
    380: "Survey number uncertainty",
    381: "Possible duplicate",
    384: "Missing mutation information",
    393: "Survey number uncertainty",
    397: "Possible duplicate",
    398: "Possible duplicate",
    399: "Owner mismatch",
    401: "Area mismatch",
    403: "Area mismatch",
    408: "Missing mutation information",
    409: "Low OCR confidence",
    413: "Owner mismatch",
    414: "Missing mutation information",
    415: "Low OCR confidence",
    416: "Area mismatch",
    418: "Possible duplicate",
    420: "Area mismatch",
    422: "Possible duplicate",
    424: "Missing mutation information",
    425: "Possible duplicate",
    426: "Low OCR confidence",
    429: "Possible duplicate",
    432: "Area mismatch",
    433: "Owner mismatch",
    436: "Low OCR confidence",
    437: "Low OCR confidence",
    439: "Missing mutation information",
    443: "Missing mutation information",
    444: "Owner mismatch",
    446: "Owner mismatch",
    447: "Missing mutation information",
    449: "Area mismatch",
    450: "Missing mutation information",
    457: "Low OCR confidence",
    461: "Owner mismatch",
    462: "Possible duplicate",
    467: "Missing mutation information",
    475: "Owner mismatch",
    482: "Possible duplicate",
    484: "Missing mutation information",
    491: "Owner mismatch",
    492: "Low OCR confidence",
    497: "Possible duplicate"
}

CONFLICT_ISSUES = {"Area mismatch", "Owner mismatch", "Survey number uncertainty"}

def generate_500():
    doc_rows = []
    parcel_rows = []
    features = []

    # Sub-division pattern: 1, 3, 2, 1, 3, 2 every 5 parcels
    sub_div_cycle = ["1", "3", "2"]
    sub_div_idx = 0

    land_classes = ["Agricultural", "Residential", "Commercial", "Government", "Barren Land", "Assigned Land", "Water Body", "Public Utility", "Road"]

    for i in range(1, 501):
        doc_id = f"DOC-{i:05d}"
        parcel_id = f"P{i:04d}"
        survey_num = 100 + i

        # Sub-division
        sub_div = ""
        survey_display = str(survey_num)
        if (i - 1) % 5 == 0 and i > 1:
            sub_div = sub_div_cycle[sub_div_idx % 3]
            survey_display = f"{survey_num}/{sub_div}"
            sub_div_idx += 1
        elif i == 1:
            sub_div = "1"
            survey_display = "101/1"

        # Coordinates
        row_idx = (i - 1) // 25
        col_idx = (i - 1) % 25
        lat = round(14.651 + (row_idx * 0.002), 5)
        lon = round(77.5512 + (col_idx * 0.0024), 5)

        # Base area: decreases slightly per row
        base_area = round(14.2205 - (row_idx * 0.00013), 4)
        area_sqm = round(base_area * 4046.86, 2)

        # Issue
        issue = ISSUES_MAP.get(i, "")
        
        # Ground truth owner vs OCR owner
        gt_owner = f"Synthetic Owner {i:03d}"
        if issue == "Owner mismatch":
            # OCR gets mismatched owner
            mismatched_id = (i + 18) if (i + 18) <= 500 else (i - 18)
            ocr_owner = f"Synthetic Owner {mismatched_id:03d}"
        else:
            ocr_owner = gt_owner

        # Ground truth area vs OCR area
        if issue == "Area mismatch":
            ocr_area = round(base_area * 1.08, 4) # 8% higher discrepancy
        else:
            ocr_area = base_area

        # Confidence
        if issue in CONFLICT_ISSUES or issue == "Low OCR confidence":
            ocr_conf = round(0.42 + (i % 25) * 0.012, 4)
            extraction_status = "Needs Review"
        elif issue != "":
            ocr_conf = round(0.70 + (i % 15) * 0.012, 4)
            extraction_status = "Extracted"
        else:
            ocr_conf = round(0.93 + (i % 7) * 0.009, 4)
            extraction_status = "Extracted"

        # Verification status
        if issue in CONFLICT_ISSUES:
            verif_status = "Conflict"
        elif issue != "":
            verif_status = "Review Required"
        else:
            verif_status = "Verified"

        # Document Extraction Row
        doc_rows.append({
            "document_id": doc_id,
            "parcel_id": parcel_id,
            "ocr_survey_number": survey_display,
            "ocr_owner_name": ocr_owner,
            "ocr_area_acres": ocr_area,
            "ocr_village": "Example Village",
            "ocr_confidence": ocr_conf,
            "extraction_status": extraction_status,
            "validation_issue": issue
        })

        # Parcel Row
        land_class = land_classes[(i * 3) % len(land_classes)]
        khata_no = f"KH{i:05d}"
        mutation_stat = "Updated" if issue != "Missing mutation information" else "Pending"
        reg_stat = "Registered"

        parcel_rows.append({
            "parcel_id": parcel_id,
            "survey_number": str(survey_num),
            "survey_display": survey_display,
            "sub_division": sub_div,
            "khata_number": khata_no,
            "owner_name": gt_owner,
            "co_owner_name": f"Synthetic Owner {i+500}" if i % 10 == 3 else "",
            "village": "Example Village",
            "mandal": "Example Mandal",
            "district": "Anantapur",
            "state": "Andhra Pradesh",
            "land_classification": land_class,
            "ownership_type": "Joint" if i % 10 == 3 else "Individual",
            "area_acres": base_area,
            "area_sq_meters": area_sqm,
            "mutation_status": mutation_stat,
            "registration_status": reg_stat,
            "document_reference": doc_id,
            "confidence_score": ocr_conf,
            "verification_status": verif_status,
            "validation_issue": issue,
            "created_at": "2025-01-01",
            "updated_at": "2025-06-01",
            "centroid_lat": lat,
            "centroid_lon": lon
        })

        # GeoJSON Polygon (~100m x 80m rectangle around centroid)
        d_lat = 0.0008
        d_lon = 0.0010
        poly_coords = [
            [round(lon - d_lon, 5), round(lat - d_lat, 5)],
            [round(lon + d_lon, 5), round(lat - d_lat, 5)],
            [round(lon + d_lon, 5), round(lat + d_lat, 5)],
            [round(lon - d_lon, 5), round(lat + d_lat, 5)],
            [round(lon - d_lon, 5), round(lat - d_lat, 5)],
        ]

        features.append({
            "type": "Feature",
            "id": parcel_id,
            "geometry": {
                "type": "Polygon",
                "coordinates": [poly_coords]
            },
            "properties": {
                "parcel_id": parcel_id,
                "survey_no": survey_display,
                "survey_number": str(survey_num),
                "owner_name": gt_owner,
                "ocr_owner_name": ocr_owner,
                "area_acres": base_area,
                "ocr_area_acres": ocr_area,
                "area_hectares": round(base_area * 0.404686, 3),
                "land_class": land_class,
                "district": "Anantapur",
                "state": "Andhra Pradesh",
                "village": "Example Village",
                "document_id": doc_id,
                "confidence": ocr_conf,
                "verification_status": verif_status,
                "validation_issue": issue,
                "is_disputed": (issue in CONFLICT_ISSUES),
                "color": "#FF4757" if verif_status == "Conflict" else ("#FFB800" if verif_status == "Review Required" else "#00C896")
            }
        })

    # Save document_extractions_500.csv
    doc_path = os.path.join(DATA_DIR, "document_extractions_500.csv")
    with open(doc_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(doc_rows[0].keys()))
        writer.writeheader()
        writer.writerows(doc_rows)
    print(f"✅ Generated: {doc_path} ({len(doc_rows)} rows)")

    # Save parcels_500.csv
    parcel_path = os.path.join(DATA_DIR, "parcels_500.csv")
    with open(parcel_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(parcel_rows[0].keys()))
        writer.writeheader()
        writer.writerows(parcel_rows)
    print(f"✅ Generated: {parcel_path} ({len(parcel_rows)} rows)")

    # Save parcels_500.geojson
    geojson_path = os.path.join(DATA_DIR, "parcels_500.geojson")
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump({
            "type": "FeatureCollection",
            "name": "parcels_500",
            "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
            "features": features
        }, f, indent=2)
    print(f"✅ Generated: {geojson_path} ({len(features)} GeoJSON features)")

if __name__ == "__main__":
    generate_500()

"""
Extracts the exact 500 records from the user transcript message and saves:
- backend/data/document_extractions_500.csv
- backend/data/parcels_500.csv
- backend/data/parcels_500.geojson
"""

import json
import os
import csv

TRANSCRIPT_PATH = "/Users/bhaskarreddy/.gemini/antigravity-ide/brain/7f7731dd-031d-4221-a2f0-50e3fd73d8b9/.system_generated/logs/transcript_full.jsonl"
OUT_DIR = "/Users/bhaskarreddy/Land.AI/backend/data"
os.makedirs(OUT_DIR, exist_ok=True)

def extract_datasets():
    # Find last user input step
    last_user_content = ""
    with open(TRANSCRIPT_PATH, "r", encoding="utf-8") as f:
        for line in f:
            try:
                item = json.loads(line)
                if item.get("type") == "USER_INPUT":
                    content = item.get("content", "")
                    if "DOC-00001,P0001" in content:
                        last_user_content = content
            except Exception:
                pass

    if not last_user_content:
        raise ValueError("Could not find user input containing dataset in transcript")

    # Split document extractions and parcels CSVs
    # document_extractions starts at:
    # document_id,parcel_id,ocr_survey_number...
    # parcels starts at:
    # parcel_id,survey_number,survey_display...

    doc_header = "document_id,parcel_id,ocr_survey_number,ocr_owner_name,ocr_area_acres,ocr_village,ocr_confidence,extraction_status,validation_issue"
    parcel_header = "parcel_id,survey_number,survey_display,sub_division,khata_number,owner_name,co_owner_name,village,mandal,district,state,land_classification,ownership_type,area_acres,area_sq_meters,mutation_status,registration_status,document_reference,confidence_score,verification_status,validation_issue,created_at,updated_at,centroid_lat,centroid_lon"

    doc_start = last_user_content.find(doc_header)
    parcel_start = last_user_content.find(parcel_header)

    if doc_start == -1 or parcel_start == -1:
        raise ValueError(f"Headers not found: doc_start={doc_start}, parcel_start={parcel_start}")

    doc_csv_text = last_user_content[doc_start:parcel_start].strip()
    parcel_csv_text = last_user_content[parcel_start:].strip()

    # Save CSVs
    doc_path = os.path.join(OUT_DIR, "document_extractions_500.csv")
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(doc_csv_text + "\n")
    print(f"Saved: {doc_path} ({len(doc_csv_text.splitlines())} lines)")

    parcel_path = os.path.join(OUT_DIR, "parcels_500.csv")
    with open(parcel_path, "w", encoding="utf-8") as f:
        f.write(parcel_csv_text + "\n")
    print(f"Saved: {parcel_path} ({len(parcel_csv_text.splitlines())} lines)")

    # Build parcels_500.geojson
    features = []
    lines = parcel_csv_text.splitlines()
    reader = csv.DictReader(lines)
    for row in reader:
        try:
            lat = float(row["centroid_lat"])
            lon = float(row["centroid_lon"])
        except Exception:
            continue

        # Synthesize polygon boundary around centroid (+/- 0.001 deg ~ 100m)
        d_lat = 0.0009
        d_lon = 0.0011
        poly_coords = [
            [round(lon - d_lon, 5), round(lat - d_lat, 5)],
            [round(lon + d_lon, 5), round(lat - d_lat, 5)],
            [round(lon + d_lon, 5), round(lat + d_lat, 5)],
            [round(lon - d_lon, 5), round(lat + d_lat, 5)],
            [round(lon - d_lon, 5), round(lat - d_lat, 5)],
        ]

        props = dict(row)
        features.append({
            "type": "Feature",
            "id": row["parcel_id"],
            "geometry": {
                "type": "Polygon",
                "coordinates": [poly_coords]
            },
            "properties": props
        })

    geojson_obj = {
        "type": "FeatureCollection",
        "name": "parcels_500",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }

    geojson_path = os.path.join(OUT_DIR, "parcels_500.geojson")
    with open(geojson_path, "w", encoding="utf-8") as f:
        json.dump(geojson_obj, f, indent=2)
    print(f"Saved: {geojson_path} ({len(features)} features)")

if __name__ == "__main__":
    extract_datasets()

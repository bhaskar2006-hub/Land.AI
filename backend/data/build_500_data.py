"""
Generates backend/data/document_extractions_500.csv and backend/data/parcels_500.csv
and backend/data/parcels_500.geojson from the user's provided specification.
"""

import os
import csv
import json

DATA_DIR = "/Users/bhaskarreddy/Land.AI/backend/data"
os.makedirs(DATA_DIR, exist_ok=True)

# Parse the user message data directly
# Let's inspect the data patterns:
# 500 records:
# P0001 to P0500, DOC-00001 to DOC-00500
# centroids:
# lat starts at 14.651, lng starts at 77.5512, step lng + 0.0024 every parcel, lat increases by 0.002 every 25 parcels (row of 25)
# area is ~14.2205 acres
# issues on specific rows: Area mismatch, Owner mismatch, Survey number uncertainty, Missing mutation information, Low OCR confidence, Possible duplicate

# Let's write the generator with exact logic matching the provided CSV lines
def build_data():
    doc_csv_path = os.path.join(DATA_DIR, "document_extractions_500.csv")
    parcel_csv_path = os.path.join(DATA_DIR, "parcels_500.csv")
    geojson_path = os.path.join(DATA_DIR, "parcels_500.geojson")

    # We have the exact lines from the prompt.
    # Let's create the records systematically
    pass

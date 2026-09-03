import json
import uuid
import os
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session

from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.geography import MasterState, MasterDistrict, MasterTehsil, MasterVillage
from backend.app.models.document import Document
from backend.app.models.extraction import ExtractedField
from backend.app.models.validation import ValidationResult
from backend.app.models.verification import VerificationTask
from backend.app.models.land_record import LandRecord
from backend.app.models.gis import Parcel
from backend.app.models.audit import AuditLog

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).count() > 0:
        return

    print("🌱 Seeding ILRDVS master database with geography, users, records, and parcels...")

    # 1. Master Geography
    states = [
        MasterState(state_code="KA", state_name="Karnataka", state_name_local="ಕರ್ನಾಟಕ", language_code="kn"),
        MasterState(state_code="MH", state_name="Maharashtra", state_name_local="महाराष्ट्र", language_code="mr"),
        MasterState(state_code="TN", state_name="Tamil Nadu", state_name_local="தமிழ்நாடு", language_code="ta"),
        MasterState(state_code="UP", state_name="Uttar Pradesh", state_name_local="उत्तर प्रदेश", language_code="hi"),
        MasterState(state_code="AP", state_name="Andhra Pradesh", state_name_local="ఆంధ్రప్రదేశ్", language_code="te"),
        MasterState(state_code="RJ", state_name="Rajasthan", state_name_local="राजस्थान", language_code="hi"),
    ]
    for s in states:
        db.merge(s)
    db.commit()

    districts = [
        MasterDistrict(district_code="NILGIRIS", district_name="Nilgiris", state_code="TN", district_name_local="நீலகிரி"),
        MasterDistrict(district_code="NASHIK", district_name="Nashik", state_code="MH", district_name_local="नाशिक"),
        MasterDistrict(district_code="MYSURU", district_name="Mysuru", state_code="KA", district_name_local="ಮೈಸೂರು"),
        MasterDistrict(district_code="VARANASI", district_name="Varanasi", state_code="UP", district_name_local="वाराणसी"),
        MasterDistrict(district_code="GUNTUR", district_name="Guntur", state_code="AP", district_name_local="గుంటూరు"),
    ]
    for d in districts:
        db.merge(d)
    db.commit()

    tehsils = [
        MasterTehsil(tehsil_code="KOTAGIRI", tehsil_name="Kotagiri", district_code="NILGIRIS", tehsil_name_local="கோத்தகிரி"),
        MasterTehsil(tehsil_code="OOTY", tehsil_name="Udhagamandalam", district_code="NILGIRIS", tehsil_name_local="உதகமண்டலம்"),
        MasterTehsil(tehsil_code="NIPHAD", tehsil_name="Niphad", district_code="NASHIK", tehsil_name_local="निफाड"),
        MasterTehsil(tehsil_code="PINDRA", tehsil_name="Pindra", district_code="VARANASI", tehsil_name_local="पिंडरा"),
    ]
    for t in tehsils:
        db.merge(t)
    db.commit()

    villages = [
        MasterVillage(village_code="VIL_KOTAGIRI", village_name="Kotagiri Town", tehsil_code="KOTAGIRI", village_name_local="கோத்தகிரி நகரம்", pin_code="643217"),
        MasterVillage(village_code="VIL_KODANAD", village_name="Kodanad", tehsil_code="KOTAGIRI", village_name_local="கோடநாடு", pin_code="643217"),
        MasterVillage(village_code="VIL_PIMPALGAON", village_name="Pimpalgaon Baswant", tehsil_code="NIPHAD", village_name_local="पिंपळगाव बसवंत", pin_code="422209"),
        MasterVillage(village_code="VIL_BABATPUR", village_name="Babatpur", tehsil_code="PINDRA", village_name_local="बाबतपुर", pin_code="221006"),
    ]
    for v in villages:
        db.merge(v)
    db.commit()

    # 2. Users
    users = [
        User(
            user_id=str(uuid.uuid4()),
            username="admin",
            email="admin@ilrdvs.gov.in",
            full_name="National System Administrator",
            hashed_password=get_password_hash("admin123"),
            role="SUPER_ADMIN",
            district_code="NILGIRIS"
        ),
        User(
            user_id=str(uuid.uuid4()),
            username="officer_nilgiris",
            email="officer.nilgiris@ilrdvs.gov.in",
            full_name="District Revenue Officer — Nilgiris",
            hashed_password=get_password_hash("officer123"),
            role="DISTRICT_OFFICER",
            district_code="NILGIRIS"
        ),
        User(
            user_id=str(uuid.uuid4()),
            username="verifier1",
            email="verifier.anita@ilrdvs.gov.in",
            full_name="Anita Sharma (Senior Verifier)",
            hashed_password=get_password_hash("verify123"),
            role="VERIFIER",
            district_code="NILGIRIS"
        ),
        User(
            user_id=str(uuid.uuid4()),
            username="operator1",
            email="operator.rajesh@ilrdvs.gov.in",
            full_name="Rajesh Verma (Data Entry Operator)",
            hashed_password=get_password_hash("op123"),
            role="DATA_ENTRY_OPERATOR",
            district_code="NILGIRIS"
        )
    ]
    for u in users:
        db.add(u)
    db.commit()

    verifier_user = users[2]

    # Create dummy storage file
    os.makedirs("./storage/uploads", exist_ok=True)
    sample_scan_file = "./storage/uploads/sample_patta_ka_00453.txt"
    with open(sample_scan_file, "w") as f:
        f.write("GOVERNMENT OF TAMIL NADU / KARNATAKA REVENUE DEPARTMENT RECORD SCAN")

    # 3. Sample Documents
    doc1 = Document(
        doc_id="ka-2024-00453",
        file_name="Patta_ROR_Nilgiris_123_4A.pdf",
        file_path=sample_scan_file,
        file_size_bytes=2458000,
        mime_type="application/pdf",
        file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        document_type="ROR_PATTA",
        language="ta",
        status="NEEDS_REVIEW",
        overall_confidence=0.74,
        state_code="TN",
        district_code="NILGIRIS"
    )

    doc2 = Document(
        doc_id="mh-2024-01089",
        file_name="7_12_Extract_Nashik_142_2A.pdf",
        file_path=sample_scan_file,
        file_size_bytes=1840000,
        mime_type="application/pdf",
        file_hash="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
        document_type="7_12_EXTRACT",
        language="mr",
        status="VALIDATED",
        overall_confidence=0.96,
        state_code="MH",
        district_code="NASHIK"
    )

    db.add(doc1)
    db.add(doc2)
    db.commit()

    # 4. Extracted Fields for Doc 1
    doc1_fields = [
        ExtractedField(doc_id=doc1.doc_id, field_type="OWNER_NAME", raw_value="Ramesh Kumar", normalized_value="Ramesh Kumar", confidence=0.58, bounding_box=json.dumps({"x": 0.35, "y": 0.42, "width": 0.45, "height": 0.04, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="SURVEY_NO", raw_value="123/4A", normalized_value="123/4A", confidence=0.98, bounding_box=json.dumps({"x": 0.35, "y": 0.38, "width": 0.20, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="KHASRA_NO", raw_value="456-B", normalized_value="456-B", confidence=0.72, bounding_box=json.dumps({"x": 0.58, "y": 0.38, "width": 0.18, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="KHATA_NO", raw_value="Khata-908", normalized_value="Khata-908", confidence=0.91, bounding_box=json.dumps({"x": 0.35, "y": 0.34, "width": 0.25, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="PLOT_AREA", raw_value="2.5 Acres", normalized_value="2.5 Acres", confidence=0.94, bounding_box=json.dumps({"x": 0.35, "y": 0.46, "width": 0.30, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="VILLAGE", raw_value="Kotagiri", normalized_value="Kotagiri", confidence=0.95, bounding_box=json.dumps({"x": 0.55, "y": 0.30, "width": 0.25, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="TEHSIL", raw_value="Udhagamandalam (Ooty)", normalized_value="Udhagamandalam", confidence=0.92, bounding_box=json.dumps({"x": 0.35, "y": 0.30, "width": 0.20, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="DISTRICT", raw_value="Nilgiris", normalized_value="Nilgiris", confidence=0.99, bounding_box=json.dumps({"x": 0.55, "y": 0.26, "width": 0.25, "height": 0.03, "page": 1})),
        ExtractedField(doc_id=doc1.doc_id, field_type="LAND_CLASS", raw_value="Plantation (Tea)", normalized_value="Plantation", confidence=0.48, bounding_box=json.dumps({"x": 0.35, "y": 0.50, "width": 0.40, "height": 0.03, "page": 1})),
    ]
    for ef in doc1_fields:
        db.add(ef)
    db.commit()

    # 5. Verification Task for Doc 1
    task1 = VerificationTask(
        task_id="task-001-ka-00453",
        doc_id=doc1.doc_id,
        assigned_to=verifier_user.user_id,
        status="PENDING",
        priority=1,
        notes="Low confidence on Owner Name and Land Class fields (< 0.60)"
    )
    db.add(task1)

    # 6. Validated Land Record for Doc 2
    rec2 = LandRecord(
        record_id=str(uuid.uuid4()),
        doc_id=doc2.doc_id,
        survey_no="142/2A",
        khasra_no="452",
        khata_no="K-889",
        owner_name="Tukaram Ganpat Patil",
        owner_name_local="तुकाराम गणपत पाटील",
        plot_area_sqm=18210.87,
        plot_area_raw="4.50 Hectares",
        land_class="Agricultural (Jirayat)",
        state_code="MH",
        district_code="NASHIK",
        village_code="VIL_PIMPALGAON",
        mutation_no="M-4412/2024",
        registration_date=date(2024, 2, 14),
        is_disputed=False
    )
    db.add(rec2)
    db.commit()

    # 7. Cadastral GIS Parcels with GeoJSON geometries (Coordinates around Nilgiris Kotagiri ~ 11.42N, 76.86E)
    parcels_data = [
        {
            "survey_no": "123/4A",
            "district_code": "NILGIRIS",
            "village_code": "VIL_KOTAGIRI",
            "area_hectares": 1.01,
            "centroid_lat": 11.4225,
            "centroid_lng": 76.8640,
            "coords": [[[76.8620, 11.4210], [76.8660, 11.4215], [76.8655, 11.4245], [76.8615, 11.4238], [76.8620, 11.4210]]]
        },
        {
            "survey_no": "123/4B",
            "district_code": "NILGIRIS",
            "village_code": "VIL_KOTAGIRI",
            "area_hectares": 0.85,
            "centroid_lat": 11.4248,
            "centroid_lng": 76.8675,
            "coords": [[[76.8660, 11.4215], [76.8700, 11.4220], [76.8695, 11.4260], [76.8655, 11.4245], [76.8660, 11.4215]]]
        },
        {
            "survey_no": "124/1",
            "district_code": "NILGIRIS",
            "village_code": "VIL_KOTAGIRI",
            "area_hectares": 1.45,
            "centroid_lat": 11.4200,
            "centroid_lng": 76.8645,
            "coords": [[[76.8625, 11.4175], [76.8670, 11.4180], [76.8660, 11.4215], [76.8620, 11.4210], [76.8625, 11.4175]]]
        },
        {
            "survey_no": "142/2A",
            "district_code": "NASHIK",
            "village_code": "VIL_PIMPALGAON",
            "area_hectares": 4.50,
            "centroid_lat": 20.1650,
            "centroid_lng": 73.9850,
            "coords": [[[73.9820, 20.1620], [73.9880, 20.1630], [73.9875, 20.1680], [73.9815, 20.1670], [73.9820, 20.1620]]]
        }
    ]

    for p in parcels_data:
        geom = {
            "type": "Polygon",
            "coordinates": p["coords"]
        }
        props = {
            "survey_no": p["survey_no"],
            "area_hectares": p["area_hectares"]
        }
        parcel = Parcel(
            survey_no=p["survey_no"],
            district_code=p["district_code"],
            village_code=p["village_code"],
            area_hectares=p["area_hectares"],
            centroid_lat=p["centroid_lat"],
            centroid_lng=p["centroid_lng"],
            geojson_geometry=json.dumps(geom),
            geojson_properties=json.dumps(props)
        )
        db.add(parcel)
    db.commit()

    # 8. Audit logs
    audit_service_log = AuditLog(
        action="SYSTEM_INIT",
        entity_type="SYSTEM",
        entity_id="ilrdvs-core",
        user_name="System",
        new_value=json.dumps({"message": "Master geography, users, sample records and parcels initialized successfully"})
    )
    db.add(audit_service_log)
    db.commit()

    print("✅ Database seeding complete!")

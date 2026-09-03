# ILRDVS Backend Services

The **Intelligent Land Record Digitization & Validation System (ILRDVS)** backend is built on **FastAPI (Python 3.11+)**, **SQLAlchemy 2.0**, and **Pydantic v2**. It handles document ingestion, multilingual OCR, entity extraction, business validation, human-in-the-loop verification, cadastral GIS mapping, and audit logging.

---

## 🛠️ Architecture & Core Modules

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entrypoint & lifespan events
│   ├── core/
│   │   ├── config.py               # Application settings (DB, JWT, MinIO, OCR thresholds)
│   │   ├── database.py             # SQLAlchemy Session & Engine setup
│   │   └── security.py             # JWT token handling & Role-Based Access Control (RBAC)
│   ├── models/                     # SQLAlchemy Declarative Models
│   │   ├── user.py                 # Users & RBAC roles
│   │   ├── geography.py            # Master States, Districts, Tehsils, Villages
│   │   ├── document.py             # Ingested Land Record documents
│   │   ├── extraction.py           # Extracted OCR/NER fields & Bounding Boxes
│   │   ├── validation.py           # Business rule checks & validation outcomes
│   │   ├── verification.py         # Human-in-the-Loop review queue & tasks
│   │   ├── land_record.py          # Final validated land record entities
│   │   ├── gis.py                  # Cadastral Parcels & GeoJSON boundary polygons
│   │   └── audit.py                # Legally sensitive audit trail entries
│   ├── schemas/                    # Pydantic Request/Response models
│   ├── services/                   # Business Logic & AI Engines
│   │   ├── storage_service.py      # Secure document store (Local / MinIO S3)
│   │   ├── image_preprocessor.py   # PIL/OpenCV deskewing, binarization, contrast
│   │   ├── ocr_engine.py           # Indic OCR (Hindi, Telugu, Tamil, Marathi, Kannada)
│   │   ├── extraction_service.py   # NLP/NER extraction & confidence scoring
│   │   ├── validation_service.py   # Revenue validation rules (Survey regex, area sanity)
│   │   ├── verification_service.py # Verifier task queue & correction processor
│   │   ├── gis_service.py          # Cadastral polygon matching & GeoJSON output
│   │   ├── analytics_service.py    # Dashboard KPI metrics & accuracy trends
│   │   └── audit_service.py        # Centralized audit logger
│   └── api/v1/                     # REST API Endpoints
│       ├── endpoints/
│       │   ├── auth.py             # Authentication & User Management
│       │   ├── documents.py        # Upload & Document Management
│       │   ├── extraction.py       # Trigger OCR & NER Extraction
│       │   ├── validation.py       # Run Business Rule Validations
│       │   ├── verification.py     # Verification Queue & HITL Approvals
│       │   ├── land_records.py     # Final Validated Land Record Search
│       │   ├── gis.py              # Cadastral GeoJSON layers & Parcel search
│       │   ├── analytics.py        # Dashboard KPIs & Charts
│       │   └── audit.py            # Security & Audit Logs
│       └── router.py               # Aggregated v1 API Router
└── tests/
    └── test_api.py                 # Pytest Automated Test Suite
```

---

## 🚀 Quickstart

### 1. Launch Backend Server
```bash
./run_backend.sh
```
Server runs on: **http://127.0.0.1:8000**  
Interactive API Docs (Swagger): **http://127.0.0.1:8000/docs**  
Alternative API Docs (ReDoc): **http://127.0.0.1:8000/redoc**

### 2. Run Automated Test Suite
```bash
PYTHONPATH=. ./backend/.venv/bin/pytest backend/tests -v
```

---

## 👥 Default Demo Credentials

| Role | Username | Password | Access Level |
|---|---|---|---|
| `SUPER_ADMIN` | `admin` | `admin123` | Full system access, audit logs, user management |
| `DISTRICT_OFFICER` | `officer_nilgiris` | `officer123` | District analytics, verification supervision |
| `VERIFIER` | `verifier1` | `verify123` | Document verification queue, field correction |
| `DATA_ENTRY_OPERATOR` | `operator1` | `op123` | Document upload and batch ingestion |

---

## 🐳 Docker Deployment

To launch the full production stack with PostgreSQL 15 + PostGIS, Redis 7, MinIO S3, and Nginx Gateway:
```bash
cd infra
docker-compose up -d
```

# ILRDVS — Intelligent Land Record Digitization & Validation System

> **Next-Generation AI Platform for Indian Land Records Modernization (DILRMP)**  
> Comprehensive end-to-end digitization, Indic multilingual OCR/HTR, PostGIS cross-verification, and Human-in-the-Loop (HITL) audit workbench for revenue records across Indian states.

---

## 🌟 Key Capabilities

1. **Multilingual Indic OCR & HTR Engine**:
   - Automated preprocessing (Adaptive Otsu thresholding, skew correction, tear/crease suppression).
   - Layout & tabular grid segmentation (printed headers vs handwritten marginalia, endorsement seals).
   - Script recognition for Devanagari, Telugu, Tamil, Kannada, Urdu/Modi cursive script.
   - Unified Land Entity Schema mapping vernacular attributes (Khata, Survey/Gat/Dag, Guntha/Bigha/Cents).

2. **Authoritative GIS & Cadastral Cross-Verification**:
   - **Telangana LandGrid (Burgul Village — 613 Surveys)** authentic cadastral map viewer with centroid survey number labeling, north arrow compass rose, and official revenue naksha framing.
   - **500-Parcel Benchmark Dataset (Anantapur, AP)** with PostGIS polygon boundary validation.
   - Mathematical area tolerance validation (flags $>1\%$ deviation between deed text and cadastral polygon geometry).
   - Owner/title discrepancy detection and encroachment heatmaps with translucent, high-visibility overlay.

3. **HITL (Human-in-the-Loop) Verification Workbench**:
   - Side-by-side interactive document inspection with dynamic SVG bounding boxes.
   - State-specific official revenue templates (Maharashtra 7/12 Satbara, Telangana Dharani ROR-1B, Tamil Nadu Patta, Karnataka Bhoomi RTC, Rajasthan Jamabandi).
   - Instant field correction, confidence scores, and real-time audit logging.

4. **Statutory Ledgers & Export Suite**:
   - Automated generation of Form 7/12, Patta ROR, and Land Ledger registers.
   - Direct PDF / print export with official revenue disclaimers.

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3001` in your browser.

---

## 🧪 Testing

Run backend test suites:
```bash
pytest backend/tests/
```
All 23 core tests covering ML pipelines, GIS cross-verification, enterprise features, and REST APIs pass.

---

## 📜 License
Developed for the National Land Records Modernization Programme (DILRMP) initiatives.

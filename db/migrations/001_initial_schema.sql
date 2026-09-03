-- Intelligent Land Record Digitization & Validation System (ILRDVS)
-- Migration 001: Initial Schema (PostgreSQL 15 + PostGIS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Master Geography Tables
CREATE TABLE IF NOT EXISTS master_states (
    state_code VARCHAR(10) PRIMARY KEY,
    state_name VARCHAR(100) NOT NULL,
    state_name_local VARCHAR(150),
    language_code VARCHAR(10) DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS master_districts (
    district_code VARCHAR(20) PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL,
    state_code VARCHAR(10) REFERENCES master_states(state_code) ON DELETE CASCADE,
    district_name_local VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS master_tehsils (
    tehsil_code VARCHAR(30) PRIMARY KEY,
    tehsil_name VARCHAR(100) NOT NULL,
    district_code VARCHAR(20) REFERENCES master_districts(district_code) ON DELETE CASCADE,
    tehsil_name_local VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS master_villages (
    village_code VARCHAR(40) PRIMARY KEY,
    village_name VARCHAR(100) NOT NULL,
    tehsil_code VARCHAR(30) REFERENCES master_tehsils(tehsil_code) ON DELETE CASCADE,
    village_name_local VARCHAR(150),
    pin_code VARCHAR(10)
);

-- 2. Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'VERIFIER',
    district_code VARCHAR(20) REFERENCES master_districts(district_code),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Documents Ingestion Table
CREATE TABLE IF NOT EXISTS documents (
    doc_id VARCHAR(36) PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    document_type VARCHAR(50) DEFAULT '7_12_EXTRACT',
    language VARCHAR(20) DEFAULT 'hi',
    status VARCHAR(30) DEFAULT 'PENDING',
    overall_confidence FLOAT DEFAULT 0.0,
    page_count INT DEFAULT 1,
    uploaded_by VARCHAR(36) REFERENCES users(user_id),
    state_code VARCHAR(10) REFERENCES master_states(state_code),
    district_code VARCHAR(20) REFERENCES master_districts(district_code),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_docs_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_docs_district ON documents(district_code);

-- 4. Extracted Fields from AI/ML Pipeline
CREATE TABLE IF NOT EXISTS extracted_fields (
    field_id VARCHAR(36) PRIMARY KEY,
    doc_id VARCHAR(36) REFERENCES documents(doc_id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL,
    raw_value TEXT,
    normalized_value TEXT,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    bounding_box TEXT, -- JSON string
    status VARCHAR(30) DEFAULT 'AUTO_EXTRACTED',
    corrected_value TEXT,
    corrected_by VARCHAR(36) REFERENCES users(user_id),
    corrected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_extracted_fields_doc ON extracted_fields(doc_id);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_type ON extracted_fields(field_type);

-- 5. Validation Results & Rules
CREATE TABLE IF NOT EXISTS validation_results (
    val_id VARCHAR(36) PRIMARY KEY,
    doc_id VARCHAR(36) REFERENCES documents(doc_id) ON DELETE CASCADE,
    field_id VARCHAR(36) REFERENCES extracted_fields(field_id) ON DELETE SET NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_severity VARCHAR(20) DEFAULT 'CRITICAL',
    result VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    rule_metadata TEXT, -- JSON string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_validation_doc ON validation_results(doc_id);

-- 6. Human-in-the-loop Verification Tasks
CREATE TABLE IF NOT EXISTS verification_tasks (
    task_id VARCHAR(36) PRIMARY KEY,
    doc_id VARCHAR(36) REFERENCES documents(doc_id) ON DELETE CASCADE,
    assigned_to VARCHAR(36) REFERENCES users(user_id),
    status VARCHAR(30) DEFAULT 'PENDING',
    priority INT DEFAULT 2,
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verify_status ON verification_tasks(status);
CREATE INDEX IF NOT EXISTS idx_verify_assigned ON verification_tasks(assigned_to);

-- 7. Finalized Structured Land Records
CREATE TABLE IF NOT EXISTS land_records (
    record_id VARCHAR(36) PRIMARY KEY,
    doc_id VARCHAR(36) REFERENCES documents(doc_id) ON DELETE SET NULL,
    survey_no VARCHAR(100) NOT NULL,
    khasra_no VARCHAR(100),
    khata_no VARCHAR(100),
    owner_name VARCHAR(255) NOT NULL,
    owner_name_local VARCHAR(255),
    plot_area_sqm NUMERIC(14, 4) NOT NULL,
    plot_area_raw VARCHAR(50),
    land_class VARCHAR(100) DEFAULT 'Agricultural',
    state_code VARCHAR(10) REFERENCES master_states(state_code),
    district_code VARCHAR(20) REFERENCES master_districts(district_code),
    tehsil_code VARCHAR(30) REFERENCES master_tehsils(tehsil_code),
    village_code VARCHAR(40) REFERENCES master_villages(village_code),
    mutation_no VARCHAR(100),
    registration_date DATE,
    is_disputed BOOLEAN DEFAULT FALSE,
    external_lrms_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_land_records_survey ON land_records(survey_no);
CREATE INDEX IF NOT EXISTS idx_land_records_owner ON land_records(owner_name);
CREATE INDEX IF NOT EXISTS idx_land_records_village ON land_records(village_code);

-- 8. PostGIS Parcels & Spatial Boundaries
CREATE TABLE IF NOT EXISTS parcels (
    parcel_id VARCHAR(36) PRIMARY KEY,
    record_id VARCHAR(36) REFERENCES land_records(record_id) ON DELETE SET NULL,
    survey_no VARCHAR(100) NOT NULL,
    district_code VARCHAR(20) REFERENCES master_districts(district_code),
    village_code VARCHAR(40) REFERENCES master_villages(village_code),
    area_hectares NUMERIC(10, 4),
    centroid_lat NUMERIC(9, 6),
    centroid_lng NUMERIC(9, 6),
    geojson_geometry TEXT NOT NULL,
    geojson_properties TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcels_survey ON parcels(survey_no);

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(user_id) ON DELETE SET NULL,
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

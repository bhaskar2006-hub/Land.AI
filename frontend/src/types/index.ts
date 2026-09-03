export interface Document {
  doc_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  file_hash: string;
  document_type: string;
  language: string;
  status: 'PENDING' | 'PROCESSING' | 'EXTRACTED' | 'NEEDS_REVIEW' | 'VALIDATED' | 'REJECTED' | 'FAILED';
  overall_confidence: number;
  page_count: number;
  uploaded_by?: string;
  state_code?: string;
  district_code?: string;
  created_at: string;
  updated_at: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface ExtractedField {
  field_id: string;
  doc_id: string;
  field_type: string;
  raw_value?: string;
  normalized_value?: string;
  confidence: number;
  bounding_box?: string;
  status: 'AUTO_EXTRACTED' | 'CONFIRMED' | 'MANUALLY_CORRECTED' | 'REJECTED';
  corrected_value?: string;
  corrected_by?: string;
  corrected_at?: string;
  created_at: string;
}

export interface ValidationResult {
  val_id: string;
  doc_id: string;
  field_id?: string;
  rule_name: string;
  rule_severity: 'CRITICAL' | 'WARNING' | 'INFO';
  result: 'VALID' | 'INVALID' | 'NEEDS_REVIEW' | 'SKIPPED';
  message: string;
  rule_metadata?: string;
  created_at: string;
}

export interface VerificationTask {
  task_id: string;
  doc_id: string;
  assigned_to?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'ESCALATED';
  priority: number;
  notes?: string;
  assigned_at?: string;
  submitted_at?: string;
  created_at: string;
  document?: Document;
}

export interface LandRecord {
  record_id: string;
  doc_id?: string;
  survey_no: string;
  khasra_no?: string;
  khata_no?: string;
  owner_name: string;
  owner_name_local?: string;
  plot_area_sqm: number;
  plot_area_raw?: string;
  land_class: string;
  state_code?: string;
  district_code?: string;
  tehsil_code?: string;
  village_code?: string;
  mutation_no?: string;
  registration_date?: string;
  is_disputed: boolean;
  external_lrms_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Parcel {
  parcel_id: string;
  record_id?: string;
  survey_no: string;
  district_code?: string;
  village_code?: string;
  area_hectares?: number;
  centroid_lat?: number;
  centroid_lng?: number;
  geojson_geometry: string;
  geojson_properties?: string;
  created_at: string;
}

export interface GeoJSONFeature {
  type: string;
  id?: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: {
    parcel_id?: string;
    survey_no: string;
    area_hectares?: number;
    owner_name?: string;
    land_class?: string;
    status?: string;
    plot_area_raw?: string;
    is_disputed?: boolean;
    [key: string]: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface DashboardStats {
  kpis: {
    total_documents: number;
    validated_documents: number;
    review_queue: number;
    error_documents: number;
    processing_documents: number;
    overall_accuracy_pct: number;
    avg_processing_time_sec: number;
    total_parcels_mapped: number;
  };
  state_metrics: Array<{
    state_code: string;
    state_name: string;
    total_docs: number;
    validated: number;
    in_review: number;
    errors: number;
    completion_rate_pct: number;
  }>;
  accuracy_trends: Array<{
    date: string;
    printed_accuracy: number;
    handwritten_accuracy: number;
    overall_accuracy: number;
    count: number;
  }>;
  language_metrics: Array<{
    language_code: string;
    language_name: string;
    total_docs: number;
    avg_confidence: number;
  }>;
}

export interface AuditLog {
  log_id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

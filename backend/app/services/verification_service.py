import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException

from backend.app.models.document import Document
from backend.app.models.extraction import ExtractedField
from backend.app.models.verification import VerificationTask
from backend.app.models.land_record import LandRecord
from backend.app.schemas.extraction import ExtractedFieldCorrection
from backend.app.ml.active_learning import active_learning_pipeline

class VerificationService:
    """
    Human-in-the-Loop Verification Workflow:
    - Verifier task assignment
    - Field correction & status updates
    - Generating finalized LandRecord on Approval
    - Active Learning training corpus logging
    """
    def __init__(self):
        pass

    def assign_task(self, db: Session, task_id: str, user_id: str) -> VerificationTask:
        task = db.query(VerificationTask).filter(VerificationTask.task_id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Verification task not found")

        task.assigned_to = user_id
        task.status = "IN_PROGRESS"
        task.assigned_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(task)
        return task

    def submit_verification(
        self,
        db: Session,
        doc_id: str,
        user_id: Optional[str],
        action: str, # "APPROVE", "REJECT", "SAVE_DRAFT"
        corrections: List[ExtractedFieldCorrection] = [],
        notes: Optional[str] = None
    ) -> Document:
        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # Apply corrections to extracted fields & feed into Active Learning corpus
        for corr in corrections:
            field = db.query(ExtractedField).filter(
                ExtractedField.field_id == corr.field_id,
                ExtractedField.doc_id == doc_id
            ).first()
            if field:
                raw_orig = field.raw_value or field.normalized_value or ""
                field.corrected_value = corr.corrected_value
                field.normalized_value = corr.corrected_value
                field.status = "MANUALLY_CORRECTED"
                field.corrected_by = user_id
                field.corrected_at = datetime.now(timezone.utc)
                field.confidence = 1.0

                # Log to Active Learning feedback loop
                active_learning_pipeline.log_correction_sample(
                    doc_id=doc_id,
                    field_type=field.field_type,
                    raw_ocr_value=raw_orig,
                    verified_value=corr.corrected_value,
                    initial_confidence=field.confidence,
                    language=doc.language,
                    verifier_id=user_id
                )

        # Update verification task
        task = db.query(VerificationTask).filter(VerificationTask.doc_id == doc_id).first()
        if task:
            if action == "APPROVE":
                task.status = "COMPLETED"
                task.submitted_at = datetime.now(timezone.utc)
                if notes:
                    task.notes = notes
            elif action == "REJECT":
                task.status = "REJECTED"
                task.submitted_at = datetime.now(timezone.utc)
                if notes:
                    task.notes = notes
            elif action == "SAVE_DRAFT":
                task.status = "IN_PROGRESS"

        if action == "APPROVE":
            doc.status = "VALIDATED"
            doc.overall_confidence = 1.0

            # Create or update finalized LandRecord
            fields = db.query(ExtractedField).filter(ExtractedField.doc_id == doc_id).all()
            field_map = {f.field_type: (f.corrected_value or f.normalized_value or f.raw_value or "") for f in fields}

            # Parse plot area
            raw_area = field_map.get("PLOT_AREA", "1.0 Acre")
            num_match = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", raw_area)
            num_val = float(num_match[0]) if num_match else 1.0
            sqm = num_val * 4046.86 if "Acre" in raw_area else (num_val * 10000.0 if "Hectare" in raw_area else num_val * 2529.0)

            existing_record = db.query(LandRecord).filter(LandRecord.doc_id == doc_id).first()
            if not existing_record:
                land_rec = LandRecord(
                    doc_id=doc_id,
                    survey_no=field_map.get("SURVEY_NO", "N/A"),
                    khasra_no=field_map.get("KHASRA_NO"),
                    khata_no=field_map.get("KHATA_NO"),
                    owner_name=field_map.get("OWNER_NAME", "Titleholder"),
                    plot_area_sqm=sqm,
                    plot_area_raw=raw_area,
                    land_class=field_map.get("LAND_CLASS", "Agricultural"),
                    mutation_no=field_map.get("MUTATION_NO"),
                    is_disputed=False
                )
                db.add(land_rec)
            else:
                existing_record.survey_no = field_map.get("SURVEY_NO", existing_record.survey_no)
                existing_record.owner_name = field_map.get("OWNER_NAME", existing_record.owner_name)
                existing_record.plot_area_sqm = sqm
                existing_record.plot_area_raw = raw_area
                existing_record.land_class = field_map.get("LAND_CLASS", existing_record.land_class)

        elif action == "REJECT":
            doc.status = "REJECTED"

        db.commit()
        db.refresh(doc)
        return doc

verification_service = VerificationService()

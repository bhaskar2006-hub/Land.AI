from typing import Dict, Any, List

class ConfidenceScorer:
    """
    Multi-Signal Confidence Scoring Engine:
    Combines:
    1. OCR Character Recognition Probability (w1 = 0.40)
    2. NER Softmax / Token Context Alignment (w2 = 0.40)
    3. Revenue Grammar & Regex Validity (w3 = 0.20)
    """

    HIGH_THRESHOLD = 0.75
    MEDIUM_THRESHOLD = 0.60

    def compute_field_confidence(
        self,
        raw_val: str,
        normalized_val: str,
        ocr_confidence: float = 0.90,
        ner_confidence: float = 0.88,
        pattern_match: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates composite confidence score and visual category badge.
        """
        w1, w2, w3 = 0.40, 0.40, 0.20
        pattern_score = 1.0 if pattern_match else 0.50

        # Adjust for field-specific quality heuristics
        length_penalty = 0.0
        if not raw_val or len(raw_val.strip()) == 0:
            return {
                "score": 0.0,
                "tier": "LOW",
                "badge": "🔴 Low Confidence",
                "needs_review": True
            }
        elif len(raw_val.strip()) < 2:
            length_penalty = 0.15

        composite_score = (w1 * ocr_confidence) + (w2 * ner_confidence) + (w3 * pattern_score) - length_penalty
        score = max(0.0, min(1.0, round(composite_score, 3)))

        if score >= self.HIGH_THRESHOLD:
            tier = "HIGH"
            badge = "🟢 High Confidence"
            needs_review = False
        elif score >= self.MEDIUM_THRESHOLD:
            tier = "MEDIUM"
            badge = "🟡 Medium Confidence"
            needs_review = True
        else:
            tier = "LOW"
            badge = "🔴 Low Confidence"
            needs_review = True

        return {
            "score": score,
            "tier": tier,
            "badge": badge,
            "needs_review": needs_review
        }

    def evaluate_document_confidence(self, field_scores: List[float]) -> Dict[str, Any]:
        """
        Evaluates document-level extraction quality.
        """
        if not field_scores:
            return {"overall_confidence": 0.0, "status": "FAILED", "flagged_fields_count": 0}

        avg_conf = round(sum(field_scores) / len(field_scores), 3)
        flagged_count = sum(1 for s in field_scores if s < self.HIGH_THRESHOLD)

        if avg_conf < self.HIGH_THRESHOLD or flagged_count > 0:
            status = "NEEDS_REVIEW"
        else:
            status = "EXTRACTED"

        return {
            "overall_confidence": avg_conf,
            "status": status,
            "flagged_fields_count": flagged_count
        }

confidence_scorer = ConfidenceScorer()

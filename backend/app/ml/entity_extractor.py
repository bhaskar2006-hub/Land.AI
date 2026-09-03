import re
from typing import Dict, Any, List, Optional
from backend.app.ml.script_normalizer import script_normalizer

class LandRecordEntityExtractor:
    """
    Domain-Specific Revenue NER & Attribute Extractor.
    Extracts structured fields from raw OCR text across Indian land records:
    - Form 7/12 (Saat-Baara)
    - Record of Rights (ROR / Patta Passbook)
    - Khatian / Jamabandi
    - Mutation Registers (Ferfar)
    """

    # Domain keywords & anchor patterns (strictly line-bounded)
    ANCHOR_PATTERNS = {
        "SURVEY_NO": [
            r'(?:survey\s*(?:no|number|\#)|सर्वे\s*क्र(?:मांक|\.)?|సర్వే\s*నంబరు|சர்வே\s*எண்|ಸರ್ವೇ\s*ನಂಬರ್)\s*[:\-]?\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;)',
            r'([0-9]{1,4}\s*[\/\-]\s*[0-9A-Za-z]+)'
        ],
        "KHASRA_NO": [
            r'(?:khasra\s*(?:no|number|\#)|खसरा\s*क्र(?:मांक|\.)?|ఖస్రా|பாகம்|ಖಸ್ರಾ)\s*[:\-]?\s*([0-9A-Za-z\/\-\u0900-\u097F]+?)(?=$|\r|\n|,|;)'
        ],
        "KHATA_NO": [
            r'(?:khata\s*(?:no|number|\#)|खाता\s*क्र(?:मांक|\.)?|ఖాతా\s*నం|பட்டா\s*எண்|ಖಾತಾ)\s*[:\-]?\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;)'
        ],
        "OWNER_NAME": [
            r'(?:land\s*owner|owner|landholder|titleholder|खातेदार|कब्जेदार|ഭൂവുടമ|பட்டாதாரர்|భూయజమాని|ಖಾತೆದಾರರು)\s*[:\-]?\s*([^\n\r\t,;]+)',
            r'(?:name\s*of\s*occupant|holder)\s*[:\-]?\s*([^\n\r\t,;]+)'
        ],
        "PLOT_AREA": [
            r'(?:plot\s*area|area|extent|क्षेत्रफळ|பரப்பளவு|విస్తీర్ణము|ವಿಸ್ತೀರ್ಣ)\s*[:\-]?\s*([0-9\.\,\s]+(?:\s*(?:acres?|hectares?|guntas?|bigha|cents?|एकर|हेक्टर|गुंठा|ஏக்கர்|சென்ட்|ఎకరాలు))?)'
        ],
        "LAND_CLASS": [
            r'(?:land\s*classification|land\s*class|classification|धारणा|जमीन\s*प्रकार|நஞ்சை|புஞ்சை|மெట్ట|ಜಮೀನು\s*ವಿವರ)\s*[:\-]?\s*([^\n\r\t]+)'
        ],
        "MUTATION_NO": [
            r'(?:mutation\s*(?:no|ref)|फेरफार\s*क्र(?:मांक|\.)?|మార్పు\s*నం|மாறுதல்\s*எண்)\s*[:\-]?\s*([0-9A-Za-z\/\-]+)'
        ],
        "REG_DATE": [
            r'(?:registration\s*date|date|दिनांक|नोंदणी\s*दिनांक|తేదీ|பதிவு\s*தேதி)\s*[:\-]?\s*([0-9]{4}[\-\/\.][0-9]{2}[\-\/\.][0-9]{2}|[0-9]{2}[\-\/\.][0-9]{2}[\-\/\.][0-9]{4})'
        ]
    }

    def extract_entities_from_text(self, raw_text: str, language: str = "hi") -> Dict[str, Any]:
        """
        Parses text and extracts named entities with confidence and normalized values.
        """
        normalized_doc = script_normalizer.normalize_text(raw_text)
        entities: Dict[str, Dict[str, Any]] = {}

        # 1. Survey Number
        survey_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["SURVEY_NO"])
        if survey_val:
            std_survey = script_normalizer.standardize_survey_number(survey_val)
            entities["SURVEY_NO"] = {
                "raw": survey_val,
                "normalized": std_survey,
                "confidence": 0.96 if "/" in std_survey or "-" in std_survey else 0.88,
                "bbox": {"x": 0.35, "y": 0.38, "width": 0.20, "height": 0.03, "page": 1}
            }

        # 2. Khasra Number
        khasra_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["KHASRA_NO"])
        if khasra_val:
            entities["KHASRA_NO"] = {
                "raw": khasra_val,
                "normalized": script_normalizer.convert_indic_numerals_to_ascii(khasra_val).strip(),
                "confidence": 0.91,
                "bbox": {"x": 0.58, "y": 0.38, "width": 0.18, "height": 0.03, "page": 1}
            }

        # 3. Khata Number
        khata_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["KHATA_NO"])
        if khata_val:
            entities["KHATA_NO"] = {
                "raw": khata_val,
                "normalized": script_normalizer.convert_indic_numerals_to_ascii(khata_val).strip(),
                "confidence": 0.93,
                "bbox": {"x": 0.35, "y": 0.34, "width": 0.25, "height": 0.03, "page": 1}
            }

        # 4. Owner Name
        owner_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["OWNER_NAME"])
        if owner_val:
            clean_owner = owner_val.strip(" ,.-:")
            entities["OWNER_NAME"] = {
                "raw": owner_val,
                "normalized": clean_owner,
                "confidence": 0.89 if len(clean_owner) > 3 else 0.58,
                "bbox": {"x": 0.35, "y": 0.42, "width": 0.45, "height": 0.04, "page": 1}
            }

        # 5. Plot Area & Square Meters
        area_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["PLOT_AREA"])
        if area_val:
            parsed_area = script_normalizer.parse_area_to_sqm(area_val)
            entities["PLOT_AREA"] = {
                "raw": area_val,
                "normalized": f"{parsed_area['numeric_value']} {parsed_area['unit']}",
                "sqm": parsed_area["sqm"],
                "confidence": 0.95,
                "bbox": {"x": 0.35, "y": 0.46, "width": 0.30, "height": 0.03, "page": 1}
            }

        # 6. Land Class
        land_class_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["LAND_CLASS"])
        if land_class_val:
            entities["LAND_CLASS"] = {
                "raw": land_class_val,
                "normalized": land_class_val.strip(),
                "confidence": 0.86,
                "bbox": {"x": 0.35, "y": 0.50, "width": 0.40, "height": 0.03, "page": 1}
            }

        # 7. Mutation & Reg Date
        mut_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["MUTATION_NO"])
        if mut_val:
            entities["MUTATION_NO"] = {
                "raw": mut_val,
                "normalized": mut_val.strip(),
                "confidence": 0.90,
                "bbox": {"x": 0.35, "y": 0.54, "width": 0.30, "height": 0.03, "page": 1}
            }

        date_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["REG_DATE"])
        if date_val:
            entities["REG_DATE"] = {
                "raw": date_val,
                "normalized": date_val.strip(),
                "confidence": 0.92,
                "bbox": {"x": 0.35, "y": 0.58, "width": 0.25, "height": 0.03, "page": 1}
            }

        return entities

    def _match_pattern(self, text: str, patterns: List[str]) -> Optional[str]:
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
        return None

entity_extractor = LandRecordEntityExtractor()

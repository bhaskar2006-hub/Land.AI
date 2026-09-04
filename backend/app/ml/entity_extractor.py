import re
from typing import Dict, Any, List, Optional
from backend.app.ml.script_normalizer import script_normalizer

class LandRecordEntityExtractor:
    """
    Domain-Specific Revenue NER & Attribute Extractor.
    Extracts structured fields from raw OCR text across Indian land records:
    - Form 7/12 (Saat-Baara / Satbara Utara)
    - Record of Rights (ROR / Patta Passbook / Meebhoomi / Dharani)
    - Khatian / Jamabandi / Apna Khata
    - Mutation Registers (Ferfar / Namantaran)
    """

    # Domain keywords & anchor patterns (supporting English + Indic scripts)
    ANCHOR_PATTERNS = {
        "SURVEY_NO": [
            r'(?:survey\s*(?:no|number|\#|num|code)?|सर्वे\s*क्र(?:मांक|\.)?|सर्वे\s*नं|సర్వే\s*(?:నంబరు|నం|నెం)?|சர்வே\s*(?:எண்|நெ)?|ಸರ್ವೇ\s*(?:ನಂಬರ್|ಸಂಖ್ಯೆ)?|সার্ভে\s*নং)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;|\|)',
            r'(?:gut\s*no|gat\s*no|गट\s*क्र(?:मांक|\.)?|गट\s*नं)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;|\|)',
            r'([0-9]{1,4}\s*[\/\-]\s*[0-9A-Za-z]{1,4})'
        ],
        "KHASRA_NO": [
            r'(?:khasra\s*(?:no|number|\#)?|खसरा\s*क्र(?:मांक|\.)?|खसरा\s*नं|ఖస్రా\s*(?:నెం|నం)?|பாகம்|ಖಸ್ರಾ\s*ಸಂಖ್ಯೆ?)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\u0900-\u097F]+?)(?=$|\r|\n|,|;|\|)',
            r'(?:khasra|खसरा)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\u0900-\u097F]+)'
        ],
        "KHATA_NO": [
            r'(?:khata\s*(?:no|number|\#)?|खाता\s*क्र(?:मांक|\.)?|खाता\s*संख्या|खाता\s*नं|ఖాతా\s*(?:నం|నెం)?|பட்டா\s*(?:எண்|நெ)?|ಖಾತಾ\s*ಸಂಖ್ಯೆ?|খতিয়ান\s*নং)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;|\|)',
            r'(?:patta\s*(?:no|number|\#)?|பட்டா)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;|\|)',
            r'(?:khatian\s*(?:no|number|\#)?|खतियान)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\s]+?)(?=$|\r|\n|,|;|\|)'
        ],
        "OWNER_NAME": [
            r'(?:land\s*owner|owner\s*name|owner|landholder|titleholder|pattadar|pattadhar|खातेदार|कब्जेदार|खातेदाराचे\s*नाव|जमीन\s*मालक|భూయజమాని|పట్టాదారు|பட்டாதாரர்|நில\s*உரிமையாளர்|ಖಾತೆದಾರರು|জমির\s*মালিক)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)',
            r'(?:name\s*of\s*(?:occupant|holder|tenant|farmer)|कास्तकार\s*का\s*नाम)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)'
        ],
        "PLOT_AREA": [
            r'(?:plot\s*area|total\s*area|area|extent|क्षेत्रफळ|एकूण\s*क्षेत्र|क्षेत्रफल|रकबा|విస్తీర్ణము|విస్తీర్ణం|பரப்பளவு|மொத்த\s*பரப்பு|ವಿಸ್ತೀರ್ಣ|মোট\s*পরিমাণ)\s*[:\-–—\.]*\s*([0-9\.\,\s]+(?:\s*(?:acres?|hectares?|ha|guntas?|bigha|cents?|sq\.?\s*m(?:eters?)?|sqft|एकर|हेक्टर|गुंठा|बीघा|ஏக்கர்|சென்ட்|ఎకరాలు|గుంటలు))?)'
        ],
        "DISTRICT": [
            r'(?:district|dist|जिला|जिल्हा|జిల్లా|மாவட்டம்|ಜಿಲ್ಲೆ|জেলা)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)'
        ],
        "TEHSIL": [
            r'(?:tehsil|taluka|taluk|mandal|sub[\-\s]*district|तहसील|तालुका|तालुक|మండలం|வட்டம்|தாலுகா|ತಾಲ್ಲೂಕು|ತಾಲೂಕು)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)'
        ],
        "VILLAGE": [
            r'(?:village|gram|mouza|गाव|ग्राम|गाँव|మౌజా|గ్రామం|கிராமம்|ಗ್ರಾಮ|গ্রাম)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)'
        ],
        "STATE": [
            r'(?:state|राज्य|రాష్ట్రం|மாநிலம்|ರಾಜ್ಯ|রাজ্য)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)'
        ],
        "LAND_CLASS": [
            r'(?:land\s*classification|land\s*class|land\s*type|classification|धारणा|जमीन\s*प्रकार|जमीन\s*धारणा|భూమి\s*రకం|நஞ்சை|புஞ்சை|நில\s*வகை|ಜಮೀನು\s*ವಿವರ)\s*[:\-–—\.]*\s*([^\n\r\t,;\|]+)'
        ],
        "MUTATION_NO": [
            r'(?:mutation\s*(?:no|number|\#|ref)|फेरफार\s*क्र(?:मांक|\.)?|फेरफार\s*नं|दाखिल\s*खारिज|మార్పు\s*నం|மாறுதல்\s*எண்|ನಾಮಾವಳಿ\s*ಸಂಖ್ಯೆ)\s*[:\-–—\.]*\s*([0-9A-Za-z\/\-\s]+)'
        ],
        "REG_DATE": [
            r'(?:registration\s*date|reg\s*date|issue\s*date|date|दिनांक|नोंदणी\s*दिनांक|తేదీ|నమోదు\s*తేదీ|பதிவு\s*தேதி|ದಿನಾಂಕ)\s*[:\-–—\.]*\s*([0-9]{4}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{1,2}|[0-9]{1,2}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{2,4})'
        ]
    }

    def extract_entities_from_text(self, raw_text: str, language: str = "hi") -> Dict[str, Any]:
        """
        Parses text and extracts named entities with confidence and normalized values.
        """
        if not raw_text or not raw_text.strip():
            return {}

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

        # 3. Khata Number / Patta Number
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
            clean_owner = self._clean_entity_text(owner_val)
            if len(clean_owner) >= 2:
                entities["OWNER_NAME"] = {
                    "raw": owner_val,
                    "normalized": clean_owner,
                    "confidence": 0.92 if len(clean_owner) > 3 else 0.68,
                    "bbox": {"x": 0.35, "y": 0.42, "width": 0.45, "height": 0.04, "page": 1}
                }

        # 5. Plot Area & Square Meters
        area_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["PLOT_AREA"])
        if area_val:
            parsed_area = script_normalizer.parse_area_to_sqm(area_val)
            entities["PLOT_AREA"] = {
                "raw": area_val,
                "normalized": f"{parsed_area['numeric_value']} {parsed_area['unit']}",
                "sqm": parsed_area.get("sqm", 0.0),
                "confidence": 0.95,
                "bbox": {"x": 0.35, "y": 0.46, "width": 0.30, "height": 0.03, "page": 1}
            }

        # 6. Geography: District, Tehsil, Village, State
        dist_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["DISTRICT"])
        if dist_val:
            entities["DISTRICT"] = {
                "raw": dist_val,
                "normalized": self._clean_entity_text(dist_val),
                "confidence": 0.95,
                "bbox": {"x": 0.55, "y": 0.26, "width": 0.25, "height": 0.03, "page": 1}
            }

        teh_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["TEHSIL"])
        if teh_val:
            entities["TEHSIL"] = {
                "raw": teh_val,
                "normalized": self._clean_entity_text(teh_val),
                "confidence": 0.93,
                "bbox": {"x": 0.35, "y": 0.30, "width": 0.20, "height": 0.03, "page": 1}
            }

        vil_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["VILLAGE"])
        if vil_val:
            entities["VILLAGE"] = {
                "raw": vil_val,
                "normalized": self._clean_entity_text(vil_val),
                "confidence": 0.94,
                "bbox": {"x": 0.55, "y": 0.30, "width": 0.25, "height": 0.03, "page": 1}
            }

        state_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["STATE"])
        if state_val:
            entities["STATE"] = {
                "raw": state_val,
                "normalized": self._clean_entity_text(state_val),
                "confidence": 0.97,
                "bbox": {"x": 0.35, "y": 0.26, "width": 0.20, "height": 0.03, "page": 1}
            }

        # 7. Land Class
        land_class_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["LAND_CLASS"])
        if land_class_val:
            clean_lc = self._clean_entity_text(land_class_val)
            entities["LAND_CLASS"] = {
                "raw": land_class_val,
                "normalized": clean_lc,
                "confidence": 0.88,
                "bbox": {"x": 0.35, "y": 0.50, "width": 0.40, "height": 0.03, "page": 1}
            }

        # 8. Mutation & Reg Date
        mut_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["MUTATION_NO"])
        if mut_val:
            entities["MUTATION_NO"] = {
                "raw": mut_val,
                "normalized": self._clean_entity_text(mut_val),
                "confidence": 0.90,
                "bbox": {"x": 0.35, "y": 0.54, "width": 0.30, "height": 0.03, "page": 1}
            }

        date_val = self._match_pattern(normalized_doc, self.ANCHOR_PATTERNS["REG_DATE"])
        if date_val:
            entities["REG_DATE"] = {
                "raw": date_val,
                "normalized": self._clean_entity_text(date_val),
                "confidence": 0.92,
                "bbox": {"x": 0.35, "y": 0.58, "width": 0.25, "height": 0.03, "page": 1}
            }

        return entities

    def _clean_entity_text(self, text: str) -> str:
        """Removes trailing delimiters, extra whitespace and unwanted markers."""
        cleaned = re.sub(r'[\r\n\t]+', ' ', text)
        cleaned = re.sub(r'^[\|\:\-\—\.\,\s]+|[\|\:\-\—\.\,\s]+$', '', cleaned)
        return cleaned.strip()

    def _match_pattern(self, text: str, patterns: List[str]) -> Optional[str]:
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                candidate = match.group(1).strip()
                # Exclude empty or punctuation-only strings
                if candidate and not re.match(r'^[\:\-\.\,\s\|]+$', candidate):
                    return candidate
        return None

entity_extractor = LandRecordEntityExtractor()


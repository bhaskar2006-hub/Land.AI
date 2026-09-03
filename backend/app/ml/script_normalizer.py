import re
import unicodedata
from typing import Dict, Any, Optional

class IndicScriptNormalizer:
    """
    Normalizes Indic script strings:
    - Unicode NFC normalization
    - Indic numeral to standard ASCII conversion (Devanagari, Tamil, Telugu, Kannada, Bengali, etc.)
    - Normalization of Zero-Width Non-Joiners (ZWNJ) and Joiners (ZWJ)
    - Revenue term standardization
    """
    
    # Digit mappings for Indic scripts to ASCII digits
    INDIC_DIGIT_MAP = {
        # Devanagari (Hindi / Marathi)
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
        # Tamil
        '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
        # Telugu
        '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
        # Kannada
        '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
        # Bengali
        '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
        # Gujarati
        '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
    }

    # Revenue Measurement Units standard multipliers (to Square Meters)
    AREA_UNIT_MULTIPLIERS = {
        'acres': ('Acres', 4046.8564224),
        'acre': ('Acres', 4046.8564224),
        'एकर': ('Acres', 4046.8564224),
        'ஏக்கர்': ('Acres', 4046.8564224),
        'ಎಕರೆ': ('Acres', 4046.8564224),
        'ఎకరాలు': ('Acres', 4046.8564224),
        
        'hectares': ('Hectares', 10000.0),
        'hectare': ('Hectares', 10000.0),
        'हेक्टर': ('Hectares', 10000.0),
        'ஹெக்டேர்': ('Hectares', 10000.0),
        'ಹೆಕ್ಟೇರ್': ('Hectares', 10000.0),
        'హెక్టార్లు': ('Hectares', 10000.0),

        'guntha': ('Guntas', 101.17141056),
        'gunta': ('Guntas', 101.17141056),
        'गुंठा': ('Guntas', 101.17141056),
        'గుంట': ('Guntas', 101.17141056),
        'ಗುಂಟೆ': ('Guntas', 101.17141056),

        'bigha': ('Bigha', 2529.285264),
        'बीघा': ('Bigha', 2529.285264),
        
        'cents': ('Cents', 40.468564224),
        'cent': ('Cents', 40.468564224),
        'சென்ட்': ('Cents', 40.468564224),
        'సెంట్': ('Cents', 40.468564224),
        'ಸೆಂಟ್': ('Cents', 40.468564224),

        'sqm': ('Sq. Meters', 1.0),
        'sq_m': ('Sq. Meters', 1.0),
        'चौ.मी.': ('Sq. Meters', 1.0),
        'சதுர மீட்டர்': ('Sq. Meters', 1.0)
    }

    def normalize_text(self, text: Optional[str]) -> str:
        if not text:
            return ""
        
        # 1. Unicode NFC Normalization
        normalized = unicodedata.normalize('NFC', text)
        
        # 2. Clean Zero-Width characters
        normalized = normalized.replace('\u200b', '').replace('\u200c', '').replace('\u200d', '')
        
        # 3. Strip duplicate whitespaces
        normalized = re.sub(r'[ \t]+', ' ', normalized).strip()
        
        return normalized

    def convert_indic_numerals_to_ascii(self, text: str) -> str:
        """Converts any Indic numerals (Devanagari, Tamil, Telugu, etc.) to standard ASCII digits."""
        if not text:
            return ""
        chars = []
        for ch in text:
            chars.append(self.INDIC_DIGIT_MAP.get(ch, ch))
        return "".join(chars)

    def standardize_survey_number(self, raw_survey: str) -> str:
        """
        Cleans and formats survey numbers like '१२३ / ४ अ' -> '123/4A'
        """
        if not raw_survey:
            return ""
        cleaned = self.convert_indic_numerals_to_ascii(raw_survey)
        cleaned = self.normalize_text(cleaned)
        # Take first line if multiple
        cleaned = cleaned.splitlines()[0]
        # Remove whitespace around slashes and hyphens
        cleaned = re.sub(r'\s*/\s*', '/', cleaned)
        cleaned = re.sub(r'\s*-\s*', '-', cleaned)
        cleaned = re.sub(r'\s*\.\s*', '.', cleaned)
        return cleaned.strip()

    def parse_area_to_sqm(self, raw_area: str) -> Dict[str, Any]:
        """
        Parses raw land area strings in multiple languages and converts to square meters.
        e.g., '2.50 Acres' or '२.५ एकर' or '1.01 Hectares'
        """
        if not raw_area:
            return {"numeric_value": 0.0, "unit": "Acres", "sqm": 0.0}

        cleaned = self.convert_indic_numerals_to_ascii(raw_area)
        cleaned_lower = cleaned.lower()
        
        # Extract numerical digits
        match = re.search(r'[-+]?(?:\d*\.\d+|\d+)', cleaned)
        num_val = float(match.group(0)) if match else 1.0

        # Identify unit
        detected_unit = "Acres"
        multiplier = 4046.8564224

        for unit_key, (std_name, mult) in self.AREA_UNIT_MULTIPLIERS.items():
            if unit_key in cleaned_lower:
                detected_unit = std_name
                multiplier = mult
                break

        return {
            "numeric_value": num_val,
            "unit": detected_unit,
            "sqm": round(num_val * multiplier, 4),
            "raw": raw_area
        }

script_normalizer = IndicScriptNormalizer()

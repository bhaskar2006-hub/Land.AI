"""
Unified Land Entity Schema & Standard Unit Normalizer:
Maps vernacular regional attributes to canonical national standard keys:
- Land Parcel ID: Survey No., Khasra, Gat, Dag
- Account/Holder: Khata No., Patta No., Jamabandi Khewat/Khatouni
- Area & Units: Guntha, Bigha, Acre, Cent, Kanal, Biswa -> SI Square Meters & Hectares
- Tenure/Class: Wet (Nanja), Dry (Punja), Inam, Abadi, Bagayat, Jirayat, Barani
"""

import re
from typing import Dict, Any, Optional

# Canonical SI Multipliers to Square Meters (m²)
AREA_CONVERSION_FACTORS = {
    # Standard Imperial & Metric
    "sqm": ("Sq. Meter", 1.0),
    "sq_m": ("Sq. Meter", 1.0),
    "square_meter": ("Sq. Meter", 1.0),
    "square_meters": ("Sq. Meter", 1.0),
    "hectare": ("Hectare", 10000.0),
    "hectares": ("Hectare", 10000.0),
    "ha": ("Hectare", 10000.0),
    "acre": ("Acre", 4046.8564),
    "acres": ("Acre", 4046.8564),
    "cent": ("Cent", 40.4686),
    "cents": ("Cent", 40.4686),

    # Deccan & Western India (Maharashtra, Gujarat, Karnataka, Telangana)
    "guntha": ("Guntha", 101.1714),
    "gunta": ("Guntha", 101.1714),
    "guntas": ("Guntha", 101.1714),
    "gunthas": ("Guntha", 101.1714),
    "गुंठा": ("Guntha", 101.1714),
    "గుంట": ("Guntha", 101.1714),
    "ಗುಂಟೆ": ("Guntha", 101.1714),

    # Northern & Central India (UP, Rajasthan, MP, Bihar, Punjab, Haryana)
    "bigha": ("Bigha", 2529.285),
    "bighas": ("Bigha", 2529.285),
    "बीघा": ("Bigha", 2529.285),
    "biswa": ("Biswa", 126.464),
    "biswas": ("Biswa", 126.464),
    "बिस्वा": ("Biswa", 126.464),
    "kanal": ("Kanal", 505.857),
    "kanals": ("Kanal", 505.857),
    "कनाल": ("Kanal", 505.857),
    "marla": ("Marla", 25.2928),
    "marlas": ("Marla", 25.2928),
    "मरला": ("Marla", 25.2928),
    "katha": ("Katha", 126.464),
    "कट्ठा": ("Katha", 126.464),

    # Southern India (Tamil Nadu, Kerala, Andhra Pradesh)
    "ground": ("Ground", 222.967),
    "ankanam": ("Ankanam", 6.689),
    "kuzhi": ("Kuzhi", 13.378),
    "ஏக்கர்": ("Acre", 4046.8564),
    "சென்ட்": ("Cent", 40.4686),
    "హెక్టార్లు": ("Hectare", 10000.0),
    "ఎకరాలు": ("Acre", 4046.8564)
}

TENURE_CLASS_MAP = {
    # Wet Land
    "nanja": "WET_LAND",
    "wet": "WET_LAND",
    "நஞ்சை": "WET_LAND",
    "chane": "WET_LAND",
    "bagayat": "ORCHARD_GARDEN",
    "बागायत": "ORCHARD_GARDEN",
    
    # Dry Land
    "punja": "DRY_LAND",
    "dry": "DRY_LAND",
    "புஞ்சை": "DRY_LAND",
    "jirayat": "DRY_LAND",
    "जिरायत": "DRY_LAND",
    "barani": "RAIN_FED_DRY",
    "बारानी": "RAIN_FED_DRY",

    # Special / Govt / Inam
    "inam": "INAM_GRANT",
    "इनाम": "INAM_GRANT",
    "abadi": "VILLAGE_SETTLEMENT_ABADI",
    "आबादी": "VILLAGE_SETTLEMENT_ABADI",
    "gair_mumkin": "UNPRODUCTIVE_WASTELAND",
    "plantation": "PLANTATION_ESTATE",
    "agricultural": "AGRICULTURAL"
}

class UnifiedLandEntitySchema:
    """
    Standardizes raw multilingual land records into national DILRMP schema.
    """

    @staticmethod
    def normalize_area(raw_area_str: str) -> Dict[str, Any]:
        """
        Extracts numeric values and normalizes to standard SI Hectares and Square Meters.
        """
        if not raw_area_str:
            return {"sqm": 0.0, "hectares": 0.0, "raw": "", "detected_unit": "Unknown"}

        # Extract floating/integer values
        numbers = re.findall(r"[-+]?(?:\d*\.\d+|\d+)", raw_area_str.replace(",", ""))
        numeric_val = float(numbers[0]) if numbers else 1.0

        lower_str = raw_area_str.lower()
        multiplier = 4046.8564 # default to acre if unknown
        detected_unit = "Acre"

        # Check sorted by longest key first to avoid substring false positives (e.g. 'ha' in 'guntha')
        sorted_units = sorted(AREA_CONVERSION_FACTORS.items(), key=lambda x: len(x[0]), reverse=True)
        for unit_key, (canon_name, factor) in sorted_units:
            if unit_key in lower_str:
                multiplier = factor
                detected_unit = canon_name
                break

        sqm = round(numeric_val * multiplier, 4)
        hectares = round(sqm / 10000.0, 4)

        return {
            "sqm": sqm,
            "hectares": hectares,
            "numeric_value": numeric_val,
            "detected_unit": detected_unit,
            "raw": raw_area_str
        }

    @staticmethod
    def normalize_tenure_class(raw_class_str: str) -> str:
        """
        Categorizes tenure/class to standard national registry values.
        """
        if not raw_class_str:
            return "AGRICULTURAL"

        lower_str = raw_class_str.lower().strip()
        for key, val in TENURE_CLASS_MAP.items():
            if key in lower_str:
                return val

        return "AGRICULTURAL"

    @staticmethod
    def map_to_unified_record(extracted_fields: Dict[str, Any]) -> Dict[str, Any]:
        """
        Produces unified schema record with national keys.
        """
        survey_raw = extracted_fields.get("SURVEY_NO", "")
        khata_raw = extracted_fields.get("KHATA_NO", "")
        owner_raw = extracted_fields.get("OWNER_NAME", "")
        area_raw = extracted_fields.get("PLOT_AREA", "")
        class_raw = extracted_fields.get("LAND_CLASS", "")

        area_norm = UnifiedLandEntitySchema.normalize_area(area_raw)
        tenure_norm = UnifiedLandEntitySchema.normalize_tenure_class(class_raw)

        return {
            "national_parcel_id": survey_raw.strip(),
            "account_holder_ref": khata_raw.strip(),
            "owner_titleholder": owner_raw.strip(),
            "area_metrics": {
                "area_sqm": area_norm["sqm"],
                "area_hectares": area_norm["hectares"],
                "original_stated_area": area_raw
            },
            "tenure_classification": tenure_norm,
            "is_national_schema_compliant": True
        }

unified_schema = UnifiedLandEntitySchema()

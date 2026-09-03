"""
National Land Records Modernization Programme (DILRMP) & State System Export Adapters:
Transforms validated ILRDVS land records into state-specific and national enterprise schemas:
1. DILRMP National API JSON
2. Bhoomi Karnataka XML / JSON
3. Dharani Telangana Revenue Schema
4. Mahabhulekh Maharashtra e-Satbara JSON
"""

import json
from typing import Dict, Any, List

class NationalSystemExportAdapters:
    """
    Adapter suite translating canonical ILRDVS records into statutory state LRMS formats.
    """

    @staticmethod
    def export_dilrmp_national(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        DILRMP Standard National Registry Format.
        """
        return {
            "schema_version": "DILRMP-2.0-2024",
            "ulpin_14_digit": record.get("ulpin", "KA60457A9B1C2D"),
            "state_lgd_code": record.get("state_code", "KA"),
            "district_lgd_code": record.get("district_code", "NILGIRIS"),
            "sub_district_lgd_code": record.get("tehsil_code", "UDHAGAMANDALAM"),
            "village_lgd_code": record.get("village_code", "KOTAGIRI"),
            "cadastral_survey_no": record.get("survey_no", "123/4A"),
            "land_parcel": {
                "gis_area_hectares": record.get("area_hectares", 1.012),
                "gis_area_sqm": record.get("area_sqm", 10117.14),
                "tenure_category": record.get("land_class", "AGRICULTURAL"),
                "is_litigation_pending": record.get("is_disputed", False)
            },
            "ownership_records": [
                {
                    "titleholder_name": record.get("owner_name", "Ramesh Kumar"),
                    "titleholder_local_script": record.get("owner_name_local", "ரமேஷ் குமார்"),
                    "share_ratio": "1/1",
                    "patta_khata_number": record.get("khata_no", "Khata-908")
                }
            ],
            "digital_seal": {
                "sha256_hash": record.get("hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
                "signed_by": "District Revenue Officer",
                "timestamp_utc": "2024-09-03T20:00:00Z"
            }
        }

    @staticmethod
    def export_bhoomi_karnataka(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Karnataka Bhoomi (RTC - Record of Rights, Tenancy and Crops) format.
        """
        return {
            "bhoomi_rtc": {
                "district": record.get("district", "Mysuru"),
                "taluk": record.get("tehsil", "Hunsur"),
                "hobli": "Kasaba",
                "village": record.get("village", "Kodanad"),
                "survey_no": record.get("survey_no", "123/4A"),
                "hissa_no": "4A",
                "khathedar_details": {
                    "khathe_no": record.get("khata_no", "Khata-908"),
                    "owner_kannada": record.get("owner_name_local", "ರಮೇಶ್ ಕುಮಾರ್ ಗೌಡ"),
                    "owner_english": record.get("owner_name", "Ramesh Kumar"),
                    "extent_acres_guntas": record.get("area_raw", "2-20"),
                    "kandaya_rs": "45.00"
                },
                "mutation_details": {
                    "m_number": record.get("mutation_no", "MR-2024/0014"),
                    "status": "APPROVED_SEALED"
                }
            }
        }

    @staticmethod
    def export_dharani_telangana(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Telangana Dharani Integrated Land Records Management System format.
        """
        return {
            "dharani_passbook": {
                "passbook_number": f"T{record.get('khata_no', '3420')}",
                "district_name": record.get("district", "Guntur"),
                "mandal_name": record.get("tehsil", "Tenali"),
                "village_name": record.get("village", "Angalakuduru"),
                "survey_subdivision": record.get("survey_no", "214/1B"),
                "pattadar_name": record.get("owner_name", "Venkateswara Rao"),
                "pattadar_telugu": record.get("owner_name_local", "వెంకటేశ్వర రావు"),
                "total_extent_acres": record.get("area_raw", "2.50 Acres"),
                "land_nature": record.get("land_class", "Patta / Agricultural"),
                "encumbrance_status": "NONE" if not record.get("is_disputed") else "DISPUTED"
            }
        }

    @staticmethod
    def export_mahabhulekh_maharashtra(record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maharashtra Mahabhulekh (e-Satbara / Form 7/12) format.
        """
        return {
            "satbara_7_12": {
                "district": record.get("district", "Nashik"),
                "taluka": record.get("tehsil", "Igatpuri"),
                "village": record.get("village", "Khambale"),
                "survey_gut_no": record.get("survey_no", "142/2A"),
                "khata_no": record.get("khata_no", "K-889"),
                "kabjedar_owner": {
                    "name_marathi": record.get("owner_name_local", "तुकाराम गणपत पाटील"),
                    "name_english": record.get("owner_name", "Tukaram Ganpat Patil")
                },
                "area_hectares": record.get("area_hectares", 1.84),
                "potkharaba_unfit_area": 0.0,
                "assessment_tax": "Rs. 120",
                "other_rights_boja": "Encumbrance Free" if not record.get("is_disputed") else "Active Mortgage"
            }
        }

export_adapters = NationalSystemExportAdapters()

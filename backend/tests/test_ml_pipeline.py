import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.script_normalizer import script_normalizer
from backend.app.ml.entity_extractor import entity_extractor
from backend.app.ml.confidence_scorer import confidence_scorer
from backend.app.ml.active_learning import active_learning_pipeline

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_indic_script_normalizer_digits():
    # Devanagari numerals
    dev_text = "सर्वे क्र. १२३/४ अ"
    converted = script_normalizer.convert_indic_numerals_to_ascii(dev_text)
    assert "123/4" in converted

    # Tamil numerals
    tam_text = "சர்வே ௧௨௩/௪"
    converted_tam = script_normalizer.convert_indic_numerals_to_ascii(tam_text)
    assert "123/4" in converted_tam

    # Telugu numerals
    tel_text = "సర్వే ౨౧౪/౧"
    converted_tel = script_normalizer.convert_indic_numerals_to_ascii(tel_text)
    assert "214/1" in converted_tel

def test_survey_number_standardization():
    raw = "  १४२ / २ A  "
    std = script_normalizer.standardize_survey_number(raw)
    assert std == "142/2 A" or std == "142/2A"

def test_area_unit_conversion():
    # 2.50 Acres to Sq. Meters
    acre_res = script_normalizer.parse_area_to_sqm("2.50 Acres")
    assert acre_res["numeric_value"] == 2.50
    assert acre_res["unit"] == "Acres"
    assert round(acre_res["sqm"]) == 10117

    # 1.00 Hectares to Sq. Meters
    hec_res = script_normalizer.parse_area_to_sqm("1.00 हेक्टर")
    assert hec_res["numeric_value"] == 1.0
    assert hec_res["sqm"] == 10000.0

def test_revenue_entity_extractor():
    sample_ocr = """
    GOVERNMENT OF TAMIL NADU REVENUE DEPARTMENT
    Survey No: 123/4A
    Khasra No: 456-B
    Khata No: Khata-908
    Land Owner: Ramesh Kumar
    Plot Area: 2.50 Acres
    Land Classification: Plantation (Tea Garden)
    Mutation No: M-8842/2024
    Registration Date: 2024-03-14
    """
    entities = entity_extractor.extract_entities_from_text(sample_ocr, language="ta")
    assert "SURVEY_NO" in entities
    assert entities["SURVEY_NO"]["normalized"] == "123/4A"
    assert "OWNER_NAME" in entities
    assert entities["OWNER_NAME"]["normalized"] == "Ramesh Kumar"
    assert "PLOT_AREA" in entities
    assert entities["PLOT_AREA"]["sqm"] > 0

def test_confidence_scorer_tiers():
    # High confidence field
    high_eval = confidence_scorer.compute_field_confidence("123/4A", "123/4A", ocr_confidence=0.98, ner_confidence=0.95, pattern_match=True)
    assert high_eval["tier"] == "HIGH"
    assert not high_eval["needs_review"]

    # Low confidence field
    low_eval = confidence_scorer.compute_field_confidence("?", "", ocr_confidence=0.40, ner_confidence=0.30, pattern_match=False)
    assert low_eval["tier"] == "LOW"
    assert low_eval["needs_review"]

def test_active_learning_logging():
    sample = active_learning_pipeline.log_correction_sample(
        doc_id="test-doc-001",
        field_type="OWNER_NAME",
        raw_ocr_value="Rmesh Kmr",
        verified_value="Ramesh Kumar",
        initial_confidence=0.55,
        language="ta",
        verifier_id="test_verifier"
    )
    assert sample["is_correction"] is True
    assert sample["doc_id"] == "test-doc-001"

    stats = active_learning_pipeline.get_corpus_statistics()
    assert stats["total_annotated_samples"] >= 1

def test_ml_api_endpoints(client):
    # Test script normalization endpoint
    norm_resp = client.post(
        "/api/v1/ml/normalize-script",
        json={"text": "सर्वे क्र. १४२/२ अ, क्षेत्रफळ २.५ एकर"}
    )
    assert norm_resp.status_code == 200
    norm_data = norm_resp.json()
    assert "142/2" in norm_data["ascii_digits"]

    # Test entity parsing endpoint
    parse_resp = client.post(
        "/api/v1/ml/parse-entities",
        json={"raw_ocr_text": "Survey No: 123/4A\nOwner: Ramesh Kumar\nArea: 2.5 Acres", "language": "ta"}
    )
    assert parse_resp.status_code == 200
    parse_data = parse_resp.json()
    assert parse_data["entities_count"] >= 3

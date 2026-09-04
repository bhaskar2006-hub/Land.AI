import os
import sys
import time

try:
    import numpy as np
except ImportError:
    np = None

from PIL import Image, ImageDraw, ImageFont

def create_synthetic_land_record_image() -> Image.Image:
    """Generates a synthetic land record sample image to test OCR."""
    img = Image.new("RGB", (700, 250), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Sample land record details
    draw.text((30, 25), "GOVERNMENT LAND RECORD & REVENUE DEPARTMENT", fill=(0, 0, 0))
    draw.text((30, 65), "State: Maharashtra | Village: Nashik", fill=(0, 0, 0))
    draw.text((30, 105), "Survey / Khasra No: 142/2A", fill=(0, 0, 0))
    draw.text((30, 145), "Owner: Ramesh Shankar Patil", fill=(0, 0, 0))
    draw.text((30, 185), "Total Area: 1.45 Hectares", fill=(0, 0, 0))
    
    return img

def test_paddleocr_installation_and_inference():
    print("=" * 60)
    print("STEP 1: Checking Paddle & PaddleOCR Imports...")
    print("=" * 60)

    try:
        import paddle
        import paddleocr
        print(f" PaddlePaddle Version: {paddle.__version__}")
        print(f" PaddleOCR Version:    {paddleocr.__version__}")
        print(f" CUDA Available:       {paddle.is_compiled_with_cuda()}")
    except ImportError as e:
        print(f" [NOTICE]: {e}")
        print(" Using lightweight CPU fallback wrapper until paddle binary is loaded.")

    print("\n" + "=" * 60)
    print("STEP 2: Initializing PaddleOCR Engine...")
    print("=" * 60)

    from backend.app.services.ocr_engine import PaddleOCREngine
    
    t0 = time.time()
    engine = PaddleOCREngine(default_lang="en", use_gpu=False)
    print(f" Engine initialized in {time.time() - t0:.2f}s")

    print("\n" + "=" * 60)
    print("STEP 3: Running OCR on Synthetic Land Record Image...")
    print("=" * 60)

    test_image = create_synthetic_land_record_image()
    
    t1 = time.time()
    result = engine.extract_text(test_image, lang="en")
    inference_time = time.time() - t1

    print(f" Inference completed in: {inference_time:.2f}s")
    print(f" Average Confidence:     {result['average_confidence'] * 100:.1f}%")
    print(f" Total Lines Detected:   {result['total_lines']}")
    print("\n--- Extracted Text ---")
    print(result["full_text"])
    print("----------------------")

    # Verification criteria
    expected_keywords = ["142/2A", "Patil", "Area", "Revenue", "Maharashtra"]
    found = [kw for kw in expected_keywords if kw.lower() in result["full_text"].lower()]

    if len(found) >= 2 and result["average_confidence"] > 0.70:
        print(f"\n OCR TEST PASSED! Successfully matched keywords: {found}")
    else:
        print(f"\n [WARNING] Low OCR accuracy or missing keywords: {found}")

    print("\n" + "=" * 60)
    print("STEP 4: Testing Sample PDFs (if available)...")
    print("=" * 60)
    
    sample_pdf_paths = [
        "sample_pdfs/7_12_Extract_Nashik_Survey142_2A.pdf",
        "sample_pdfs/Jamabandi_Rajasthan_Barmer_Khasra482.pdf"
    ]

    for pdf_path in sample_pdf_paths:
        if os.path.exists(pdf_path):
            print(f"Testing real document: {pdf_path}")
            pdf_result = engine.extract_text(pdf_path, lang="hi")
            print(f" -> Pages: {pdf_result['total_pages']}, Lines: {pdf_result['total_lines']}, Avg Conf: {pdf_result['average_confidence']}")
        else:
            print(f" Sample PDF '{pdf_path}' not found at relative path (skipping).")

if __name__ == "__main__":
    test_paddleocr_installation_and_inference()

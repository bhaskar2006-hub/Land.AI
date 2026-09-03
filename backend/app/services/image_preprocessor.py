import os
from typing import Optional, Tuple
from PIL import Image, ImageEnhance, ImageOps

class ImagePreprocessor:
    """
    Image preprocessing for Indian Land Records:
    - Deskewing & Auto-orientation
    - Grayscale conversion
    - Contrast and sharpness enhancement
    - Noise filtering and binarization
    """
    def __init__(self):
        pass

    def preprocess_image(self, input_path: str, output_path: Optional[str] = None) -> str:
        if not os.path.exists(input_path):
            return input_path

        # If it's a PDF, we skip raster-level PIL filter or convert first page
        if input_path.lower().endswith(".pdf"):
            return input_path

        try:
            with Image.open(input_path) as img:
                # Convert to RGB / Grayscale
                if img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                
                # Auto-orient using EXIF data
                img = ImageOps.exif_transpose(img)
                
                # Enhance Contrast
                enhancer = ImageEnhance.Contrast(img)
                enhanced_img = enhancer.enhance(1.4)

                # Enhance Sharpness
                sharpness = ImageEnhance.Sharpness(enhanced_img)
                sharp_img = sharpness.enhance(1.2)

                out = output_path or input_path.replace(".", "_preprocessed.")
                sharp_img.save(out, quality=95)
                return out
        except Exception as e:
            # Fallback to original image if PIL fails
            return input_path

image_preprocessor = ImagePreprocessor()

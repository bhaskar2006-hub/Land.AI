import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ILRDVS Backend"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ilrdvs-super-secure-secret-key-national-land-system-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (defaults to local SQLite for zero-config run, switchable to PostgreSQL via env)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ilrdvs.db")
    
    # Storage (Local disk fallback or MinIO / S3)
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # "local" or "minio"
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./storage/uploads")
    PROCESSED_DIR: str = os.getenv("PROCESSED_DIR", "./storage/processed")
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "jpg", "jpeg", "png", "tiff", "tif"]
    
    # MinIO / S3 (optional)
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET: str = os.getenv("MINIO_BUCKET", "land-records")
    MINIO_SECURE: bool = False
    
    # Redis / Celery (optional)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # AI/ML & OCR Confidence Thresholds
    CONFIDENCE_HIGH_THRESHOLD: float = 0.75
    CONFIDENCE_LOW_THRESHOLD: float = 0.55
    
    # Google Cloud Vision OCR
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "backend/credentials/gcp_vision_credentials.json")
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "hip-cyclist-478906-t1")
    VISION_OCR_ENABLED: bool = os.getenv("VISION_OCR_ENABLED", "true").lower() in ("true", "1", "yes")
    VISION_FEATURE_TYPE: str = os.getenv("VISION_FEATURE_TYPE", "DOCUMENT_TEXT_DETECTION")
    VISION_TIMEOUT_SECONDS: float = float(os.getenv("VISION_TIMEOUT_SECONDS", "45.0"))
    
    # Gemini Multimodal OCR
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_TIMEOUT_SECONDS: float = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "60.0"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
